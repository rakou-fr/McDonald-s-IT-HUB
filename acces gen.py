import json
import os
import base64
import hashlib
import uuid
from datetime import datetime, timezone


rolelist = ["admin", "it", "user", "manager"]
chartspe = ["$","%","&","/","(",")","=","?","^","*","-","_","+","@","#","<",">",",",".",":",";","!"]

def hash_password(password: str) -> str:
    """Génère un hash sécurisé PBKDF2-SHA256 (600 000 itérations)."""
    salt = os.urandom(16)
    iterations = 600000
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations)
    salt_b64 = base64.b64encode(salt).decode('utf-8')
    key_b64 = base64.b64encode(key).decode('utf-8')
    return f"pbkdf2:sha256:{iterations}${salt_b64}${key_b64}"

def add_or_update_user(json_file_path: str, username: str, password_plain: str, role: str):
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = {"version": "1.0", "updated_at": "", "users": []}

    password_hash = hash_password(password_plain)

    if role not in rolelist:
        print(f"[ERROR] Le role `{role}` n'est pas valide, choisir parmis : ", rolelist)
        return
    if password_plain not in chartspe or len(password_plain) < 8 or not any(c.isupper() for c in password_plain) or not any(c.islower() for c in password_plain) or not any(c.isdigit() for c in password_plain):
        print(f"[ERROR] Le mot de passe '{password_plain}' ne respecte pas les critères de sécurité.")
        return

    user_found = False
    for user in data["users"]:
        if user["username"].lower() == username.lower():
            user["password_hash"] = password_hash
            user["role"] = role
            user_found = True
            print(f"[UPDATE] Mot de passe mis à jour pour '{username}'.")
            break

    if not user_found:
        data["users"].append({
            "id": f"usr_{uuid.uuid4().hex[:8]}",
            "username": username,
            "password_hash": password_hash,
            "role": role,
            "active": True
        })
        print(f"[CREATE] Nouvel utilisateur '{username}' ajouté.")

    data["updated_at"] = datetime.now(timezone.utc).isoformat()

    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"[OK] Fichier '{json_file_path}' mis à jour avec succès.\n")

if __name__ == "__main__":
    JSON_PATH = "IT services.json"
    print("Liste roles possibles : ", rolelist)
    if len(rolelist) == 0:
        print("[ERROR] Aucun rôle défini. Veuillez définir au moins un rôle dans la liste 'rolelist'.")
    add_or_update_user(JSON_PATH, "ahkbhfkkahk", "rootedby", role="admin")
    add_or_update_user(JSON_PATH, "Mathieu", "skibidi", role="manager")