# Deployment notes — HTTPS & environment variables

This project requires a reverse-proxy (or hosting platform) to terminate TLS for HTTPS. Below are quick steps to build the frontend to call the HTTPS backend and deploy the backend behind a TLS-terminating reverse proxy (Synology / nginx / Traefik).

1) Frontend: build pointing to HTTPS backend

- Create `actuator-front/.env` (or set environment variables during CI) based on `.env.example`:

  REACT_APP_BACKEND_URL=https://your-backend.example.com
  REACT_APP_ENCRYPTION_KEY=your-32+byte-long-secret-key

- Build the frontend:

  cd actuator-front
  npm install
  npm run build

- Serve the `build/` directory behind your reverse proxy (Synology Application Portal or nginx). Ensure the reverse proxy serves HTTPS.

2) Backend: run behind TLS-terminating reverse proxy

- Create `actuator-back/.env` from `.env.example` and set real secrets.
- Start the backend (example using Node in production):

  cd actuator-back
  npm install
  npm run build
  NODE_ENV=production npm start

- Configure your reverse-proxy (Synology / nginx) to forward external HTTPS requests to the backend HTTP port (e.g., 4000) and to set `X-Forwarded-Proto: https` header. The backend will enforce HTTPS only when `NODE_ENV=production` and trust proxy is enabled.

3) Quick verification

- Test HTTP → HTTPS redirect:

  curl -I http://your-domain.example

  Expect a 301 redirect with Location header pointing to https://...

- Test sanitize on email send (XSS protection): POST to `/api/send-email` with HTML containing `<script>` and verify the script tag is removed.

4) Notes & security

- Keep `REACT_APP_ENCRYPTION_KEY` secret. React env vars are baked into the build; do not commit secrets into source control.
- Use real app passwords (app-specific passwords for Gmail) and secure storage (Vault, environment variables in CI/CD).
- Consider adding CSP and HSTS headers via Helmet for extra security.
