from fastapi import APIRouter

api_router = APIRouter()

@api_router.get("/items")
async def get_items():
    """Get all items - test endpoint"""
    return {
        "message": "Hello from Chronica API!",
        "items": [
            {"id": 1, "name": "Item 1", "description": "First test item"},
            {"id": 2, "name": "Item 2", "description": "Second test item"}
        ]
    }

@api_router.get("/items/{item_id}")
async def get_item(item_id: int):
    """Get a specific item by ID"""
    return {
        "id": item_id,
        "name": f"Item {item_id}",
        "description": f"This is item number {item_id}"
    }

# Additional routers can be included here when needed
# api_router.include_router(other_router, prefix="/other", tags=["other"]) 