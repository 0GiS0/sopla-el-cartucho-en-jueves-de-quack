import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

async function readJson(relPath) {
  const raw = await fs.readFile(new URL(relPath, import.meta.url), 'utf8');
  return JSON.parse(raw);
}

test('sessions.json has show + sessions[] (basic invariants)', async () => {
  const json = await readJson('../src/data/sessions.json');

  assert.ok(json.show);
  assert.equal(typeof json.show.name, 'string');
  assert.equal(typeof json.show.channel, 'string');
  assert.equal(typeof json.show.channelUrl, 'string');

  assert.ok(Array.isArray(json.sessions));

  const ids = new Set();

  for (const s of json.sessions) {
    assert.equal(typeof s.id, 'string');
    assert.ok(s.id.length > 0);

    assert.ok(!ids.has(s.id), `duplicate session id: ${s.id}`);
    ids.add(s.id);

    assert.equal(typeof s.title, 'string');
    assert.equal(typeof s.description, 'string');
    assert.equal(typeof s.date, 'string');
    assert.equal(typeof s.videoUrl, 'string');
    assert.equal(typeof s.thumbnailUrl, 'string');
    assert.equal(s.type, 'episode');
    assert.equal(s.language, 'es');

    assert.ok(Array.isArray(s.speakers));
    for (const sp of s.speakers) {
      assert.equal(typeof sp.name, 'string');
      assert.equal(typeof sp.role, 'string');
      assert.equal(typeof sp.avatarUrl, 'string');
    }

    assert.ok(Array.isArray(s.tags));
  }
});

test('assets.json uses valid sessionIds', async () => {
  const sessions = await readJson('../src/data/sessions.json');
  const assets = await readJson('../src/data/assets.json');

  const sessionIds = new Set(sessions.sessions.map((s) => s.id));

  assert.ok(Array.isArray(assets.assets));

  const seen = new Set();
  for (const a of assets.assets) {
    assert.equal(typeof a.sessionId, 'string');
    assert.ok(sessionIds.has(a.sessionId), `assets references unknown sessionId: ${a.sessionId}`);
    assert.ok(!seen.has(a.sessionId), `duplicate assets sessionId: ${a.sessionId}`);
    seen.add(a.sessionId);
  }
});
