from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "Chronica API"
    debug: bool = False
    
    # Database configuration
    database_url: Optional[str] = None
    
    # Security
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Admin configuration
    admin_email: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings() 