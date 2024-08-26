from app import app
from models import db, User, Progress
from werkzeug.security import generate_password_hash
import pickle

# Connect to the database
with app.app_context():
    # Drop all existing tables and create new ones
    db.drop_all()
    db.create_all()

    # Create default users
    user1 = User(
        username='user1',
        password=generate_password_hash('password1', method='sha256')
    )
    
    user2 = User(
        username='user2',
        password=generate_password_hash('password2', method='sha256')
    )

    db.session.add(user1)
    db.session.add(user2)
    db.session.commit()

    # Create default progress for users
    # Example data
    progress_data = [
        {
            'user_id': user1.id,
            'paragraph_index': 0,
            'sentence_index': 0,
            'char_index': 5,
            'user_progress': pickle.dumps(['correct', 'correct', 'correct', 'correct', 'correct']),
            'book': 'don'
        },
        {
            'user_id': user1.id,
            'paragraph_index': 1,
            'sentence_index': 1,
            'char_index': 10,
            'user_progress': pickle.dumps(['correct'] * 10),
            'book': 'nanking'
        },
        {
            'user_id': user2.id,
            'paragraph_index': 0,
            'sentence_index': 0,
            'char_index': 3,
            'user_progress': pickle.dumps(['correct'] * 3),
            'book': 'don'
        }
    ]

    for prog in progress_data:
        progress = Progress(
            user_id=prog['user_id'],
            paragraph_index=prog['paragraph_index'],
            sentence_index=prog['sentence_index'],
            char_index=prog['char_index'],
            user_progress=prog['user_progress'],
            book=prog['book']
        )
        db.session.add(progress)

    db.session.commit()

    print("Database seeded successfully!")
