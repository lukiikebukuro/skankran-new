"""Test /api/log-event endpoint"""
import requests
import json

url = 'http://127.0.0.1:5000/api/log-event'

test_data = {
    'action_type': 'search_city',
    'query_data': {
        'city_name': 'TestowaWarszawa'
    }
}

print(f"Wysyłam POST do {url}...")
print(f"Dane: {json.dumps(test_data, indent=2)}")

try:
    response = requests.post(url, json=test_data)
    print(f"\n✅ Status: {response.status_code}")
    print(f"Odpowiedź: {response.text}")
except Exception as e:
    print(f"\n❌ Błąd: {e}")
