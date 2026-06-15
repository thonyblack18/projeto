CREATE DATABASE IF NOT EXISTS velora;
USE velora;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    account_type ENUM('player', 'developer') NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) UNIQUE,
    password_hash TEXT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    terms_accepted_at DATETIME
);

CREATE TABLE IF NOT EXISTS player_profiles (
    user_id INT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(255),
    country VARCHAR(80),
    favorite_genres VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_player_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS developer_profiles (
    user_id INT PRIMARY KEY,
    dev_display_name VARCHAR(120) NOT NULL,
    display_name VARCHAR(255),
    dev_type ENUM('solo', 'studio') NOT NULL,
    website VARCHAR(255),
    studio_description TEXT,
    bio TEXT,
    avatar_url VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    foundation_year INT,
    favorite_genres VARCHAR(255),
    review_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',

    CONSTRAINT fk_developer_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    developer_id INT NOT NULL,

    title VARCHAR(150) NOT NULL,
    developer_name VARCHAR(80),
    tagline VARCHAR(255),
    description TEXT,
    short_description VARCHAR(255),

    genre VARCHAR(255),
    platform VARCHAR(255),
    release_date DATE,

    cover_url VARCHAR(255),
    banner_url VARCHAR(255),
    screenshots TEXT,
    tags TEXT,

    age_rating VARCHAR(20),
    player_mode VARCHAR(100),

    trailer_url VARCHAR(255),
    official_website VARCHAR(255),

    price DECIMAL(10,2) DEFAULT 0.00,
    is_free TINYINT(1) DEFAULT 0,

    rating DECIMAL(2,1) DEFAULT 5.0,

    status ENUM(
        'draft',
        'published',
        'hidden',
        'concept',
        'development',
        'beta',
        'released'
    ) DEFAULT 'draft',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_games_developer
        FOREIGN KEY (developer_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_favorite (user_id, game_id),

    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorites_game
        FOREIGN KEY (game_id) REFERENCES games(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    review_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_user_game_review (game_id, user_id),

    CONSTRAINT fk_reviews_game
        FOREIGN KEY (game_id) REFERENCES games(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reset_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    status ENUM('open', 'pending', 'resolved', 'closed') DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tickets_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS support_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_messages_ticket
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id) REFERENCES users(id)
        ON DELETE CASCADE
);
