import os, asyncio, httpx

def load_env():
    with open('/home/ubuntu/Answerbase/.env') as f:
        for line in f:
            line = line.strip()
            if line and '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                os.environ[k] = v

async def test():
    load_env()
    key = os.environ.get('AI_GATEWAY_API_KEY', '')
    print('Key format valid:', key.startswith('AIza'))
    url = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents'
    headers = {'x-goog-api-key': key, 'Content-Type': 'application/json'}
    payload = {'requests': [{'model': 'models/text-embedding-004', 'content': {'parts': [{'text': 'test'}]}}]}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, headers=headers, json=payload)
            print('Embedding Status:', resp.status_code)
            print('Embedding Response:', resp.text[:500])
    except Exception as e:
        print('Embedding Exception:', str(e))
        
    url2 = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
    payload2 = {'contents': [{'role': 'user', 'parts': [{'text': 'hello'}]}]}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp2 = await client.post(url2, headers=headers, json=payload2)
            print('Chat Status:', resp2.status_code)
            print('Chat Response:', resp2.text[:500])
    except Exception as e:
        print('Chat Exception:', str(e))

if __name__ == '__main__':
    asyncio.run(test())
