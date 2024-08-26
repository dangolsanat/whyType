from models import db, Book
from app import app

# Drop all existing data and create new tables
with app.app_context():
    db.drop_all()
    db.create_all()

    # Create book entries
    books = [
        Book(
            title="Don Quixote",
            author="Miguel de Cervantes",
            text_file="static/assets/don.txt",
            image_url="static/assets/images/books/don_quxiote.jpg"
        ),
        Book(
            title="The Rape of Nanking",
            author="Iris Chang",
            text_file="static/assets/nanking.txt",
            image_url="static/assets/images/books/nanking.jpg"
        ),
        Book(
            title="1984",
            author="George Orwell",
            text_file="static/assets/1984.txt",
            image_url="static/assets/images/books/1984.jpg"
        ),
        Book(
            title="Being and Nothingness",
            author="Jean-Paul Sartre",
            text_file="static/assets/satre.txt",
            image_url="static/assets/images/books/satre1.jpg"
        ),
        Book(
            title="Discipline and Punish",
            author="Michel Foucault",
            text_file="static/assets/foucault.txt",
            image_url="static/assets/images/books/foucault.jpg"
        )
    ]

    # Add books to the session and commit
    db.session.add_all(books)
    db.session.commit()

    print("Database seeded with 5 books.")
