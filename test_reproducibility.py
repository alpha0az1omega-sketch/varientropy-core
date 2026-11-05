import json, subprocess, tempfile, os, shutil
from pathlib import Path

def run_vdg(cwd):
    subprocess.run(["python", "src/vdg.py"], check=True, cwd=cwd, capture_output=True, text=True)
    files = sorted(Path(cwd, "experiments").glob("vdg_result_*.json"))
    return json.loads(files[-1].read_text())

def test_reproducibility():
    with tempfile.TemporaryDirectory() as d1, tempfile.TemporaryDirectory() as d2:
        for d in (d1, d2):
            os.makedirs(os.path.join(d, "src"))
            os.makedirs(os.path.join(d, "experiments"))
            shutil.copy("src/vdg.py", os.path.join(d, "src/vdg.py"))
        r1 = run_vdg(d1)
        r2 = run_vdg(d2)
        r1.pop("timestamp", None)
        r2.pop("timestamp", None)
        assert r1 == r2, "VDG output is not reproducible"
        print("✔️ Test de reproductibilité : OK")

if __name__ == "__main__":
    test_reproducibility()
