#!/run/current-system/sw/bin/bash
set -e

BASE_URL="http://localhost:3000"
TOKEN_FILE="token.txt"
USER_ID_FILE="user_id.txt"
RESPONSE_DIR="responses"

mkdir -p $RESPONSE_DIR


function print() {
  echo -e "\n======================================="
  echo -e "$1"
  echo -e "=======================================\n"
}

function save_response() {
  echo "$2" > "$RESPONSE_DIR/$1.json"
}


if [ ! -f "$TOKEN_FILE" ]; then
  print "No existe token.txt. Guarda aquí tu Firebase ID Token"
  exit 1
fi

TOKEN=$(cat $TOKEN_FILE)


print "Probando: POST /registerUser"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/registerUser" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Ricky Test",
    "age": 22,
    "photoURL": "https://example.com/photo.png"
  }')

echo "$REGISTER_RESPONSE"
save_response "register" "$REGISTER_RESPONSE"

USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.id // .userCreated.id // empty')

if [ -z "$USER_ID" ]; then
  echo "$REGISTER_RESPONSE" | grep -q "El usuario ya existe"
  if [ $? -eq 0 ]; then
    USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.id')
  fi
fi

echo "$USER_ID" > $USER_ID_FILE

print "USER_ID: $USER_ID"


print "Probando: GET /users/:userId"

GET_USER=$(curl -s "$BASE_URL/users/$USER_ID")
echo "$GET_USER"
save_response "get_user" "$GET_USER"


print "Probando: GET /users"

ALL_USERS=$(curl -s "$BASE_URL/users")
echo "$ALL_USERS"
save_response "get_all_users" "$ALL_USERS"


print "Probando: PUT /users/:userId"

UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Nuevo Nombre", "age": 30}')

echo "$UPDATE_RESPONSE"
save_response "update_user" "$UPDATE_RESPONSE"


print "Probando: DELETE /users/:userId"

DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/users/$USER_ID")
echo "$DELETE_RESPONSE"
save_response "delete_user" "$DELETE_RESPONSE"

print "TODAS LAS PRUEBAS FINALIZADAS"
echo "Responses guardados en $RESPONSE_DIR/"
echo "User ID eliminado: $USER_ID"
