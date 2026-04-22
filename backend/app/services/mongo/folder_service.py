from bson import ObjectId
from datetime import datetime
from app.db.mongo_connection import folders_collection, files_collection


def create_folder(user_id: str, name: str, event_id: str | None =None, parent_id: str | None = None):

    folder_data = {
        "name": name,
        "user_id": ObjectId(user_id),
        "event_id": event_id,
        "created_at": datetime.utcnow()
    }

    if parent_id :
        folder_data["parent_id"] = ObjectId(parent_id)
    else:
        folder_data["parent_id"] = None

    result = folders_collection.insert_one(folder_data)

    return {
        "id": str(result.inserted_id),
        "name": name,
        "parent_id": parent_id if parent_id else None,
        "user_id": user_id
    }


def delete_folder_recursive(user_id: str, folder_id: str):

    user_oid = ObjectId(user_id)
    root_folder_oid = ObjectId(folder_id)

    folder = folders_collection.find_one({
        '_id': root_folder_oid,
        'user_id': user_oid
    })

    if not folder:
        raise Exception("Folder not found")

    stack = [root_folder_oid]
    all_folder_ids = []
    visited = set()

    while stack:

        current = stack.pop()

        if current in visited:
            continue

        visited.add(current)
        all_folder_ids.append(current)

        # ✅ Search in folders_collection
        children = folders_collection.find({
            'parent_id': current,
            'user_id': user_oid
        })

        for child in children:
            stack.append(child['_id'])

    # ✅ Delete files inside these folders
    files_collection.delete_many({
        'folder_id': {"$in": all_folder_ids},
        'user_id': user_oid
    })

    # ✅ Delete folders themselves
    folders_collection.delete_many({
        '_id': {"$in": all_folder_ids},
        'user_id': user_oid
    })

    return {
        "deleted_folder_count": len(all_folder_ids),
        "message": "Folder and its contents deleted"
    }

