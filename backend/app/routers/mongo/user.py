from fastapi import APIRouter
from app.services.mongo import user_service

router = APIRouter(
    prefix="/users",
    tags=["Mongo Users"]
)


@router.post("/")
def create_user(email: str):
    return user_service.create_user(email)
