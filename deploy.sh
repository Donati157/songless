#!/bin/bash
# Auto-deploy do Atenis Games pro Netlify (mesmo site, mesma URL).
# Lê o token de ~/.atenis_netlify_token e o Site ID de ~/.atenis_netlify_site
# (arquivos privados, fora do git). Uso: ./deploy.sh
set -e
cd "$(dirname "$0")"

TOKEN="${NETLIFY_AUTH_TOKEN:-$(cat ~/.atenis_netlify_token 2>/dev/null)}"
SITE_ID="${NETLIFY_SITE_ID:-$(cat ~/.atenis_netlify_site 2>/dev/null)}"

if [ -z "$TOKEN" ] || [ -z "$SITE_ID" ]; then
  echo "❌ Falta token (~/.atenis_netlify_token) ou Site ID (~/.atenis_netlify_site)."
  exit 1
fi

ZIP="/tmp/atenis-deploy.zip"
rm -f "$ZIP"
zip -r -q "$ZIP" index.html game.html css js games -x '*.DS_Store'

echo "📦 Enviando para o Netlify (site $SITE_ID)…"
HTTP=$(curl -s -o /tmp/atenis-deploy-resp.json -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary "@$ZIP" \
  "https://api.netlify.com/api/v1/sites/$SITE_ID/deploys")

if [ "$HTTP" = "200" ] || [ "$HTTP" = "201" ]; then
  URL=$(grep -o '"ssl_url":"[^"]*"' /tmp/atenis-deploy-resp.json | head -1 | cut -d'"' -f4)
  echo "✅ Publicado! $URL"
else
  echo "❌ Falhou (HTTP $HTTP). Resposta:"; cat /tmp/atenis-deploy-resp.json; echo
  exit 1
fi
