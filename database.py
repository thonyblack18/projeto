import mysql.connector
from urllib.parse import urlparse


SERVICE_URI = "mysql://avnadmin:AVNS_eMyEIkC6qZdWka8-qL1@mysql-594d6c0-mini-tarefas.h.aivencloud.com:17669/defaultdb?ssl-mode=REQUIRED"


def get_connection():
    try:
        url = urlparse(SERVICE_URI)

        conn = mysql.connector.connect(
            host=url.hostname,
            port=url.port,
            user=url.username,
            password=url.password,
            database=url.path.replace("/", ""),
            ssl_disabled=False
        )

        return conn

    except mysql.connector.Error as err:
        print(f"Erro ao conectar ao banco: {err}")
        return None
