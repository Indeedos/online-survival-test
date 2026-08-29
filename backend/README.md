# Online Survival Test API

Small private progress backend for the optional learner profiles.

## 1. Configure

```bash
cd backend
cp .env.example .env
chmod 600 .env
```

Set strong values for all three passwords/PINs. Prefer nicknames rather than real names for the student display names.

## 2. Start

```bash
docker compose up -d --build
curl http://127.0.0.1:8787/health
```

The SQLite database is stored in `backend/data/survival.db` and must be included in backups.

## 3. Reverse proxy

Expose `https://api.survival.indeedos.cc` and proxy it to `127.0.0.1:8787`.

### Caddy

```caddy
api.survival.indeedos.cc {
    reverse_proxy 127.0.0.1:8787
}
```

### nginx

```nginx
server {
    listen 443 ssl http2;
    server_name api.survival.indeedos.cc;

    location / {
        proxy_pass http://127.0.0.1:8787;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

TLS configuration depends on the existing server setup.

## 4. DNS

Create an `A`/`AAAA` record for `api.survival.indeedos.cc` pointing to the Hetzner server. The frontend is already configured to use that host. Until the API is reachable, the site falls back to guest mode.

## Security notes

- Passwords are stored only as Argon2 hashes.
- Login state uses random server-side sessions in an HttpOnly + Secure cookie.
- Only the configured frontend origin is allowed through CORS.
- Admin and learner roles are enforced by the API, not by frontend JavaScript.
- No email address, birthday, IP history, analytics, or real name is required.
- Do not commit `.env` or `data/survival.db`.
