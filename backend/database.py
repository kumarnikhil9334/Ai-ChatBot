
import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Step 1: Load environment variables
load_dotenv()

# Step 2: Read MongoDB connection string
MONGO_URI = os.getenv("MONGO_URI")

# Step 3: Connect to MongoDB Atlas
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=10000
)

# Step 4: Select database
db = client["chatbot_db"]

# Step 5: Test database connection
if __name__ == "__main__":
    try:
        client.admin.command("ping")
        print("MongoDB Connected Successfully!")

    except Exception as e:
        print("MongoDB Connection Failed!")
        print("Error Type:", type(e).__name__)
        print("Error Code:", getattr(e, "code", None))
        print("Error Message:", str(e))
