import urllib.request
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"
TOKEN = sys.argv[1] if len(sys.argv) > 1 else ""

if not TOKEN:
    print("Please provide token as argument")
    sys.exit(1)


def request(method, url, data=None, headers={}):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode() if data else None,
        headers=headers,
        method=method,
    )
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())
    except Exception as e:
        print(f"Request failed: {e}")
        return 500, str(e)


def verify():
    headers = {"Authorization": f"Bearer {TOKEN}"}

    # 1. Get Tests
    print("Fetching tests...")
    status, tests = request("GET", f"{BASE_URL}/tests/", headers=headers)
    if status != 200:
        print(f"Failed to fetch tests: {tests}")
        return

    print(f"Tests found: {len(tests)}")
    if not tests:
        print("No tests to take. Creating one first...")
        # Need admin token for this, skipping or assuming manual creation.
        return

    test_id = tests[0]["id"]
    print(f"Taking test ID: {test_id}")

    # 2. Get Single Test
    status, test = request("GET", f"{BASE_URL}/tests/{test_id}", headers=headers)
    if status != 200:
        print(f"Failed to get test details: {test}")
        return

    # 3. Submit Test
    answers = [0] * len(test["questions"])  # Assume option 0 for all
    payload = {"test_id": test_id, "answers": answers}

    print(f"Submitting answers: {answers}")
    status, res = request(
        "POST", f"{BASE_URL}/tests/submit", data=payload, headers=headers
    )

    if status == 200:
        print(f"SUCCESS: Test submitted. Score: {res.get('score')}")
    else:
        print(f"FAILURE: Submission error: {res}")


if __name__ == "__main__":
    verify()
