import json
import urllib.request
import urllib.error

# L'adresse de ton API en production (Vercel)
API_URL = "https://varientropy-core.vercel.app/api/vdg"

def get_divergence_score(text):
    """Envoie le texte à l'API Vercel et récupère le score."""
    data = json.dumps({"query": text}).encode('utf-8')
    req = urllib.request.Request(API_URL, data=data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            return float(result['metrics']['divergence_score'])
    except Exception as e:
        print(f"Erreur pour '{text}': {e}")
        return None

def run_benchmark():
    print("=== DÉMARRAGE DU GOLD STANDARD BENCHMARK ===")
    print("Note: Le premier appel peut prendre quelques secondes (chargement du modèle IA).")
    
    with open('benchmark_data.json', 'r') as f:
        data = json.load(f)

    scores = {"historical": [], "paraphrase": [], "nonsense": []}

    # Test 1: Découvertes historiques (Doit être ÉLEVÉ)
    print("\n[1] Test des Découvertes Historiques :")
    for text in data['historical_discoveries']:
        score = get_divergence_score(text)
        if score is not None:
            scores["historical"].append(score)
            print(f" - Score: {score:.4f} | {text[:40]}...")

    # Test 2: Reformulations (Doit être MOYEN/BAS)
    print("\n[2] Test des Reformulations :")
    for text in data['paraphrases']:
        score = get_divergence_score(text)
        if score is not None:
            scores["paraphrase"].append(score)
            print(f" - Score: {score:.4f} | {text[:40]}...")

    # Test 3: Absurdités (Doit être REJETÉ ou TRÈS BAS)
    print("\n[3] Test des Absurdités :")
    for text in data['nonsense']:
        score = get_divergence_score(text)
        if score is not None:
            scores["nonsense"].append(score)
            print(f" - Score: {score:.4f} | {text[:40]}...")

    # Analyse des résultats
    print("\n=== RÉSULTATS FINAUX ===")
    avg_hist = sum(scores["historical"]) / len(scores["historical"]) if scores["historical"] else 0
    avg_para = sum(scores["paraphrase"]) / len(scores["paraphrase"]) if scores["paraphrase"] else 0
    avg_non = sum(scores["nonsense"]) / len(scores["nonsense"]) if scores["nonsense"] else 0

    print(f"Moyenne Découvertes (Attendu: Élevé) : {avg_hist:.4f}")
    print(f"Moyenne Reformulations (Attendu: Bas) : {avg_para:.4f}")
    print(f"Moyenne Absurdités (Attendu: Bas)     : {avg_non:.4f}")

    if avg_hist > avg_para and avg_hist > avg_non:
        print("\n✅ SUCCÈS : L'algorithme distingue correctement la nouveauté.")
    else:
        print("\n❌ ÉCHEC : L'algorithme doit être recalibré.")

if __name__ == "__main__":
    run_benchmark()
