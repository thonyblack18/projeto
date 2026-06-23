from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from database import get_connection
import os
from dotenv import load_dotenv
import json
import secrets
from datetime import datetime, timedelta
from flask_mail import Mail, Message
import uuid
import requests

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "velora-images")

def upload_to_supabase(file, folder):
    if not file or not file.filename:
        return ""

    filename = secure_filename(file.filename)
    ext = os.path.splitext(filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"

    path = f"{folder}/{unique_filename}"

    url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{path}"

    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": file.content_type
    }

    response = requests.post(url, headers=headers, data=file.read())

    if response.status_code not in [200, 201]:
        raise Exception(f"Erro Supabase: {response.text}")

    return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{path}"

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "velora_secret")
from flask_cors import CORS

CORS(app, resources={
    r"/*": {
        "origins": [
            "https://velora.ind.br",
            "https://www.velora.ind.br",
            "https://projeto-seven-blush.vercel.app",
            "http://127.0.0.1:5500",
            "http://localhost:5500"
        ]
    }
})

bcrypt = Bcrypt(app)

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = (
    'Velora',
    os.getenv('MAIL_DEFAULT_SENDER', os.getenv('MAIL_USERNAME'))
)

mail = Mail(app)
print("MAIL_USERNAME:", app.config["MAIL_USERNAME"])
print("MAIL_SERVER:", app.config["MAIL_SERVER"])
print("MAIL_PORT:", app.config["MAIL_PORT"])

def row_to_user(user_row):

    avatar = user_row[6] if user_row[5] == "player" else user_row[7]

    return {
        "id": user_row[0],
        "name": user_row[1],
        "username": user_row[2],
        "email": user_row[3],
        "account_type": user_row[5],
        "profile_photo": avatar or ""
    }


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    name = (data.get("name") or "").strip()
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()
    account_type = (data.get("accountType") or "player").strip().lower()

    if not name or not username or not email or not password:
        return jsonify({"error": "Preencha nome, usuário, e-mail e senha."}), 400

    if len(password) < 8:
        return jsonify({"error": "A senha deve ter pelo menos 8 caracteres."}), 400

    if account_type not in ["player", "developer"]:
        return jsonify({"error": "Tipo de conta inválido."}), 400

    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    cursor = None

    try:
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id FROM users WHERE username = %s OR email = %s",
            (username, email)
        )
        existing = cursor.fetchone()

        if existing:
            return jsonify({"error": "Usuário ou e-mail já cadastrado."}), 409

        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

        cursor.execute("""
            INSERT INTO users (name, username, email, password_hash, account_type)
            VALUES (%s, %s, %s, %s, %s)
        """, (name, username, email, password_hash, account_type))

        user_id = cursor.lastrowid

        if account_type == "developer":
            cursor.execute("""
                INSERT INTO developer_profiles (
                    user_id,
                    dev_display_name,
                    dev_type,
                    website,
                    studio_description,
                    city,
                    state,
                    foundation_year,
                    review_status,
                    display_name
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                name,
                "solo",
                "",
                "",
                "",
                "",
                None,
                "pending",
                name
            ))
        else:
            cursor.execute("""
                INSERT INTO player_profiles (
                    user_id,
                    full_name,
                    bio,
                    avatar_url,
                    country,
                    favorite_genres,
                    display_name
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                name,
                "",
                "",
                "",
                "",
                name
            ))

        conn.commit()

        return jsonify({
            "message": "Conta criada com sucesso.",
            "user": {
                "id": user_id,
                "name": name,
                "username": username,
                "email": email,
                "account_type": account_type
            }
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erro ao cadastrar: {str(e)}"}), 500

    finally:
        if cursor:
            cursor.close()
        conn.close()


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    login_value = (data.get("login") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not login_value or not password:
        return jsonify({"error": "Informe login e senha."}), 400

    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                u.id,
                u.name,
                u.username,
                u.email,
                u.password_hash,
                u.account_type,
                pp.avatar_url AS player_avatar,
                dp.avatar_url AS developer_avatar
            FROM users u
            LEFT JOIN player_profiles pp
                ON pp.user_id = u.id
            LEFT JOIN developer_profiles dp
                ON dp.user_id = u.id
            WHERE u.username = %s
            OR u.email = %s
        """, (login_value, login_value))

        user = cursor.fetchone()

        
        if not user or not bcrypt.check_password_hash(user[4], password):
            return jsonify({"error": "Login ou senha inválidos."}), 401
        
        return jsonify({
            "message": "Login realizado com sucesso.",
            "user": row_to_user(user)
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro no login: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/api/profile/user/<int:user_id>", methods=["GET"])
def get_user_profile(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id, u.name, u.username, u.email, u.account_type,
                   p.display_name, p.bio, p.favorite_genres, p.avatar_url
            FROM users u
            LEFT JOIN player_profiles p ON p.user_id = u.id
            WHERE u.id = %s AND u.account_type = 'player'
        """, (user_id,))
        profile = cursor.fetchone()

        if not profile:
            return jsonify({"error": "Perfil não encontrado."}), 404

        return jsonify({"data": profile}), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar perfil: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/api/profile/dev/<int:user_id>", methods=["GET"])
def get_dev_profile(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    cursor = None

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                u.id,
                u.name,
                u.username,
                u.email,
                u.account_type,
                d.dev_display_name,
                d.display_name,
                d.dev_type,
                d.website,
                d.studio_description,
                d.city,
                d.state,
                d.foundation_year,
                d.review_status,
                d.avatar_url
            FROM users u
            LEFT JOIN developer_profiles d ON d.user_id = u.id
            WHERE u.id = %s AND u.account_type = 'developer'
        """, (user_id,))

        profile = cursor.fetchone()

        if not profile:
            return jsonify({"error": "Perfil não encontrado."}), 404

        return jsonify({"profile": profile}), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar perfil do desenvolvedor: {str(e)}"}), 500

    finally:
        if cursor:
            cursor.close()
        conn.close()


@app.route("/api/profile/user/<int:user_id>", methods=["PUT"])
def update_user_profile(user_id):
    data = request.get_json()

    display_name = (data.get("display_name") or "").strip()
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    bio = (data.get("bio") or "").strip()

    if not display_name or not username or not email:
        return jsonify({"error": "Nome, usuário e e-mail são obrigatórios."}), 400

    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE users
            SET username = %s, email = %s, name = %s
            WHERE id = %s AND account_type = 'player'
        """, (username, email, display_name, user_id))

        cursor.execute("""
            UPDATE player_profiles
            SET display_name = %s, bio = %s
            WHERE user_id = %s
        """, (display_name, bio, user_id))

        conn.commit()
        return jsonify({"message": "Perfil atualizado com sucesso."}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erro ao atualizar perfil: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/api/profile/dev/<int:user_id>", methods=["PUT"])
def update_dev_profile(user_id):
    data = request.get_json()

    display_name = (data.get("display_name") or "").strip()
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    bio = (data.get("bio") or "").strip()

    if not display_name or not username or not email:
        return jsonify({"error": "Nome, usuário e e-mail são obrigatórios."}), 400

    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE users
            SET username = %s, email = %s, name = %s
            WHERE id = %s AND account_type = 'developer'
        """, (username, email, display_name, user_id))

        studio_description = (data.get("studio_description") or "").strip()
        display_name = (data.get("display_name") or "").strip()
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip()

        # atualiza users
        cursor.execute("""
        UPDATE users
        SET name=%s, username=%s, email=%s
        WHERE id=%s
        """, (display_name, username, email, user_id))

        # atualiza developer_profiles
        cursor.execute("""
        UPDATE developer_profiles
        SET display_name=%s, dev_display_name=%s, studio_description=%s
        WHERE user_id=%s
        """, (display_name, display_name, studio_description, user_id))

        conn.commit()
        return jsonify({"message": "Perfil atualizado com sucesso."}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erro ao atualizar perfil: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/api/change-password/<int:user_id>", methods=["PUT"])
def change_password(user_id):
    data = request.get_json()

    current_password = (data.get("current_password") or "").strip()
    new_password = (data.get("new_password") or "").strip()

    if not current_password or not new_password:
        return jsonify({"error": "Informe a senha atual e a nova senha."}), 400

    if len(new_password) < 8:
        return jsonify({"error": "A nova senha deve ter pelo menos 8 caracteres."}), 400

    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        cursor = conn.cursor()

        cursor.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Usuário não encontrado."}), 404

        if not bcrypt.check_password_hash(row[0], current_password):
            return jsonify({"error": "Senha atual incorreta."}), 401

        new_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")

        cursor.execute("""
            UPDATE users
            SET password_hash = %s
            WHERE id = %s
        """, (new_hash, user_id))

        conn.commit()
        return jsonify({"message": "Senha alterada com sucesso."}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erro ao alterar senha: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/api/user/<int:user_id>", methods=["GET"])
def get_user(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                u.id,
                u.name,
                u.username,
                u.email,
                u.account_type,
                pp.bio AS player_bio,
                dp.bio AS developer_bio
            FROM users u
            LEFT JOIN player_profiles pp ON pp.user_id = u.id
            LEFT JOIN developer_profiles dp ON dp.user_id = u.id
            WHERE u.id = %s
        """, (user_id,))

        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Usuário não encontrado."}), 404

        # 👇 lógica pra escolher a bio certa
        user["bio"] = user["developer_bio"] if user["account_type"] == "developer" else user["player_bio"]

        user.pop("player_bio", None)
        user.pop("developer_bio", None)

        return jsonify(user), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar usuário: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/api/user/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        data = request.get_json()

        name = (data.get("display_name") or "").strip()
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip().lower()
        bio = (data.get("bio") or "").strip()

        if not name or not username or not email:
            return jsonify({"error": "Preencha nome, usuário e email."}), 400

        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, account_type
            FROM users
            WHERE id = %s
        """, (user_id,))
        current_user = cursor.fetchone()

        if not current_user:
            return jsonify({"error": "Usuário não encontrado."}), 404

        cursor.execute("""
            SELECT id
            FROM users
            WHERE (username = %s OR email = %s) AND id <> %s
        """, (username, email, user_id))
        existing = cursor.fetchone()

        if existing:
            return jsonify({"error": "Username ou email já está em uso."}), 409

        cursor.execute("""
            UPDATE users
            SET name = %s, username = %s, email = %s
            WHERE id = %s
        """, (name, username, email, user_id))

        if current_user["account_type"] == "developer":
            cursor.execute("""
                UPDATE developer_profiles
                SET display_name = %s, bio = %s
                WHERE user_id = %s
            """, (name, bio, user_id))
        else:
            cursor.execute("""
                UPDATE player_profiles
                SET display_name = %s, bio = %s
                WHERE user_id = %s
            """, (name, bio, user_id))

        conn.commit()

        return jsonify({
            "message": "Perfil atualizado com sucesso.",
            "user": {
                "id": user_id,
                "name": name,
                "username": username,
                "email": email,
                "account_type": current_user["account_type"],
                "bio": bio
            }
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erro ao atualizar usuário: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/api/profile/preferences/<int:user_id>", methods=["PUT"])
def update_preferences(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        data = request.get_json()
        favorite_genres = data.get("favorite_genres", [])

        if isinstance(favorite_genres, list):
            favorite_genres_str = ", ".join(favorite_genres)
        else:
            favorite_genres_str = str(favorite_genres)

        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT account_type
            FROM users
            WHERE id = %s
        """, (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Usuário não encontrado."}), 404

        if user["account_type"] == "developer":
            cursor.execute("""
                UPDATE developer_profiles
                SET favorite_genres = %s
                WHERE user_id = %s
            """, (favorite_genres_str, user_id))
        else:
            cursor.execute("""
                UPDATE player_profiles
                SET favorite_genres = %s
                WHERE user_id = %s
            """, (favorite_genres_str, user_id))

        conn.commit()

        return jsonify({
            "message": "Preferências salvas com sucesso.",
            "favorite_genres": favorite_genres
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erro ao salvar preferências: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()    

@app.route("/api/users", methods=["GET"])
def get_all_users():
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, name, username, email, account_type
            FROM users
        """)

        users = cursor.fetchall()

        return jsonify({
            "total": len(users),
            "users": users
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()            

@app.route("/api/profile/security/<int:user_id>", methods=["PUT"])
def update_security(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        data = request.get_json()

        two_factor = bool(data.get("two_factor", False))
        login_alerts = bool(data.get("login_alerts", False))
        simultaneous_sessions = bool(data.get("simultaneous_sessions", False))

        return jsonify({
            "message": "Configurações de segurança salvas com sucesso.",
            "data": {
                "two_factor": two_factor,
                "login_alerts": login_alerts,
                "simultaneous_sessions": simultaneous_sessions
            }
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao salvar segurança: {str(e)}"}), 500

    finally:
        conn.close()

@app.route("/api/profile/privacy/<int:user_id>", methods=["PUT"])
def update_privacy(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        data = request.get_json()

        public_profile = bool(data.get("public_profile", False))
        show_supported_games = bool(data.get("show_supported_games", False))
        analytics_cookies = bool(data.get("analytics_cookies", False))
        marketing_emails = bool(data.get("marketing_emails", False))

        return jsonify({
            "message": "Configurações de privacidade salvas com sucesso.",
            "data": {
                "public_profile": public_profile,
                "show_supported_games": show_supported_games,
                "analytics_cookies": analytics_cookies,
                "marketing_emails": marketing_emails
            }
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao salvar privacidade: {str(e)}"}), 500

    finally:
        conn.close()

@app.route("/api/games", methods=["GET"])
def get_games():
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    cursor = None

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                id,
                developer_id,
                title,
                tagline,
                description,
                short_description,
                genre,
                platform,
                cover_url,
                banner_url,
                trailer_url,
                official_website,
                release_date,
                price,
                rating,
                status,
                screenshots,       
                created_at,
                updated_at
            FROM games
            ORDER BY created_at DESC
        """)

        games = cursor.fetchall()

        return jsonify({
            "total": len(games),
            "games": games
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar jogos: {str(e)}"}), 500

    finally:
        if cursor:
            cursor.close()
        conn.close()
        
from flask import request, jsonify
import json

@app.route('/add-game', methods=['POST'])
def add_game():
    print("ROTA /add-game NOVA FOI CHAMADA")

    title = request.form.get("title")
    description = request.form.get("description")
    genre = request.form.get("genre")
    platform = request.form.get("platform") or ""
    developer_id = request.form.get("developer_id")

    price = request.form.get("price", "0.00")
    is_free = request.form.get("is_free", "0")
    status = request.form.get("status", "draft")
    trailer_url = (request.form.get("trailer_url") or "").strip()
    tags = request.form.get("tags", "[]")
    release_date = request.form.get("release_date") or None
    age_rating = request.form.get("age_rating")
    player_mode = request.form.get("player_mode")
    image = request.files.get("image")
    screenshots = request.files.getlist("screenshots")

    if not title or not description or not genre:
        return jsonify({"error": "Preencha título, descrição e gênero."}), 400

    image_path = ""
    screenshots_paths = []
    
    if image:
        image_path = upload_to_supabase(image, "games/covers")
    
    for screenshot in screenshots:
        if screenshot and screenshot.filename:
            screenshot_path = upload_to_supabase(screenshot, "games/screenshots")
            screenshots_paths.append(screenshot_path)

    conn = get_connection()

    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    cursor = None

    try:
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO games (
                developer_id,
                title,
                description,
                short_description,
                genre,
                platform,
                release_date,
                cover_url,
                banner_url,
                trailer_url,
                price,
                is_free,
                status,
                rating,
                screenshots,
                tags,
                age_rating,
                player_mode
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            developer_id,
            title,
            description,
            description[:120],
            genre,
            platform,
            release_date,
            image_path,
            image_path,
            trailer_url,
            price,
            is_free,
            status,
            5.0,
            json.dumps(screenshots_paths),
            tags,
            age_rating,
            player_mode
        ))

        conn.commit()

        return jsonify({
            "message": "Jogo salvo no MySQL com sucesso.",
            "game_id": cursor.lastrowid,
            "screenshots": screenshots_paths
        }), 201

    except Exception as e:
        conn.rollback()
        print("ERRO AO SALVAR JOGO:", str(e))
        return jsonify({"error": f"Erro ao salvar jogo: {str(e)}"}), 500

    finally:
        if cursor:
            cursor.close()
        conn.close()

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory("uploads", filename)

@app.route("/api/games/<int:game_id>", methods=["GET"])
def get_game_by_id(game_id):
    conn = get_connection()

    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    cursor = None

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                g.id,
                g.developer_id,
                g.title,
                g.tagline,
                g.description,
                g.short_description,
                g.genre,
                g.tags,
                g.platform,
                g.cover_url,
                g.banner_url,
                g.trailer_url,
                g.official_website,
                g.release_date,
                g.age_rating,
                g.player_mode,
                g.price,
                g.rating,
                g.status,
                g.screenshots,       
                g.created_at,
                g.updated_at,
                u.name AS developer_name
            FROM games g
            LEFT JOIN users u ON u.id = g.developer_id
            WHERE g.id = %s
        """, (game_id,))

        game = cursor.fetchone()

        if not game:
            return jsonify({"error": "Jogo não encontrado."}), 404

        return jsonify({"game": game}), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar jogo: {str(e)}"}), 500

    finally:
        if cursor:
            cursor.close()

        conn.close()

@app.route("/api/games/<int:game_id>", methods=["PUT"])
def update_game(game_id):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        if request.content_type and request.content_type.startswith("multipart/form-data"):
            data = request.form
            image = request.files.get("image")
            screenshots = request.files.getlist("screenshots")
        else:
            data = request.get_json()
            image = None
            screenshots = []

        description = data.get("description") or ""

        campos = """
            title=%s,
            description=%s,
            short_description=%s,
            genre=%s,
            platform=%s,
            status=%s,
            trailer_url=%s,
            release_date=%s,
            age_rating=%s,
            player_mode=%s,
            tags=%s
        """

        valores = [
            data.get("title"),
            description,
            description[:120],
            data.get("genre"),
            data.get("platform"),
            data.get("status"),
            data.get("trailer_url"),
            data.get("release_date"),
            data.get("age_rating"),
            data.get("player_mode"),
            data.get("tags")
        ]

        if image and image.filename:
            image_url = upload_to_supabase(image, "games/covers")
            campos += ", cover_url=%s, banner_url=%s"
            valores.extend([image_url, image_url])

        if screenshots:
            screenshots_paths = []

            for screenshot in screenshots:
                if screenshot and screenshot.filename:
                    screenshot_url = upload_to_supabase(screenshot, "games/screenshots")
                    screenshots_paths.append(screenshot_url)

            if screenshots_paths:
                campos += ", screenshots=%s"
                valores.append(json.dumps(screenshots_paths))

        valores.append(game_id)

        cursor.execute(f"""
            UPDATE games
            SET {campos}
            WHERE id=%s
        """, valores)

        conn.commit()
        return jsonify({"message": "Jogo atualizado com sucesso."}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        print("ERRO AO ATUALIZAR JOGO:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
@app.route("/api/games/<int:game_id>/reviews", methods=["GET"])
def get_game_reviews(game_id):
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                gr.id,
                gr.game_id,
                gr.user_id,
                gr.rating,
                gr.review_text,
                gr.created_at,
                u.name AS user_name,
                pp.avatar_url
            FROM game_reviews gr
            LEFT JOIN users u ON u.id = gr.user_id
            LEFT JOIN player_profiles pp ON pp.user_id = gr.user_id
            WHERE gr.game_id = %s
            ORDER BY gr.created_at DESC
        """, (game_id,))

        reviews = cursor.fetchall()

        cursor.execute("""
            SELECT 
                COUNT(*) AS total_reviews,
                COALESCE(ROUND(AVG(rating), 1), 0) AS average_rating
            FROM game_reviews
            WHERE game_id = %s
        """, (game_id,))

        summary = cursor.fetchone()

        return jsonify({
            "reviews": reviews,
            "summary": summary
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar avaliações: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/api/games/<int:game_id>/reviews", methods=["POST"])
def create_game_review(game_id):
    data = request.get_json()

    user_id = data.get("user_id")
    rating = data.get("rating")
    review_text = (data.get("review_text") or "").strip()

    if not user_id:
        return jsonify({"error": "Usuário não identificado. Faça login para avaliar."}), 401

    if not rating:
        return jsonify({"error": "Selecione uma nota para o jogo."}), 400

    try:
        rating = int(rating)
    except:
        return jsonify({"error": "Nota inválida."}), 400

    if rating < 1 or rating > 5:
        return jsonify({"error": "A nota deve ser entre 1 e 5."}), 400

    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id FROM games WHERE id = %s
        """, (game_id,))

        if not cursor.fetchone():
            return jsonify({"error": "Jogo não encontrado."}), 404

        cursor.execute("""
            SELECT id FROM game_reviews
            WHERE game_id = %s AND user_id = %s
        """, (game_id, user_id))

        existing_review = cursor.fetchone()

        if existing_review:
            cursor.execute("""
                UPDATE game_reviews
                SET rating = %s, review_text = %s
                WHERE game_id = %s AND user_id = %s
            """, (rating, review_text, game_id, user_id))
        else:
            cursor.execute("""
                INSERT INTO game_reviews (game_id, user_id, rating, review_text)
                VALUES (%s, %s, %s, %s)
            """, (game_id, user_id, rating, review_text))

        cursor.execute("""
            SELECT COALESCE(ROUND(AVG(rating), 1), 0) AS average_rating
            FROM game_reviews
            WHERE game_id = %s
        """, (game_id,))

        average = cursor.fetchone()["average_rating"]

        cursor.execute("""
            UPDATE games
            SET rating = %s
            WHERE id = %s
        """, (average, game_id))

        conn.commit()

        return jsonify({
            "message": "Avaliação salva com sucesso.",
            "average_rating": average
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erro ao salvar avaliação: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/api/profile/user/<int:user_id>/stats", methods=["GET"])
def get_user_profile_stats(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT COUNT(DISTINCT game_id) AS games_reviewed
            FROM game_reviews
            WHERE user_id = %s
        """, (user_id,))
        reviewed = cursor.fetchone()

        cursor.execute("""
            SELECT COUNT(*) AS comments_count
            FROM game_reviews
            WHERE user_id = %s
            AND review_text IS NOT NULL
            AND review_text <> ''
        """, (user_id,))
        comments = cursor.fetchone()

        return jsonify({
            "games_reviewed": reviewed["games_reviewed"] or 0,
            "supported_games": 0,
            "comments_count": comments["comments_count"] or 0
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar estatísticas: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()

    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "Informe seu e-mail."}), 400

    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    cursor = None

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, name, email
            FROM users
            WHERE email = %s
        """, (email,))

        user = cursor.fetchone()
        print("1 - busca de usuário feita")

        if not user:
            return jsonify({
                "message": "Se este e-mail estiver cadastrado, você receberá um link de recuperação."
            }), 200

        token = secrets.token_urlsafe(48)
        expires_at = datetime.now() + timedelta(minutes=30)

        print("2 - token criado")

        cursor.execute("""
            UPDATE password_reset_tokens
            SET used = 1
            WHERE user_id = %s AND used = 0
        """, (user["id"],))

        cursor.execute("""
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES (%s, %s, %s)
        """, (user["id"], token, expires_at))

        conn.commit()

        reset_link = f"https://www.velora.ind.br/RedefinirSenha.html?token={token}"

        msg = Message(
            subject="Redefinição de senha - Velora",
            recipients=[user["email"]]
        )

        msg.body = f"""
Olá, {user["name"]}!

Recebemos uma solicitação para redefinir sua senha na Velora.

Seu código de recuperação é:

{token}

Ou utilize o link abaixo:

{reset_link}

Este link expira em 30 minutos.

Se você não solicitou isso, apenas ignore este e-mail.

Equipe Velora
"""

        print("3 - email preparado")

        try:
            response = requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {os.getenv('RESEND_API_KEY')}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": "Velora <onboarding@resend.dev>",
                    "to": [user["email"]],
                    "subject": "Redefinição de senha - Velora",
                    "html": f"""
                        <h2>Redefinição de senha - Velora</h2>
                        <p>Olá, {user["name"]}!</p>
                        <p>Recebemos uma solicitação para redefinir sua senha.</p>
                        <p><strong>Seu código de recuperação:</strong></p>
                        <p>{token}</p>
                        <p>Ou clique no link abaixo:</p>
                        <a href="{reset_link}">{reset_link}</a>
                        <p>Este link expira em 30 minutos.</p>
                    """
                }
            )
        
            print("RESEND STATUS:", response.status_code)
            print("RESEND RESPONSE:", response.text)
        
            if response.status_code >= 400:
                raise Exception(response.text)
        
            print("4 - email enviado")
        
        except Exception as mail_error:
            print("ERRO AO ENVIAR EMAIL:", repr(mail_error))
            raise
    
    finally:
        if cursor:
            cursor.close()
        conn.close()


@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()

    token = (data.get("token") or "").strip()
    new_password = (data.get("new_password") or "").strip()

    if not token or not new_password:
        return jsonify({"error": "Token e nova senha são obrigatórios."}), 400

    if len(new_password) < 8:
        return jsonify({"error": "A nova senha deve ter pelo menos 8 caracteres."}), 400

    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT prt.id, prt.user_id, prt.expires_at, prt.used
            FROM password_reset_tokens prt
            WHERE prt.token = %s
            LIMIT 1
        """, (token,))

        reset_row = cursor.fetchone()

        if not reset_row:
            return jsonify({"error": "Link de recuperação inválido."}), 400

        if reset_row["used"] == 1:
            return jsonify({"error": "Este link já foi utilizado."}), 400

        if reset_row["expires_at"] < datetime.now():
            return jsonify({"error": "Este link expirou. Solicite uma nova recuperação."}), 400

        new_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")

        cursor.execute("""
            UPDATE users
            SET password_hash = %s
            WHERE id = %s
        """, (new_hash, reset_row["user_id"]))

        cursor.execute("""
            UPDATE password_reset_tokens
            SET used = 1
            WHERE id = %s
        """, (reset_row["id"],))

        conn.commit()

        return jsonify({"message": "Senha redefinida com sucesso."}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erro ao redefinir senha: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()        

@app.route("/api/upload-avatar", methods=["POST"])
def upload_avatar():

    user_id = request.form.get("user_id")
    account_type = request.form.get("account_type")
    avatar = request.files.get("avatar")

    if not user_id or not account_type:
        return jsonify({"error": "Dados inválidos."}), 400

    if not avatar:
        return jsonify({"error": "Nenhuma imagem enviada."}), 400

    caminho = upload_to_supabase(avatar, "avatars")

    conn = get_connection()

    if not conn:
        return jsonify({"error": "Erro de conexão."}), 500

    try:

        cursor = conn.cursor()

        if account_type == "developer":

            cursor.execute("""
                UPDATE developer_profiles
                SET avatar_url=%s
                WHERE user_id=%s
            """, (caminho, user_id))

        else:

            cursor.execute("""
                UPDATE player_profiles
                SET avatar_url=%s
                WHERE user_id=%s
            """, (caminho, user_id))

        conn.commit()

        return jsonify({
            "message": "Avatar atualizado com sucesso.",
            "avatar_url": caminho
        })

    except Exception as e:

        conn.rollback()
        return jsonify({
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/api/profile/dev/<int:user_id>/stats", methods=["GET"])
def get_dev_profile_stats(user_id):
    conn = get_connection()

    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT COUNT(*) AS total_games
            FROM games
            WHERE developer_id = %s
        """, (user_id,))

        games = cursor.fetchone()

        return jsonify({
            "published_games": games["total_games"] or 0,
            "supporters": 0
        }), 200

    except Exception as e:
        return jsonify({
            "error": f"Erro ao carregar estatísticas: {str(e)}"
        }), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/api/developers", methods=["GET"])
def get_developers():
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Erro de conexão com o banco."}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                u.id,
                u.name,
                u.username,
                d.dev_display_name,
                d.display_name,
                d.dev_type,
                d.studio_description,
                d.city,
                d.state,
                d.foundation_year,
                d.review_status,
                d.avatar_url,
                COUNT(g.id) AS games_count
            FROM users u
            LEFT JOIN developer_profiles d ON d.user_id = u.id
            LEFT JOIN games g ON g.developer_id = u.id
            WHERE u.account_type = 'developer'
            GROUP BY u.id
            ORDER BY u.id DESC
        """)

        developers = cursor.fetchall()

        return jsonify({
            "total": len(developers),
            "developers": developers
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar desenvolvedores: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True)
