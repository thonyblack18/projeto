from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from database import get_connection
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "velora_secret")
CORS(app)
bcrypt = Bcrypt(app)


def row_to_user(user_row):
    return {
        "id": user_row[0],
        "name": user_row[1],
        "username": user_row[2],
        "email": user_row[3],
        "account_type": user_row[5]
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
            SELECT id, name, username, email, password_hash, account_type
            FROM users
            WHERE username = %s OR email = %s
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
                d.review_status
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
    trailer_url = request.form.get("trailer_url")
    tags = request.form.get("tags", "[]")
    release_date = request.form.get("release_date")
    age_rating = request.form.get("age_rating")
    player_mode = request.form.get("player_mode")
    image = request.files.get("image")
    screenshots = request.files.getlist("screenshots")

    if not title or not description or not genre:
        return jsonify({"error": "Preencha título, descrição e gênero."}), 400

    image_path = ""
    screenshots_paths = []

    os.makedirs("uploads", exist_ok=True)

    if image:
        filename = secure_filename(image.filename)
        image_path = f"uploads/{filename}"
        image.save(image_path)

    for screenshot in screenshots:
        if screenshot and screenshot.filename:
            filename = secure_filename(screenshot.filename)
            screenshot_path = f"uploads/{filename}"
            screenshot.save(screenshot_path)
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

if __name__ == "__main__":
    app.run(debug=True)