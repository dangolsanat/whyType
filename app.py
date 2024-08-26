from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from models import connect_db, db, User, Progress
from config import Config
import pickle

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

@app.route('/dashboard')
@login_required
def dashboard():
    """Render the dashboard for logged-in users."""
    return render_template('dashboard.html', cuser=current_user)

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
        data = request.get_json()
        app.logger.debug(f"Received data: {data}")

        if not data:
            return jsonify({"error": "No data provided"}), 400

        user_id = data.get('user_id')
        book = data.get('book')  # Corrected field name
        paragraph_index = data.get('paragraphIndex')  # Matching case
        sentence_index = data.get('sentenceIndex')  # Matching case
        char_index = data.get('charIndex')  # Matching case
        user_progress = data.get('userProgress')  # Matching case

        app.logger.debug(f"user_id: {user_id}, book: {book}, paragraph_index: {paragraph_index}, sentence_index: {sentence_index}, char_index: {char_index}, user_progress: {user_progress}")

        if not all([user_id, book, paragraph_index is not None, sentence_index is not None, char_index is not None, user_progress is not None]):
            app.logger.debug(f"Missing data fields: user_id={user_id}, book={book}, paragraph_index={paragraph_index}, sentence_index={sentence_index}, char_index={char_index}, user_progress={user_progress}")
            return jsonify({"error": "Missing required fields"}), 400

        # Check if record exists
        progress = Progress.query.filter_by(user_id=user_id, book=book).first()

        if progress:
            progress.paragraph_index = paragraph_index
            progress.sentence_index = sentence_index
            progress.char_index = char_index
            progress.user_progress = pickle.dumps(user_progress)  # Make sure to pickle the data
        else:
            progress = Progress(
                user_id=user_id,
                book=book,
                paragraph_index=paragraph_index,
                sentence_index=sentence_index,
                char_index=char_index,
                user_progress=pickle.dumps(user_progress)  # Make sure to pickle the data
            )
            db.session.add(progress)

        db.session.commit()
        return jsonify({"success": True}), 200

    except Exception as e:
        app.logger.error(f"Error saving progress: {str(e)}")
        return jsonify({"error": "Failed to save progress"}), 500



@app.route('/load_progress', methods=['GET'])
@login_required
def load_progress():
    """Load the user's typing progress for a specific book."""
    book = request.args.get('book')

    if not book:
        return jsonify({'error': 'Book URL is required'}), 400

    user_progress_entries = Progress.query.filter_by(user_id=current_user.id, book=book).all()
    progress_data = []

    for progress in user_progress_entries:
        try:
            user_progress_data = pickle.loads(progress.user_progress)
        except (pickle.PickleError, EOFError) as e:
            app.logger.error(f"Error unpickling progress data: {e}")
            user_progress_data = []

        progress_data.append({
            'paragraphIndex': progress.paragraph_index,
            'sentenceIndex': progress.sentence_index,
            'charIndex': progress.char_index,
            'userProgress': user_progress_data
        })

    return jsonify(progress_data)


if __name__ == '__main__':
    app.run(debug=True)
