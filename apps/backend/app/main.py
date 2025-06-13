from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from contextlib import asynccontextmanager

from .config import settings
from .base.routers.router import api_router

# Configure logging
LOGLEVEL = os.environ.get("LOGLEVEL", "WARNING").upper()
logging.basicConfig(level=LOGLEVEL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic here
    logging.info("Starting up Chronica backend...")
    yield
    # Shutdown logic here
    logging.info("Shutting down Chronica backend...")

app = FastAPI(
    title="Chronica API",
    description="A FastAPI backend for Chronica application",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:3000",  # Next.js development server
    "http://127.0.0.1:3000",
    # Add production URLs here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Chronica API"}

@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "service": "Chronica API"} 