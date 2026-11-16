
from database import db

# Select collection
collection = db["chat_history"]

# Insert test data
data = {
    "question": "What is Python?",
    "answer": "Python is a programming language."
}

result = collection.insert_one(data)

print("Data Saved Successfully!")
print("Document ID:", result.inserted_id)

# Retrieve saved data
saved_data = collection.find_one({
    "_id": result.inserted_id
})

print("Saved Data:", saved_data)
