import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")

client = AsyncIOMotorClient(MONGO_URI)
db = client.founder_clarity_compass

async def ping_server():
    try:
        await client.admin.command('ping')
        return True
    except Exception:
        return False