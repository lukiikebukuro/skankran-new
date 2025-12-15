from dotenv import load_dotenv
import os
load_dotenv()

import google.generativeai as genai

api_key = os.getenv('GOOGLE_API_KEY')
print(f'API Key loaded: {api_key[:20]}...' if api_key else 'NO API KEY!')

genai.configure(api_key=api_key)

print('Available models:')
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f'  ✅ {m.name}')

print('\nTesting gemini-2.5-flash...')
try:
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content('Say hello in Polish!')
    print(f'✅ Bot works! Response: {response.text[:100]}')
except Exception as e:
    print(f'❌ Error: {e}')
