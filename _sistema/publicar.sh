#!/bin/bash
# Publica los cambios de la app.
#
# Además de subir a GitHub, le cambia el número de versión a los archivos
# (assets/app.js?v=12, etc.). Sin eso, el teléfono que ya abrió la app se queda
# con la copia vieja guardada en caché y no ve los cambios hasta vaciarla a mano.
#
#   ./_sistema/publicar.sh "qué cambió"

set -e
cd "$(dirname "$0")/.."

mensaje="${1:-Actualización de la app}"
version=$(( $(git rev-list --count HEAD) + 1 ))

sed -i '' -E "s|(assets/[a-z]+\.(js\|css))\?v=[0-9]+|\1?v=${version}|g" index.html

if git diff --quiet && git diff --cached --quiet; then
  echo "No hay nada que publicar."
  exit 0
fi

git add -A
git commit -q -m "$mensaje

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git push -q origin main

echo "Publicado como versión ${version}."
echo "GitHub Pages tarda un minuto en actualizar:"
echo "  https://langab.github.io/embajador/"
