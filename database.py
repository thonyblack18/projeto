import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="mysql-594d6c0-mini-tarefas.h.aivencloud.com",
        port=17669,
        user="avnadmin",
        password="SUA_SENHA_DO_AIVEN",
        database="defaultdb",
        ssl_disabled=False
    )
