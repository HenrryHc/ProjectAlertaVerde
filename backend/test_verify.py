import hashlib, secrets
from datetime import datetime
from fastapi.testclient import TestClient
from backend.core.security import create_access_token, decode_access_token, hash_password, verify_password, needs_rehash
from backend.schemas.usuarios import Usuario

# Test 1: Argon2 hash verification
h = hash_password('secreto123')
print('Hash:', h)
assert h.startswith('$argon2id$'), 'Expected argon2id prefix'
assert verify_password('secreto123', h), 'Should verify correct password'
assert not verify_password('otra', h), 'Should reject wrong password'
assert not needs_rehash(h), 'New hash should not need rehash'
print('Argon2 hash verification works')

# Test 2: Legacy PBKDF2 detection
salt = secrets.token_hex(16)
digest = hashlib.pbkdf2_hmac('sha256', b'secreto123', bytes.fromhex(salt), 260000)
legacy = '$'.join(['pbkdf2_sha256', '260000', salt, digest.hex()])
print('Legacy:', legacy)
assert verify_password('secreto123', legacy), 'Should verify legacy PBKDF2'
assert needs_rehash(legacy), 'Legacy hash should need rehash'
print('Legacy PBKDF2 detection works')

# Test 3: JWT creation and decode
u = Usuario(id=7, email='ana@ejemplo.com', fecha_creacion=datetime.now())
t = create_access_token(u)
payload = decode_access_token(t)
print('Payload:', payload)
assert payload['sub'] == '7', 'sub should be 7'
assert payload['email'] == 'ana@ejemplo.com', 'email mismatch'
print('JWT creation and decode works')

# Test 4: 401 without token
from backend.main import app
c = TestClient(app)
r = c.get('/reportes')
print('No token status:', r.status_code, 'headers ww-auth:', r.headers.get('www-authenticate'))
assert r.status_code == 401, f'Expected 401 without token, got {r.status_code}'
assert r.headers.get('www-authenticate') == 'Bearer', 'Should include WWW-Authenticate: Bearer'
print('401 without token works')

# Test 5: 401 with bad token
r = c.get('/reportes', headers={'Authorization': 'Bearer basura123'})
print('Bad token status:', r.status_code)
assert r.status_code == 401, f'Expected 401 with bad token, got {r.status_code}'
print('401 with bad token works')

# Test 6: Token excluded from docs (auto_error=False)
from backend.core.security import _bearer
print('Bearer auto_error:', _bearer.auto_error)
assert _bearer.auto_error == False, 'Bearer should have auto_error=False'
print('Bearer auto_error=False configured')

print()
print('Todas las pruebas pasaron.')