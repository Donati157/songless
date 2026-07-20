#!/bin/bash
# Deploy do Atenis Games — agora pela VERCEL (auto-deploy a cada push no GitHub).
# Uso: ./deploy.sh "mensagem do commit"
set -e
cd "$(dirname "$0")"
GIT=/Applications/Xcode.app/Contents/Developer/usr/bin/git   # git do sistema travado por licença Xcode
MSG="${1:-Atualização do site}"
$GIT add -A
$GIT commit -m "$MSG" || echo "(nada novo pra commitar)"
$GIT push origin main
echo "✅ Enviado pro GitHub (Donati157/songless) — a Vercel publica automaticamente."
