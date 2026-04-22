from fastapi import FastAPI, Depends
from app.routers import s3_router
from app.routers.mongo import user
from app.db.mongo_connection import client
from fastapi.middleware.cors import CORSMiddleware
from app.core.security import get_current_user
from fastapi import Request, Response
import time
from collections import defaultdict

app = FastAPI()

# Simple In-Memory Rate Limiter
# Structure: { ip: [timestamp, timestamp, ...] }
rate_limit_records = defaultdict(list)
RATE_LIMIT_SECONDS = 60
MAX_REQUESTS = 60 # 1 request per second average

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    now = time.time()
    
    # Clean up old records
    rate_limit_records[client_ip] = [t for t in rate_limit_records[client_ip] if now - t < RATE_LIMIT_SECONDS]
    
    if len(rate_limit_records[client_ip]) >= MAX_REQUESTS:
        return Response(content="Rate limit exceeded. Please try again later.", status_code=429)
    
    rate_limit_records[client_ip].append(now)
    return await call_next(request)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for simulation/production flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": time.time()}

@app.on_event("startup")
def check_mongo():
    print("Connected to MongoDB. Available databases:", client.list_database_names())

# Protected Route Behavior - /auth/me
@app.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# Simplified Routers
app.include_router(user.router, prefix='/mongo_routes')
app.include_router(s3_router.router)
