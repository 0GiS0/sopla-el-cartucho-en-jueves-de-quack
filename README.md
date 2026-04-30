# 🦆 Jueves de Quack — Sopla el Cartucho

<p align="center">
  <a href="https://0GiS0.github.io/sopla-el-cartucho-en-jueves-de-quack"><img src="https://img.shields.io/badge/🌐_Web-GitHub_Pages-brightgreen?style=for-the-badge" alt="GitHub Pages"></a>
  <a href="https://www.youtube.com/@GitHub"><img src="https://img.shields.io/badge/YouTube-GitHub-red?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube"></a>
  <a href="https://github.com/0GiS0"><img src="https://img.shields.io/github/followers/0GiS0?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
</p>

---

Una web retro con estilo **Game Boy** que muestra las sesiones de **Jueves de Quack**, la iniciativa comunitaria del canal de [GitHub en YouTube](https://www.youtube.com/@GitHub) en español.

Cada sesión se representa como un **cartucho de Game Boy**. Al hacer click en un cartucho, la portada se carga en la consola y al pulsar **START** se abre el vídeo de YouTube correspondiente.

## ✨ Características

- 🎮 **Diseño retro Game Boy** — Interfaz nostálgica con estética pixel art
- 📼 **Cartuchos de sesiones** — Cada episodio de Jueves de Quack tiene su propio cartucho
- 🦆 **Datos de YouTube RSS** — Las sesiones se obtienen automáticamente del feed RSS del canal
- 🎬 **Start → YouTube** — Al pulsar START en la consola, se abre el vídeo del cartucho seleccionado
- 📱 **Responsive** — Funciona en desktop y móvil

## 🚀 Stack tecnológico

| Tecnología                                    | Uso                                        |
| --------------------------------------------- | ------------------------------------------ |
| [Astro](https://astro.build/)                 | Framework web estático (SSG)               |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estático en todo el proyecto        |
| [Sharp](https://sharp.pixelplumbing.com/)     | Pipeline de generación de assets pixel art |
| CSS Custom Properties                         | Theming retro sin dependencias externas    |

## 🛠️ Instalación y desarrollo local

```bash
# Clonar el repositorio
git clone https://github.com/0GiS0/sopla-el-cartucho-en-jueves-de-quack.git
cd sopla-el-cartucho-en-jueves-de-quack

# Instalar dependencias (requiere Node.js >= 18)
npm install

# Descargar sesiones desde YouTube RSS
npm run fetch-sessions

# Iniciar servidor de desarrollo
npm run dev
# → http://localhost:4321

# Build para producción
npm run build
```

## 📁 Estructura del proyecto

```
src/
├── components/     # Componentes Astro
│   ├── Console.astro        # Consola Game Boy CSS
│   ├── CartridgeCard.astro  # Cartucho de sesión
│   └── Navigation.astro     # Navegación
├── data/           # Datos de sesiones y assets
├── layouts/        # Layouts base
├── lib/            # Utilidades y helpers
├── pages/          # Páginas de la web
├── schemas/        # Esquemas Zod
├── styles/         # Estilos globales
└── types/          # Tipos TypeScript
scripts/
├── fetch-sessions.ts    # Descarga sesiones del feed RSS de YouTube
├── generate-assets.ts   # Genera avatares 8-bit
└── generate-covers.ts   # Genera portadas de cartuchos
```

## 🎨 Créditos de diseño (CodePen)

El diseño retro se basa en trabajos publicados en CodePen bajo licencia MIT:

| Componente                                 | Autor     | Enlace                                                                       |
| ------------------------------------------ | --------- | ---------------------------------------------------------------------------- |
| Game Boy CSS art (`Console.astro`)         | Brandon   | [codepen.io/brundolf/pen/beagbQ](https://codepen.io/brundolf/pen/beagbQ)     |
| Game Boy cartridge (`CartridgeCard.astro`) | Van Huynh | [codepen.io/worksbyvan/pen/MoxroE](https://codepen.io/worksbyvan/pen/MoxroE) |

## 📄 Licencia

MIT
