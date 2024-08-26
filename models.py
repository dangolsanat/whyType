from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from flask import current_app as app
import json
import pickle

db = SQLAlchemy()

def connect_db(app):
    """Connect to database."""
    db.app = app
    db.init_app(app)

# User model
class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())
    progress = db.relationship('Progress', backref='user', lazy=True, cascade="all, delete-orphan")

    def get_id(self):
        return str(self.id)

# Book model
class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    text_file = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    progress = db.relationship('Progress', backref='book', lazy=True, cascade="all, delete-orphan")

    def __init__(self, title, author, text_file, image_url):
        self.title = title
        self.author = author
        self.text_file = text_file
        self.image_url = image_url

# Progress model
class Progress(db.Model):
    __tablename__ = 'progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False, index=True)
    paragraph_index = db.Column(db.Integer, nullable=False)
    sentence_index = db.Column(db.Integer, nullable=False)
    char_index = db.Column(db.Integer, nullable=False)
    user_progress = db.Column(db.JSON, nullable=False)  

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'book_id': self.book_id,
            'paragraph_index': self.paragraph_index,
            'sentence_index': self.sentence_index,
            'char_index': self.char_index,
            'user_progress': self.user_progress        
        }

    __table_args__ = (
        db.UniqueConstraint('user_id', 'book_id', name='user_book_uc'),
    )

# Initialize and connect the database
def connect_db(app):
    """Connect to database."""
    db.app = app
    db.init_app(app)
