from datetime import datetime
from app.db.mongo_connection import users_collection


def create_user(email: str):
    user_data = {
        "email": email,
        "created_at": datetime.utcnow()
    }

    result = users_collection.insert_one(user_data)

    return {
        "id": str(result.inserted_id),
        "email": email,
        "created_at": user_data["created_at"]
    }

