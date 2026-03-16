import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import { SessionsFileSchema } from '../src/schemas/talk';

const CHANNEL_ID = 'UC7c3Kb6jYCRj4JOHHZTxKsQ'; // @GitHub YouTube channel
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CACHE_DIR = path.join('.cache', 'sessions');
const CACHE_XML_PATH = path.join(CACHE_DIR, 'feed.xml');
const CACHE_META_PATH = path.join(CACHE_DIR, 'meta.json');
const OUT_PATH = path.join('src', 'data', 'sessions.json');

type CacheMeta = {
  sourceUrl: string;
  fetchedAt: string;
  sha256: string;
};

type Args = {
  refresh: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = { refresh: false };

  for (const a of argv) {
    if (a === '--refresh') args.refresh = true;
    else if (a === '--help' || a === '-h') {
      process.stdout.write(`Usage: npm run fetch-sessions [-- --refresh]\n`);
      process.exit(0);
    } else {
      throw new Error(`Unknown arg: ${a}`);
    }
  }

  return args;
}

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function slugify(s: string) {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function readCache() {
  try {
    const [xml, metaRaw] = await Promise.all([
      fs.readFile(CACHE_XML_PATH, 'utf8'),
      fs.readFile(CACHE_META_PATH, 'utf8'),
    ]);
    const meta = JSON.parse(metaRaw) as CacheMeta;
    return { xml, meta };
  } catch {
    return null;
  }
}

async function writeCache(xml: string, meta: CacheMeta) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(CACHE_XML_PATH, xml, 'utf8'),
    fs.writeFile(CACHE_META_PATH, JSON.stringify(meta, null, 2) + '\n', 'utf8'),
  ]);
}

async function fetchFeed({ refresh }: Args) {
  const cached = refresh ? null : await readCache();

  try {
    const res = await fetch(RSS_URL, {
      headers: {
        Accept: 'application/xml, text/xml',
        'User-Agent': 'sopla-el-cartucho-jueves-de-quack/feed-fetch',
      },
    });

    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    }

    const xml = await res.text();
    const meta: CacheMeta = {
      sourceUrl: RSS_URL,
      fetchedAt: new Date().toISOString(),
      sha256: sha256(xml),
    };

    await writeCache(xml, meta);
    return { xml, cache: cached ? ('refreshed' as const) : ('miss' as const) };
  } catch (err) {
    if (cached) {
      process.stderr.write(`WARN: fetch failed, using cached XML (reason: ${String(err)})\n`);
      return { xml: cached.xml, cache: 'stale' as const };
    }
    throw err;
  }
}

function extractText(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match?.[1]?.trim() ?? '';
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
  const match = xml.match(regex);
  return match?.[1] ?? '';
}

function extractEntries(xml: string): string[] {
  const entries: string[] = [];
  const regex = /<entry>([\s\S]*?)<\/entry>/gi;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    entries.push(match[1]);
  }
  return entries;
}

function extractSpeakerFromTitle(title: string): { guest: string; topic: string } | null {
  // Common patterns: "Jueves de Quack con @guest" or "Jueves de Quack: topic con guest"
  const conMatch = title.match(/(?:Jueves de Quack[:\s]*.*?)\s+con\s+(.+?)$/i);
  if (conMatch) {
    const guest = conMatch[1].replace(/^@/, '').trim();
    const topic = title.replace(/\s+con\s+.+$/, '').replace(/^.*?Jueves de Quack[:\s]*/i, '').trim();
    return { guest, topic };
  }
  return null;
}

function parseFeed(xml: string) {
  const entries = extractEntries(xml);

  const sessions: Array<any> = [];

  for (const entry of entries) {
    const title = extractText(entry, 'title');

    // Filter only Jueves de Quack sessions
    if (!title.toLowerCase().includes('jueves de quack')) continue;

    const videoId = extractText(entry, 'yt:videoId');
    const published = extractText(entry, 'published');
    const description = extractText(entry, 'media:description') || extractText(entry, 'description');

    const thumbnailUrl =
      extractAttr(entry, 'media:thumbnail', 'url') ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const date = published ? published.split('T')[0] : '';

    const speakerInfo = extractSpeakerFromTitle(title);
    const speakers = speakerInfo?.guest
      ? [{
          name: speakerInfo.guest,
          role: 'Invitado/a',
          avatarUrl: thumbnailUrl,
        }]
      : [];

    sessions.push({
      id: slugify(title),
      title,
      description: description.slice(0, 500),
      speakers,
      date,
      videoUrl,
      thumbnailUrl,
      type: 'episode' as const,
      language: 'es' as const,
      tags: [],
    });
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

  const sessionsFile = {
    show: {
      name: 'Jueves de Quack',
      channel: 'GitHub',
      channelUrl: 'https://www.youtube.com/@GitHub',
    },
    sessions,
  };

  return SessionsFileSchema.parse(sessionsFile);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const { xml, cache } = await fetchFeed(args);
  const parsed = parseFeed(xml);

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(parsed, null, 2) + '\n', 'utf8');

  process.stdout.write(
    `OK: wrote ${OUT_PATH} (sessions=${parsed.sessions.length}, cache=${cache})\n`
  );
}

main().catch((err) => {
  process.stderr.write(`${err?.stack ?? String(err)}\n`);
  process.exitCode = 1;
});
