#!/bin/bash
# ─────────────────────────────────────────────────────────────
# 🔍 LINT — Verifica la calidad del código antes de escribir
# 📌 Se ejecuta en: preToolUse (antes de que el agente
#    escriba o modifique un archivo)
# 🛠️ Herramienta: ESLint
# ─────────────────────────────────────────────────────────────

# ── Helpers para responder al hook ──────────────────────────
allow() {
  jq -n --arg reason "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      permissionDecisionReason: $reason
    }
  }'
  exit 0
}

deny() {
  jq -n --arg reason "$1" --arg context "$2" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason,
      additionalContext: $context
    }
  }'
  exit 1
}

# ── Lógica principal ────────────────────────────────────────
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE=$(echo "$INPUT" | jq -r '.tool_input.filePath // empty')

# Solo lint en herramientas que escriben archivos
[[ "$TOOL_NAME" =~ ^(replace_string_in_file|multi_replace_string_in_file|create_file|run_in_terminal|run_task)$ ]] \
  || allow "⏭️ Read-only tool, no lint needed"

# Necesitamos una ruta de archivo
[ -z "$FILE" ] && allow "⏭️ No filePath in input"

# Solo lint en archivos JS/TS/Astro
EXT="${FILE##*.}"
[[ "$EXT" =~ ^(js|jsx|ts|tsx|astro)$ ]] || allow "⏭️ No es un archivo JS/TS/Astro"

# El archivo debe existir
[ ! -f "$FILE" ] && deny "⚠️ File not found: $FILE" ""

# Verificar que eslint está disponible
command -v npx &> /dev/null || allow "⚠️ npx no disponible — saltando lint"

# Ejecutar ESLint
if LINT_OUTPUT=$(npx eslint "$FILE" 2>&1); then
  allow "✅ Linting passed for $FILE"
else
  deny "❌ Linting failed for $FILE" "$LINT_OUTPUT"
fi
