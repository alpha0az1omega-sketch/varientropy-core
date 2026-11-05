import os, requests

def generate_hypotheses(prompt: str, n: int = 20) -> list[str]:
    api_key = os.environ["FLINT_API_KEY"]
    url = "https://api.springboards.ai/v1/generate"  # endpoint à confirmer
    payload = {"prompt": prompt, "n": n, "temperature": 1.2, "top_p": 0.95}
    r = requests.post(url, json=payload, headers={"Authorization": f"Bearer {api_key}"})
    r.raise_for_status()
    return [item["text"] for item in r.json()["outputs"]]
