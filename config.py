import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'secret')  # Replace 'your-static-secret-key' with a fixed key for development
    SQLALCHEMY_DATABASE_URI = "postgresql:///keygame"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
