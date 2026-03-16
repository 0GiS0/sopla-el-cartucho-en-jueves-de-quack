import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execSync } from 'node:child_process';
import { SessionsFileSchema } from '../src/schemas/talk';

const SEARCH_URL = 'https://www.youtube.com/@GitHub/search?query=jueves+de+quack';
const OUT_PATH = path.join('src', 'data', 'sessions.json');
const CACHE_PATH = path.join('.cache', 'sessions', 'yt-dlp.json');

// Title patterns that identify a Jueves de Quack episode
const QUACK_PATTERN = /jueves\s+(?:de|en)\s+(?:quack|quak|cuack)/i;

function slugify(s: string) {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractSpeakerFromTitle(title: string): string | null {
  // "… con @guest" or "… con Guest Name"
  const m = title.match(/\s+con\s+(.+?)$/i);
  if (m) return m[1].replace(/^@/, '').trim();
  return null;
}

function formatDate(yyyymmdd: string): string {
  // "20250905" → "2025-09-05"
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

/**
 * Step 1: Search the channel for Jueves de Quack videos (flat-playlist gives IDs + titles fast).
 * Step 2: For each matching video, fetch full metadata (upload_date, description) individually.
 */
function discoverVideoIds(): Array<{ id: string; title: string }> {
  process.stderr.write('Searching channel for Jueves de Quack videos...\n');
  const raw = execSync(
    `yt-dlp --flat-playlist -j "${SEARCH_URL}"`,
    { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, timeout: 60_000 }
  );

  const results: Array<{ id: string; title: string }> = [];
  for (const line of raw.split('\n').filter(Boolean)) {
    try {
      const entry = JSON.parse(line);
      const id: string = entry.id ?? '';
      const title: string = entry.title ?? '';
      // Skip playlists
      if (id.startsWith('PL')) continue;
      if (QUACK_PATTERN.test(title)) {
        results.push({ id, title });
      }
    } catch { /* skip malformed lines */ }
  }

  process.stderr.write(`  Found ${results.length} candidate videos\n`);
  return results;
}

type VideoMeta = {
  id: string;
  title: string;
  upload_date: string;
  description: string;
  thumbnail: string;
};

function fetchVideoMeta(videoId: string): VideoMeta | null {
  try {
    const raw = execSync(
      `yt-dlp --skip-download --print "%(id)s\t%(upload_date)s\t%(title)s\t%(description)s\t%(thumbnail)s" "https://www.youtube.com/watch?v=${videoId}"`,
      { encoding: 'utf8', maxBuffer: 1024 * 1024, timeout: 30_000, stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();

    const parts = raw.split('\t');
    if (parts.length < 5) return null;

    return {
      id: parts[0],
      upload_date: parts[1],
      title: parts[2],
      description: parts[3],
      thumbnail: parts[4],
    };
  } catch {
    return null;
  }
}

async function main() {
  // Check yt-dlp is available
  try {
    execSync('yt-dlp --version', { stdio: 'pipe' });
  } catch {
    process.stderr.write('ERROR: yt-dlp is required. Install it: pip install yt-dlp\n');
    process.exitCode = 1;
    return;
  }

  const candidates = discoverVideoIds();

  process.stderr.write('Fetching metadata for each video...\n');
  const sessions: Array<any> = [];

  for (const { id, title: searchTitle } of candidates) {
    process.stderr.write(`  ${id} ${searchTitle.slice(0, 50)}...`);
    const meta = fetchVideoMeta(id);
    if (!meta) {
      process.stderr.write(' SKIP (unavailable)\n');
      continue;
    }

    const title = meta.title;
    const videoUrl = `https://www.youtube.com/watch?v=${meta.id}`;
    const thumbnailUrl = meta.thumbnail || `https://i.ytimg.com/vi/${meta.id}/hqdefault.jpg`;
    const date = formatDate(meta.upload_date ?? '');

    const guest = extractSpeakerFromTitle(title);
    const speakers = guest
      ? [{ name: guest, role: 'Invitado/a', avatarUrl: thumbnailUrl }]
      : [];

    sessions.push({
      id: slugify(title),
      title,
      description: (meta.description ?? '').slice(0, 500),
      speakers,
      date,
      videoUrl,
      thumbnailUrl,
      type: 'episode' as const,
      language: 'es' as const,
      tags: [],
    });
    process.stderr.write(` OK (${date})\n`);
  }

  // Sort by date descending (newest first)
  sessions.sort((a, b) => b.date.localeCompare(a.date));

  // Ensure stable unique IDs
  const seen = new Map<string, number>();
  for (const s of sessions) {
    const n = seen.get(s.id) ?? 0;
    if (n === 0) seen.set(s.id, 1);
    else {
      const next = n + 1;
      seen.set(s.id, next);
      s.id = `${s.id}-${next}`;
    }
  }

  const sessionsFile = SessionsFileSchema.parse({
    show: {
      name: 'Jueves de Quack',
      channel: 'GitHub',
      channelUrl: 'https://www.youtube.com/@GitHub',
    },
    sessions,
  });

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(sessionsFile, null, 2) + '\n', 'utf8');

  // Also cache the raw result
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(sessionsFile, null, 2) + '\n', 'utf8');

  process.stdout.write(`OK: wrote ${OUT_PATH} (sessions=${sessionsFile.sessions.length})\n`);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack ?? String(err)}\n`);
  process.exitCode = 1;
});
