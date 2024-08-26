from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from flask import current_app as app
import os

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

# Progress model
class Progress(db.Model):
    __tablename__ = 'progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    paragraph_index = db.Column(db.Integer, nullable=False)
    sentence_index = db.Column(db.Integer, nullable=False)
    char_index = db.Column(db.Integer, nullable=False)
    user_progress = db.Column(db.LargeBinary, nullable=False)
    book = db.Column(db.String(255), nullable=False, index=True)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'book', name='user_book_uc'),
    )

# Initialize and connect the database
def connect_db(app):
    """Connect to database."""
    db.app = app
    db.init_app(app)

