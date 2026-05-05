import mysql.connector

def get_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="1234",
            database="velora"
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Erro ao conectar ao banco: {err}")
        return None