from bson import ObjectId
from app.db.mongo_connection import files_collection, folders_collection
from datetime import datetime
from app.services import s3_service 
from app.core.index_manager import index_manager 


def delete_file(user_id: str, file_id: str):

    user_oid = ObjectId(user_id)
    file_oid = ObjectId(file_id)

    result = files_collection.delete_one({
        "_id": file_oid,
        "user_id": user_oid
    })

    if result.deleted_count == 0:
        raise Exception("File not found or unauthorized")

    return {
        "message": "File deleted successfully"
    }

def create_file(user_id: str, file_obj, filename: str, folder_id: str | None = None, embedding: list | None = None, status: str = "ready"):

    user_oid = ObjectId(user_id)

    folder_oid = None

    # 1️⃣ Validate folder ownership
    if folder_id:
        folder_oid = ObjectId(folder_id)

        folder = folders_collection.find_one({
            "_id": folder_oid,
            "user_id": user_oid
        })

        if not folder:
            raise Exception("Folder not found or Unauthorized")

    # 2️⃣ Upload to S3
    object_key = s3_service.upload_file_to_s3(user_id, folder_id, file_obj, filename)

    # 3️⃣ Insert DB record
    file_data = {
        "name": filename,
        "user_id": user_oid,
        "folder_id": folder_oid,
        "object_key": object_key,
        "created_at": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "embedding": embedding,
        "status": status
    }

    result = files_collection.insert_one(file_data)

    # 4️⃣ Update Index


    return {
        "file_id": str(result.inserted_id),
        "object_key": object_key,
        "folder_id": str(folder_oid) if folder_oid else None
    }
