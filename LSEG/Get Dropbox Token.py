import requests

code = input_data['code']
app_key = input_data['app_key']
app_secret = input_data['app_secret']

print("Canjeando código por Refresh Token permanente...")

response = requests.post(
    "https://api.dropbox.com/oauth2/token",
    data={
        "code": code,
        "grant_type": "authorization_code",
        "client_id": app_key,
        "client_secret": app_secret
    }
)

if response.status_code != 200:
    raise Exception(f"Error: {response.text}")

data = response.json()

# ESTE ES EL DATO QUE VALE ORO 👇
refresh_token = data.get('refresh_token')

return {
    "⚠️ GUARDA ESTO": "Copia el refresh_token y úsalo en el script final",
    "refresh_token": refresh_token
}
