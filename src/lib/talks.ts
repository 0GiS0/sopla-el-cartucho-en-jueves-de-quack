import sessionsJson from '../data/sessions.json';
import assetsJson from '../data/assets.json';
import type { SessionWithAssets } from '../types/talk';
import { AssetsFileSchema, SessionsFileSchema } from '../schemas/talk';

const sessionsFile = SessionsFileSchema.parse(sessionsJson);
const assetsFile = AssetsFileSchema.parse(assetsJson);

export const show = sessionsFile.show;

const sessions = sessionsFile.sessions;
const assets = assetsFile.assets;

const assetsBySessionId = new Map(assets.map((a) => [a.sessionId, a] as const));

export const sessionsWithAssets: SessionWithAssets[] = sessions.map((s) => ({
  ...s,
  assets: assetsBySessionId.get(s.id),
}));

export function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
