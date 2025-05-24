import json
import os
from pathlib import Path

import yaml
import psycopg2
from pgvector.psycopg2 import register_vector
from openai import OpenAI

client = OpenAI()

DATABASE_URL = os.getenv("DATABASE_URL")
INTEGRATIONS_DIR = Path("integrations")

conn = psycopg2.connect(DATABASE_URL)
register_vector(conn)
cur = conn.cursor()


def get_embedding(text: str):
    resp = client.embeddings.create(input=[text], model="text-embedding-3-small")
    return resp.data[0].embedding


def process_yaml_file(path: Path) -> None:
    data = yaml.safe_load(path.read_text())
    integration_name = data.get("platform", path.stem)
    actions = data.get("actions", [])
    for action in actions:
        action_name = action.get("name")
        description = action.get("description", "")
        action_type = action.get("type")

        emb_text = f"{integration_name} {action_name} {description}"
        embedding = get_embedding(emb_text)

        metadata = {
            "method": action.get("method"),
            "url": action.get("url"),
            "callable": action.get("callable"),
            "inputs": action.get("inputs", []),
            "instructions": data.get("instructions", ""),
        }

        cur.execute(
            """
            INSERT INTO integrations (
                integration_name, action_name, description, action_type, embedding, metadata
            ) VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                integration_name,
                action_name,
                description,
                action_type,
                embedding,
                json.dumps(metadata),
            ),
        )


def main() -> None:
    for file in INTEGRATIONS_DIR.iterdir():
        if file.suffix in {".yaml", ".yml"}:
            process_yaml_file(file)
    conn.commit()
    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
