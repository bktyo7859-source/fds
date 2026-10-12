import urllib.request
import json
import sys

def test_get(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"GET {url} failed with {resp.status}"
        data = json.loads(resp.read().decode("utf-8"))
        print(f"PASS: GET {url}")
        return data

def test_range(url):
    req = urllib.request.Request(url, headers={"Range": "bytes=0-1023"})
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 206, f"Range GET {url} failed with {resp.status}"
        content_length = resp.headers.get("Content-Length")
        content_range = resp.headers.get("Content-Range")
        assert content_length == "1024", f"Expected 1024 bytes, got {content_length}"
        print(f"PASS: Range GET {url} -> 206 Partial Content ({content_range})")

def test_post(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"POST {url} failed with {resp.status}"
        res = json.loads(resp.read().decode("utf-8"))
        pred = res.get("prediction")
        h = res.get("verification_hash")
        print(f"PASS: POST {url} -> Prediction: {pred} (Hash: {h})")
        return res

def main():
    base = "http://127.0.0.1:8000"
    print("Beginning HMX API Integration Testing...")
    test_get(f"{base}/api/health")
    test_get(f"{base}/api/model/card")
    test_get(f"{base}/api/media")
    test_get(f"{base}/api/media/verify")
    props = test_get(f"{base}/api/properties?limit=5")
    assert props["total"] == 545, f"Expected 545 properties, got {props['total']}"
    test_get(f"{base}/api/properties/1")
    pred = test_post(f"{base}/api/predict", {
        "area": 6500, "bedrooms": 4, "bathrooms": 2, "stories": 2, "parking": 2,
        "mainroad": "yes", "guestroom": "no", "basement": "no", "hotwaterheating": "no",
        "airconditioning": "yes", "prefarea": "yes", "furnishingstatus": "furnished"
    })
    assert "verification_hash" in pred, "Missing verification_hash"
    assert "intervals" in pred, "Missing intervals"
    assert pred["prediction"] > 0, "Prediction must be positive"

    test_get(f"{base}/api/sensitivity?feature=area&area=6500&bedrooms=4&bathrooms=2&stories=2&parking=2&mainroad=yes&guestroom=no&basement=no&hotwaterheating=no&airconditioning=yes&prefarea=yes&furnishingstatus=furnished")
    test_get(f"{base}/api/analytics")
    test_range(f"{base}/videos/hero")
    test_range(f"{base}/videos/scroll")

    print("\nALL 11 BACKEND API ENDPOINTS TESTED & PASSED 100%!")

if __name__ == "__main__":
    main()
