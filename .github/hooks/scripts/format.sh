#!/bin/bash
# ─────────────────────────────────────────────────────────────
# ✨ FORMAT — Formatea el código automáticamente después de
#    cada cambio
# 📌 Se ejecuta en: postToolUse (después de que el agente
#    escribe o modifica un archivo)
# 🛠️ Herramienta: Prettier
# ─────────────────────────────────────────────────────────────

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Solo formatear después de herramientas que escriben archivos
if ! [[ "$TOOL_NAME" =~ ^(replace_string_in_file|multi_replace_string_in_file|create_file|run_in_terminal|run_task)$ ]]; then
  echo "[format.sh] ⏭️  Skipped (read-only tool): $TOOL_NAME"
  exit 0
fi

# Extraer rutas de archivo según el tipo de herramienta
if [[ "$TOOL_NAME" == "multi_replace_string_in_file" ]]; then
  FILES=$(echo "$INPUT" | jq -r '.tool_input.replacements[].filePath // empty' | sort -u)
else
  FILES=$(echo "$INPUT" | jq -r '.tool_input.filePath // empty')
fi

if [ -z "$FILES" ]; then
  echo "[format.sh] ⚠️  No filePath found in input"
  exit 0
fi

# Formatear cada archivo
while IFS= read -r FILE; do
  [ -z "$FILE" ] && continue

  # Solo formatear archivos del proyecto web
  EXT="${FILE##*.}"
  if ! [[ "$EXT" =~ ^(js|jsx|ts|tsx|astro|css|html|json|md)$ ]]; then
    echo "[format.sh] ⏭️  No es un archivo formateable: $FILE"
    continue
  fi

  # Verificar que prettier está disponible
  if ! command -v npx &>/dev/null; then
    echo "[format.sh] ⚠️  npx no disponible — saltando format"
    exit 0
  fi

  # El archivo debe existir
  if [ ! -f "$FILE" ]; then
    echo "[format.sh] ⚠️  File not found: $FILE"
    continue
  fi

  # Ejecutar Prettier
  echo "[format.sh] 📝 Formatting: $FILE"
  BEFORE=$(stat -f%z "$FILE" 2>/dev/null || stat -c%s "$FILE" 2>/dev/null)
  FORMAT_OUTPUT=$(npx prettier --write "$FILE" 2>&1)
  EXIT_CODE=$?
  AFTER=$(stat -f%z "$FILE" 2>/dev/null || stat -c%s "$FILE" 2>/dev/null)

  if [ $EXIT_CODE -ne 0 ]; then
    echo "[format.sh] ❌ Formatter error: $FORMAT_OUTPUT"
  elif [ "$BEFORE" = "$AFTER" ]; then
    echo "[format.sh] ✅ No changes needed"
  else
    echo "[format.sh] ✨ File formatted successfully"
  fi
done <<< "$FILES"
