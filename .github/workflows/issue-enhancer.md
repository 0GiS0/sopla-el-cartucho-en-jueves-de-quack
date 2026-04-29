---
name: ✨ Mejorador de Issues

on:
  issues:
    types: [opened, reopened]

permissions:
  contents: read
  issues: read
  pull-requests: read

engine: copilot

network:
  allowed:
    - defaults
    - node
tools:
  github:
    toolsets: [default]

safe-outputs:
  add-comment:
    max: 1    
  add-labels:
    max: 2
    allowed:
      [
        "🐤 quack-feature",
        "🎮 UI/UX",
        "🎨 diseño",
        "⚡ rendimiento",
        "✨ mejora",
        "🐛 bug",
        "📝 documentación",
        "📺 contenido",
        "🔧 refactor",
        "🤖 agentic",
      ]
        
  update-issue:

---

# Mejorador de Issues

## Issue a mejorar

| Campo  | Valor          |
| ------ | -------------- |
| Número | #$ISSUE_NUMBER |
| Autor  | @$ISSUE_AUTHOR |
| Título | $ISSUE_TITLE   |
| Cuerpo | $ISSUE_BODY    |

## Tus tareas

### 1. Obtener contexto

- Lee el README para entender el proyecto
- Lista las etiquetas del repositorio (las necesitarás después)

### 2. Mejorar el título

Añade un emoji como prefijo según el tipo de issue:

Ejemplo: `🐛 Corregir error de login cuando la contraseña contiene caracteres especiales`

### 3. Reestructurar el cuerpo

Usa secciones claras con headers con emojis:

**Para bugs:**

```
## 🐛 Descripción
## 📋 Pasos para reproducir
## ✅ Comportamiento esperado vs ❌ Comportamiento actual
```

**Para features:**

```
## ✨ Descripción
## 🎯 ¿Por qué es necesario?
## 📐 Solución propuesta
```

### 4. Añadir pie de página

```
---
> ✍️ *Mejorado por GitHub Copilot. Autor original: @$ISSUE_AUTHOR*
```

### 5. Aplicar cambios

- **Actualizar** el issue #$ISSUE_NUMBER con el nuevo título y cuerpo
- **Asignar** de 1 a 2 etiquetas relevantes
- **Comentar** con un breve resumen de las mejoras realizadas

## Reglas

- Nunca cambiar el significado original
- Si ya está bien escrito, hacer cambios mínimos
- Mantenerlo útil, no verboso
- Siempre usar emojis para mejorar la claridad y atractivo visual
