import os, httpx, json
def run():
    with open('/home/ubuntu/Answerbase/.env') as f:
        for line in f:
            if line.strip() and '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                os.environ[k] = v
    key = os.environ.get('AI_GATEWAY_API_KEY', '')
    resp = httpx.get(f'https://generativelanguage.googleapis.com/v1beta/models?key={key}', timeout=10)
    data = resp.json()
    models = [m['name'] for m in data.get('models', []) if 'embed' in m['name'].lower()]
    print(json.dumps(models, indent=2))

if __name__ == '__main__':
    run()
