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
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    progress = db.relationship('Progress', backref='user', lazy=True)

    def get_id(self):
        return str(self.id)

# Progress model
class Progress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    paragraph_index = db.Column(db.Integer, nullable=False)
    sentence_index = db.Column(db.Integer, nullable=False)
    char_index = db.Column(db.Integer, nullable=False)
    user_progress = db.Column(db.LargeBinary, nullable=False)
    book = db.Column(db.String(255), nullable=False)  # Add this field
