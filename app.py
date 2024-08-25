from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from models import connect_db, db, User, Progress
from config import Config
import pickle

app = Flask(__name__)
app.config.from_object(Config)  # Load config from Config class

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

connect_db(app)

# User loader function
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']
    
    user = User.query.filter_by(username=username).first()
    
    if not user:
        return jsonify({'success': False, 'error': 'Username not found. Please sign up first.'})
    elif not check_password_hash(user.password, password):
        return jsonify({'success': False, 'error': 'Incorrect password. Please try again.'})
    
    login_user(user)
    return jsonify({'success': True})

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data['username']
    password = data['password']
    
    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'error': 'Username already exists. Please choose a different one.'})
    
    new_user = User(username=username, password=generate_password_hash(password, method='sha256'))
    db.session.add(new_user)
    db.session.commit()

    login_user(new_user)

    return jsonify({'success': True, 'redirect': url_for('dashboard')})

@app.route('/dashboard')
@login_required
def dashboard():
    cuser = current_user
    return render_template('dashboard.html', cuser=cuser)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.')
    return redirect(url_for('home'))



@app.route('/save_progress', methods=['POST'])
@login_required
def save_progress():
    try:
        data = request.json
        paragraph_index = data.get('paragraphIndex')
        sentence_index = data.get('sentenceIndex')
        char_index = data.get('charIndex')
        user_progress = pickle.dumps(data.get('userProgress'))
        book = data.get('bookUrl')  # Use this for book-specific progress
        
        existing_progress = Progress.query.filter_by(
            user_id=current_user.id,
            paragraph_index=paragraph_index,
            sentence_index=sentence_index,
            book=book
        ).first()
        
        if existing_progress:
            existing_progress.char_index = char_index
            existing_progress.user_progress = user_progress
        else:
            new_progress = Progress(
                user_id=current_user.id,
                paragraph_index=paragraph_index,
                sentence_index=sentence_index,
                char_index=char_index,
                user_progress=user_progress,
                book=book
            )
            db.session.add(new_progress)

        db.session.commit()
        return jsonify({'message': 'Progress saved successfully!'})

    except Exception as e:
        app.logger.error(f"Error saving progress: {e}")  # Log the error
        return jsonify({'error': 'Failed to save progress.'}), 500




@app.route('/load_progress', methods=['GET'])
@login_required
def load_progress():
    book = request.args.get('bookUrl')  # Retrieve book URL from request

    if not book:
        return jsonify({'error': 'Book URL is required'}), 400  # Return an error if book URL is missing

    user_progress = Progress.query.filter_by(user_id=current_user.id, book=book).all()
    progress_data = []

    for progress in user_progress:
        try:
            # Attempt to unpickle the progress data
            user_progress_data = pickle.loads(progress.user_progress)
        except (pickle.PickleError, EOFError) as e:
            print(f'Error unpickling progress data: {e}')
            user_progress_data = []  # Provide default empty list in case of error

        progress_data.append({
            'paragraphIndex': progress.paragraph_index,
            'sentenceIndex': progress.sentence_index,
            'charIndex': progress.char_index,
            'userProgress': user_progress_data
        })

    return jsonify(progress_data)

if __name__ == '__main__':
    app.run(debug=True)
