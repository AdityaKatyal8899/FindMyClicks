from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

DB_URI = os.getenv("DB_URI")
client = MongoClient(DB_URI)
db = client["folder_db"]

users_collection = db["users"]
folders_collection = db["folders"]
files_collection = db["files"]
events_collection = db['events']