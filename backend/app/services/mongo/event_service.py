from bson import ObjectId
from datetime import datetime
from app.db.mongo_connection import events_collection

def create_event(user_id: str, name: str, description: str, cover_image: str):
    event_data = {
    "name": name,
    "description": description,
    "user_id": ObjectId(user_id),   # photographer
    "cover_image": cover_image,
    "status": "active",             # later: archived
    "created_at": datetime.utcnow(),
    "updated_at": datetime.utcnow()
}
    
    if user_id:
        event_data['user_id'] = ObjectId(user_id)

    else:
        return None
    
    doc = events_collection.insert_one(event_data)
    return {
        "id": str(doc.inserted_id),
        "name": name,
        "description": description,
        "cover_image": cover_image,
        "status": "active"
    }

def delete_event():
    pass


