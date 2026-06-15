import mysql.connector

def get_connection():
    try:
        conn = mysql.connector.connect(
            host="mysql-594d6c0-mini-tarefas.h.aivencloud.com",
            port=17669,
            user="avnadmin",
            password="AVNS_eMyEIkC6qZdWka8-qL1",
            database="defaultdb",
            ssl_disabled=False
        )
        return conn

    except mysql.connector.Error as err:
        print(f"Erro ao conectar ao banco: {err}")
        return None
