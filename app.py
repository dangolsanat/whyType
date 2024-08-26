from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from models import connect_db, db, User, Progress, Book
from config import Config
import pickle
import os
import json

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)  # Load configuration from Config class


# Setup Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'



# Connect to the database
connect_db(app)

@login_manager.user_loader
def load_user(user_id):
    """Load user by ID for Flask-Login."""
    return User.query.get(int(user_id))

@app.route('/')
def home():
    """Render the homepage."""
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    """Handle user login."""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user is None:
        return jsonify({'success': False, 'error': 'Username not found. Please sign up first.'}), 404
    if not check_password_hash(user.password, password):
        return jsonify({'success': False, 'error': 'Incorrect password. Please try again.'}), 401
    
    login_user(user)
    return jsonify({'success': True})

@app.route('/signup', methods=['POST'])
def signup():
    """Handle user signup."""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'error': 'Username already exists. Please choose a different one.'}), 409
    
    hashed_password = generate_password_hash(password, method='sha256')
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    login_user(new_user)

    return jsonify({'success': True, 'redirect': url_for('dashboard')})

@app.route('/dashboard',methods=['GET'])
@login_required
def dashboard():
    """Render the dashboard for logged-in users."""
    books = Book.query.all()
    user_id = current_user.id

    return render_template('dashboard.html', cuser=current_user, books=books, user_id=user_id)

@app.route('/books', methods=['GET'])
def get_books():
    """Return a list of books in JSON format."""
    books = Book.query.all()
    return jsonify([{
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'text_url': book.text_file,
        'image_url': book.image_url
    } for book in books])




@app.route('/logout')
@login_required
def logout():
    """Handle user logout."""
    logout_user()
    flash('You have been logged out.')
    return redirect(url_for('home'))


@app.route('/save_progress', methods=['POST'])
def save_progress():
    try:
        data = request.json
        app.logger.debug(f"Received data: {data}")
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        user_id = data.get('user_id')
        book_id = data.get('book_id')
        paragraph_index = data.get('paragraph_index')
        sentence_index = data.get('sentence_index')
        char_index = data.get('char_index')
        user_progress = pickle.dumps(data.get('user_progress'))

        app.logger.debug(f"user_id: {user_id}, book_id: {book_id}, paragraph_index: {paragraph_index}, sentence_index: {sentence_index}, char_index: {char_index}, user_progress: {user_progress}")

        if not all([user_id, book_id, paragraph_index is not None, sentence_index is not None, char_index is not None, user_progress is not None]):
            return jsonify({"error": "Missing required fields"}), 400

        # Check if record exists
        progress = Progress.query.filter_by(user_id=user_id, book_id=book_id).first()

        if progress:
            progress.paragraph_index = paragraph_index
            progress.sentence_index = sentence_index
            progress.char_index = char_index
            progress.user_progress = user_progress
        else:
            progress = Progress(
                user_id=current_user.id,
                book_id=book_id,
                paragraph_index=paragraph_index,
                sentence_index=sentence_index,
                char_index=char_index,
                user_progress=user_progress
            )
            db.session.add(progress)

        try:
            db.session.commit()
            return jsonify({"success": True}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to save progress"}), 500
    except Exception as e:
        app.logger.error(f"Error saving progress: {str(e)}")
        return jsonify({"error": "Failed to save progress"}), 500




def get_progress_for_book(book_id):
    try:
        progress = Progress.query.filter_by(book_id=book_id).all()
        if not progress:
            return []
        return [p.to_dict() for p in progress]
    except Exception as e:
        app.logger.error(f"Error fetching progress for book_id {book_id}: {e}")
        return []



@app.route('/load_progress', methods=['GET'])
def load_progress():
    book_id = request.args.get('book_id')

    user_id = current_user.id if current_user.is_authenticated else None



    try:
        progress = Progress.query.filter_by(user_id=user_id, book_id=book_id).all()
        print("Progress fetched:", progress)
        
        if not progress:
            return jsonify([]), 200

        progress_data = [p.to_dict() for p in progress]
        return jsonify(progress_data), 200

    except Exception as e:
        app.logger.error(f"Error fetching progress for book_id {book_id}: {str(e)}")
        return jsonify({"error": "Failed to load progress"}), 500





@app.route('/get_book_id', methods=['GET'])
def get_book_id():
    text_file_url = request.args.get('textFileUrl')
    if not text_file_url:
        return jsonify({'error': 'textFileUrl is required'}), 400
    
    book = Book.query.filter_by(text_file=text_file_url).first()
    if not book:
        return jsonify({'error': 'Book not found'}), 404
    
    return jsonify({'book_id': book.id})



@app.route('/submit_book', methods=['POST'])
@login_required
def submit_book():
    """Handle the submission of a new book."""
    title = request.form.get('title')
    author = request.form.get('author')
    image_url = request.form.get('image_url')
    
    # Handling file upload
    book_file = request.files.get('book_file')
    if book_file:
        filename = book_file.filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        book_file.save(file_path)
        
        # Save book details to the database
        new_book = Book(title=title, author=author, text_file=file_path, image_url=image_url)
        db.session.add(new_book)
        db.session.commit()
        
        flash('Book submitted successfully!', 'success')
        return redirect(url_for('dashboard'))
    else:
        flash('Failed to submit book. Ensure the file is in .txt format.', 'danger')
        return redirect(url_for('dashboard'))
    
@app.route('/settings', methods=['GET','POST'])
@login_required
def settings():
    return render_template('/settings.html')



if __name__ == '__main__':
    app.run(debug=True)
