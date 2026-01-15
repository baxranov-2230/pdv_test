import urllib.request
import json
import time

BASE_URL = "http://localhost:8000/api/v1"


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
    # 1. Login
    print("Logging in...")
    status, res = request(
        "POST",
        f"{BASE_URL}/auth/access-token",
        data={"username": "admin", "password": "adminpassword"},
    )

    if status != 200:
        print(f"Login failed: {res}")
        return

    token = res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")

    # 2. Create Subject
    subject_name = f"Science_{int(time.time())}"  # Unique name
    print(f"Creating subject: {subject_name}")
    status, sub_res = request(
        "POST", f"{BASE_URL}/subjects/", data={"name": subject_name}, headers=headers
    )

    subject_id = None
    if status == 200:
        print(f"Subject created: {sub_res}")
        subject_id = sub_res["id"]
    else:
        print(f"Failed to create subject: {sub_res}")
        return

    # 3. Create Test with Subject
    test_payload = {
        "title": "Science Exam",
        "description": "Midterm",
        "subject_id": subject_id,
        "questions": [
            {
                "text": "What is H2O?",
                "options": ["Water", "Fire", "Earth", "Air"],
                "correct_option": 0,
            }
        ],
    }
    print(f"Creating test with subject_id: {subject_id}")
    status, test_res = request(
        "POST", f"{BASE_URL}/tests/", data=test_payload, headers=headers
    )

    if status == 200:
        print(f"Test created: {test_res}")

        # 4. Verify Link
        if test_res.get("subject") and test_res["subject"]["id"] == subject_id:
            print("SUCCESS: Test is correctly linked to Subject.")
        else:
            print(
                f"FAILURE: Test subject link missing or incorrect: {test_res.get('subject')}"
            )
    else:
        print(f"Failed to create test: {test_res}")


if __name__ == "__main__":
    verify()
