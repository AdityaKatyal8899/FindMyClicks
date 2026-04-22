from pydantic import BaseModel
from typing import Optional

class FolderCreate(BaseModel):
    id: int
    name: str
    parent_id: Optional[int] = None

class FolderResponse(FolderCreate):
    class Config: 
        orm_mode = True

class FileCreate(BaseModel):
    name: str
    folder_id: int

class FileResponse(BaseModel):
    id: int
    name: str
    folder_id: int

    class Config:
        orm_mode = True


