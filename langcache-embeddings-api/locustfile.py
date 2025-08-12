from locust import HttpUser, task
import json
import os
import random
from faker import Faker

fake = Faker()


class EmbeddingsUser(HttpUser):

    def on_start(self):
        api_key = os.environ.get("API_KEY")

        self.client.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

    @task(1)
    def embed_single_text(self):

        payload = {
            "input": fake.text(max_nb_chars=random.randint(5, 100))
        }

        with self.client.post("/v1/embeddings", json=payload, catch_response=True) as response:
            try:
                data = response.json()
                if not isinstance(data, dict):
                    response.failure(f"Response is not a dictionary: {data}")
                else:
                    tokens = data["usage"]["total_tokens"] or 0
                    with open("embeddings_log.csv", "a") as f:
                        f.write(f"{payload['input']},{tokens}\n")

                    response.success()

            except json.JSONDecodeError:
                # Print the raw response if it's not valid JSON
                response.failure(f"Invalid JSON response: {response.text}")
                print(f"INVALID RESPONSE:\n{response.text}")
