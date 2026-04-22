from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks
from app.services.s3_service import gen_presigned_url, get_s3_client, BUCKET
from io import BytesIO
from app.services.mongo import file_service
from app.db.mongo_connection import files_collection, folders_collection
from app.core.index_manager import index_manager
from typing import Optional, List
import numpy as np
import cv2
from insightface.app import FaceAnalysis
from bson import ObjectId

# Initialize InsightFace model globally with memory optimizations for Render Free Tier
app = FaceAnalysis(name='buffalo_s', allowed_modules=['detection', 'recognition'])
app.prepare(ctx_id=-1, det_size=(640, 640)) # ctx_id=-1 forces CPU usage


router = APIRouter(
    prefix="/s3-test",
    tags=["S3 Test"]
)

@router.post("/")
async def upload_files(
    background_tasks: BackgroundTasks,
    user_id: str = Form(...),
    folder_id: Optional[str] = Form(None),
    files: List[UploadFile] = File(...)
):
    results = []
    
    for file in files:
        try:
            # Step A: Read file bytes ONCE
            contents = await file.read()
            
            # Step B: Upload to S3 & Create DB Record (Synchronous)
            # Use BytesIO to pass file-like object to service
            result = file_service.create_file(
                user_id, 
                BytesIO(contents), 
                file.filename, 
                folder_id, 
                embedding=None, 
                status="pending"
            )

            # Step C: Add Background Task
            # Pass raw bytes to background task (no S3 download)
            background_tasks.add_task(
                process_embedding_task,
                result["file_id"],
                user_id,
                contents
            )
            
            results.append(result)
            
        except Exception as e:
            print(f"Error uploading file {file.filename}: {e}")
            # Optionally append error details to results or continue
            results.append({"filename": file.filename, "error": str(e), "status": "failed"})

    return results


def process_embedding_task(file_id: str, user_id: str, file_bytes: bytes):
    try:
        # A - Convert Bytes to Image (No S3 Download)
        np_img = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        if img is None:
            print(f"Failed to decode image for file {file_id}")
            files_collection.update_one(
                {"_id": ObjectId(file_id)},
                {"$set": {"status": "failed"}}
            )
            return

        # C - Extract Embedding
        faces = app.get(img)
        if len(faces) == 0:
            print(f"No face detected for file {file_id}")
            files_collection.update_one(
                {"_id": ObjectId(file_id)},
                {"$set": {"status": "failed"}}
            )
            return

        embedding = faces[0].embedding.tolist()

        # D - Update Mongo
        files_collection.update_one(
            {"_id": ObjectId(file_id)},
            {"$set": {
                "embedding": embedding,
                "status": "ready"
            }}
        )

        # E - Update IndexManager
        index_manager.add_embedding("global", file_id, embedding)
        print(f"Successfully processed embedding for file {file_id}")

    except Exception as e:
        print(f"Error processing embedding for {file_id}: {e}")
        files_collection.update_one(
            {"_id": ObjectId(file_id)},
            {"$set": {"status": "failed"}}
        )


@router.get("/get-file/")
def get_file(object_key: str):
    try:
        url = gen_presigned_url(object_key)
        return {
            "download_url": url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search/")
async def search_faces(
    user_id: str = Form(...),
    file: UploadFile = File(...),
    skip: int = Form(0),
    limit: int = Form(10)
):
    # Step A: Read and Decode Image
    contents = await file.read()
    np_img = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    # Step B: Extract Embedding
    faces = app.get(img)

    if len(faces) == 0:
        raise HTTPException(status_code=400, detail="No face detected")

    embedding = faces[0].embedding.tolist()

    # Global Search: scan all photos in the system
    results = index_manager.search("global", embedding, top_k=skip + limit)

    if not results:
        return []

    # Step D: Apply Pagination (Skip and Limit)
    paginated_results = results[skip : skip + limit]

    if not paginated_results:
        return []

    # Step E: Fetch File Metadata
    file_ids = [ObjectId(r["file_id"]) for r in paginated_results]

    files = list(files_collection.find({
        "_id": {"$in": file_ids}
    }))

    # Map files by ID for O(1) access
    files_map = {str(f["_id"]): f for f in files}

    # Step F: Build Response
    response = []
    for r in paginated_results:
        file_id = r["file_id"]
        file_doc = files_map.get(file_id)
        
        if file_doc:
            object_key = file_doc.get("object_key", "")
            response.append({
                "file_id": file_id,
                "object_key": object_key,
                "url": gen_presigned_url(object_key),
                "similarity": r["similarity"]
            })

    return response


@router.delete("/files/{file_id}")
def delete_file(file_id: str, user_id: str):
    user_id = user_id.strip()
    try:
        user_oid = ObjectId(user_id)
        file_oid = ObjectId(file_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    # verify ownership
    file_doc = files_collection.find_one({"_id": file_oid, "user_id": user_oid})
    if not file_doc:
         raise HTTPException(status_code=404, detail="File not found")

    # get object_key
    object_key = file_doc.get("object_key")

    # delete from S3
    if object_key:
        s3 = get_s3_client()
        try:
            s3.delete_object(Bucket=BUCKET, Key=object_key)
        except Exception as e:
            print(f"Error deleting from S3: {e}") 
            # proceed to delete from db anyway to keep consistent

    # delete from Mongo
    files_collection.delete_one({"_id": file_oid})

    # remove from index
    # We rebuild the index to ensure consistency as HNSW doesn't support easy deletion.
    index_manager.remove_embedding(user_id, file_id)

    return {"message": "File deleted successfully"}


@router.delete("/folders/{folder_id}")
def delete_folder(folder_id: str, user_id: str):
    user_id = user_id.strip()
    try:
        user_oid = ObjectId(user_id)
        folder_oid = ObjectId(folder_id)
    except:
         raise HTTPException(status_code=400, detail="Invalid ID format")

    # verify folder ownership
    folder_doc = folders_collection.find_one({"_id": folder_oid, "user_id": user_oid})
    if not folder_doc:
         raise HTTPException(status_code=404, detail="Folder not found")

    # find all files in folder
    files = list(files_collection.find({"folder_id": folder_oid, "user_id": user_oid}))
    
    # delete from S3
    if files:
        object_keys = [{"Key": f["object_key"]} for f in files if f.get("object_key")]
        if object_keys:
            s3 = get_s3_client()
            try:
                # s3.delete_objects requires list of dicts with Key
                s3.delete_objects(
                    Bucket=BUCKET,
                    Delete={"Objects": object_keys}
                )
            except Exception as e:
                print(f"Error batch deleting from S3: {e}")

    # delete files from Mongo
    files_collection.delete_many({"folder_id": folder_oid, "user_id": user_oid})

    # delete folder from Mongo
    folders_collection.delete_one({"_id": folder_oid})

    # rebuild global index
    index_manager._rebuild_user_index("global")

    return {"message": "Folder deleted successfully"}

@router.get("/download")
async def proxy_download(url: str):
    import urllib.request
    from fastapi.responses import StreamingResponse
    try:
        # Using urllib to avoid adding 'requests' dependency
        req = urllib.request.Request(url)
        response = urllib.request.urlopen(req)
        
        def iter_content():
            while True:
                chunk = response.read(1024 * 8)
                if not chunk:
                    break
                yield chunk

        return StreamingResponse(
            iter_content(),
            media_type=response.info().get_content_type(),
            headers={"Content-Disposition": f"attachment; filename=photo.jpg"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))