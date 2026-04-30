#!/usr/bin/env node
/**
 * Genera avatares estilo pixel-art para los cartuchos.
 *
 * Uso:
 *   node scripts-generate-avatars.mjs \
 *     --input <ruta-imagen-original> \
 *     --slug  <nombre-base-sin-extension> \
 *     --outDir <directorio-destino> \
 *     [--overwrite]
 *
 * Proceso:
 *   1. Recorte cuadrado centrado en la parte superior (gravity: north)
 *      → Las thumbnails de YouTube suelen mostrar la cara en la mitad superior.
 *   2. Reducción a 40×40 px con kernel 'nearest' para obtener el bloqueo pixel-art.
 *   3. Ampliación a 200×200 px con kernel 'nearest' para que el efecto sea visible.
 *   4. Guardado como PNG en <outDir>/<slug>.png
 */

import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';

// ── Parseo de argumentos ────────────────────────────────────────────────────
const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
}

const inputPath = getArg('--input');
const slug = getArg('--slug');
const outDir = getArg('--outDir');
const overwrite = args.includes('--overwrite');

if (!inputPath || !slug || !outDir) {
  process.stderr.write(
    'Uso: node scripts-generate-avatars.mjs --input <path> --slug <slug> --outDir <dir> [--overwrite]\n'
  );
  process.exit(1);
}

const outPath = path.join(outDir, `${slug}.png`);

// ── Comprobar si ya existe ──────────────────────────────────────────────────
if (!overwrite) {
  try {
    await fs.access(outPath);
    // Ya existe y no se fuerza la regeneración → salir limpiamente
    process.exit(0);
  } catch {
    // No existe → continuar
  }
}

// ── Generación del avatar pixel-art ────────────────────────────────────────
await fs.mkdir(outDir, { recursive: true });

const image = sharp(inputPath);
const meta = await image.metadata();

const { width = 0, height = 0 } = meta;

// Tamaño del lado del recorte cuadrado: el mínimo entre ancho y alto
const side = Math.min(width, height);

// Offset horizontal: centrar horizontalmente
const left = Math.floor((width - side) / 2);

// Offset vertical: usar el 20% superior para capturar la zona del rostro.
// La mayoría de thumbnails de YouTube muestran a la persona en la mitad superior.
const top = Math.floor(height * 0.05);
const adjustedSide = Math.min(side, height - top);

await image
  .extract({ left, top, width: adjustedSide, height: adjustedSide })
  // Paso 1: reducir a 40×40 con nearest para crear el efecto pixelado
  .resize(40, 40, { kernel: 'nearest', fit: 'fill' })
  // Paso 2: ampliar a 200×200 con nearest para mantener los bloques nítidos
  .resize(200, 200, { kernel: 'nearest', fit: 'fill' })
  .png()
  .toFile(outPath);

process.stdout.write(`[generate-avatars] ✅ ${outPath}\n`);
