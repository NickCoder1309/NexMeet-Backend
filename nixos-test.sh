#!/run/current-system/sw/bin/bash
set -e

BASE_URL="http://localhost:3000/api/users"
RESPONSE_DIR="responses"
USER_ID_FILE="user_id.txt"
TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1YTZjMGMyYjgwMDcxN2EzNGQ1Y2JiYmYzOWI4NGI2NzYxMjgyNjUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbWluaXByb3ktMy1iZCIsImF1ZCI6Im1pbmlwcm95LTMtYmQiLCJhdXRoX3RpbWUiOjE3NjM0MTgxNzQsInVzZXJfaWQiOiJDbEJBSHVoV3MzZ1hZNUhNa1pZQWJBYzBLTjUyIiwic3ViIjoiQ2xCQUh1aFdzM2dYWTVITWtaWUFiQWMwS041MiIsImlhdCI6MTc2MzQxODE3NCwiZXhwIjoxNzYzNDIxNzc0LCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidGVzdEB0ZXN0LmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.UAjS_U-d8tK2Udw0B8ImqRPC0Lqm40T_p0UnZZRbLEom7KgxpqA9nejZvpcgLIxbDeZmnchC1hm3u-Daca21jV_gtVJMFywvN7QCptAqIEADtG6KYZEAjr3cybHWN4BINwpiaI-7mccBbpXrrYTDp9pJ7rXCeCgFH7wo1ETT_N704CA-BhvWPJe5HdDX-pIGCKy-1FXf6mZAC7frwxYeeVmPPSsg_KODsBA7rdBHSBAqaHd_7z30hol0X1Ug0bHvwxfto79SCuS4GdLxsMFQIfdaiIT68kmx-mQyB6Y2ZgEDwudCwO6fSAfY1uXHWy8Wj1Lb7eiC7_YSXBjJL5Qeiw"

mkdir -p "$RESPONSE_DIR"

function print() {
  echo -e "\n===================================="
  echo -e "$1"
  echo -e "====================================\n"
}

function save() {
  echo "$2" > "$RESPONSE_DIR/$1.json"
}

# ----------------------------------------
#  VALIDAR TOKEN
# ----------------------------------------

if [ -z "$TOKEN" ]; then
  echo "ERROR: No hay token"
  exit 1
fi

print "TOKEN recibido correctamente"


# ----------------------------------------
#  REGISTER USER
# ----------------------------------------

print "Probando: POST /registerUser"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/registerUser" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "age": 25,
    "photoURL": "https://example.com/photo.png"
  }')

echo "$REGISTER_RESPONSE"
save "register" "$REGISTER_RESPONSE"


# Obtener ID
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.id // empty')

# Si ya existía
if [ -z "$USER_ID" ]; then
  EXISTS=$(echo "$REGISTER_RESPONSE" | jq -r '."message" // empty')

  if [[ "$EXISTS" == "El usuario ya existe" ]]; then
    USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.id')
  fi
fi

if [ -z "$USER_ID" ]; then
  echo "ERROR: No se pudo detectar userId"
  exit 1
fi

echo "$USER_ID" > "$USER_ID_FILE"

print "USER_ID = $USER_ID"


# ----------------------------------------
#  GET USER BY ID
# ----------------------------------------

print "Probando: GET /users/:userId"

GET_USER=$(curl -s "$BASE_URL/users/$USER_ID")
echo "$GET_USER"
save "get_user" "$GET_USER"


# ----------------------------------------
#  GET ALL USERS
# ----------------------------------------

print "Probando: GET /users"

ALL_USERS=$(curl -s "$BASE_URL/users")
echo "$ALL_USERS"
save "get_all_users" "$ALL_USERS"


# ----------------------------------------
#  UPDATE USER
# ----------------------------------------

print "Probando: PUT /users/:userId"

UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Usuario Actualizado", "age": 30}')

echo "$UPDATE_RESPONSE"
save "update_user" "$UPDATE_RESPONSE"


# ----------------------------------------
#  DELETE USER
# ----------------------------------------

print "Probando: DELETE /users/:userId"

DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/users/$USER_ID")
echo "$DELETE_RESPONSE"
save "delete_user" "$DELETE_RESPONSE"


print "PRUEBAS COMPLETADAS"
echo "User ID eliminado: $USER_ID"
echo "Responses guardados en $RESPONSE_DIR/"
