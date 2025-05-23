import os
from openai import OpenAI
import psycopg2
from pgvector.psycopg2 import register_vector

client = OpenAI()

DATABASE_URL = os.getenv("DATABASE_URL")
conn = psycopg2.connect(DATABASE_URL)
register_vector(conn)
cur = conn.cursor()


def get_embedding(text: str):
    resp = client.embeddings.create(input=[text], model="text-embedding-3-small")
    return resp.data[0].embedding


def search_integrations(query: str, limit: int = 5):
    embedding = get_embedding(query)
    cur.execute(
        """
        SELECT integration_name, action_name, description, action_type, metadata,
               embedding <=> %s AS distance
        FROM integrations
        ORDER BY distance
        LIMIT %s
        """,
        (embedding, limit),
    )
    return cur.fetchall()


if __name__ == "__main__":
    q = input("Query: ")
    results = search_integrations(q)
    for row in results:
        integration_name, action_name, description, action_type, metadata, distance = row
        print(f"Integration: {integration_name}, Action: {action_name}, Type: {action_type}, Distance: {distance}")
        print(f"Description: {description}")
        print(f"Metadata: {metadata}\n")
