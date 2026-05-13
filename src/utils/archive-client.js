const TENANT_ID = import.meta.env.VITE_CHANNEL.toLowerCase();
const apiBase = import.meta.env.VITE_ARCHIVE_API_BASE;

async function fetchJson(url, options = {}) {
  const res = await window.fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function listVods(params = {}) {
  const query = new URLSearchParams();

  if (params.platform) query.set('platform', params.platform);
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  if (params.uploaded) query.set('uploaded', params.uploaded);
  if (params.game) query.set('game', params.game);
  if (params.game_id) query.set('game_id', params.game_id);
  if (params.title) query.set('title', params.title);
  if (params.chapter) query.set('chapter', params.chapter);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.sort) query.set('sort', params.sort);
  if (params.order) query.set('order', params.order);

  const url = `${apiBase}/${TENANT_ID}/vods?${query}`;
  return fetchJson(url);
}

export async function getVod(vodId) {
  return fetchJson(`${apiBase}/${TENANT_ID}/vods/${vodId}`);
}

export async function getVodByPlatform(platform, platformVodId) {
  return fetchJson(`${apiBase}/${TENANT_ID}/vods/${platform}/${platformVodId}`);
}

export async function getVodEmotes(vodId) {
  return fetchJson(`${apiBase}/${TENANT_ID}/vods/${vodId}/emotes`);
}

export async function getVodComments(vodId, params = {}) {
  const query = new URLSearchParams();
  if (params.content_offset_seconds) query.set('content_offset_seconds', String(params.content_offset_seconds));
  if (params.cursor) query.set('cursor', params.cursor);

  const url = `${apiBase}/${TENANT_ID}/vods/${vodId}/comments?${query}`;
  return fetchJson(url);
}

export async function listGames(params = {}) {
  const query = new URLSearchParams();

  if (params.game_name) query.set('game_name', params.game_name);
  if (params.title) query.set('title', params.title);
  if (params.platform) query.set('platform', params.platform);
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  if (params.game_id) query.set('game_id', params.game_id);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.sort) query.set('sort', params.sort);
  if (params.order) query.set('order', params.order);

  const url = `${apiBase}/${TENANT_ID}/games?${query}`;
  return fetchJson(url);
}

export async function getGamesLibrary(params = {}) {
  const query = new URLSearchParams();

  if (params.game_id) query.set('game_id', params.game_id);
  if (params.game_name) query.set('game_name', params.game_name);
  if (params.sort) query.set('sort', params.sort);
  if (params.order) query.set('order', params.order);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const url = `${apiBase}/${TENANT_ID}/games/library?${query}`;
  return fetchJson(url);
}

export async function getChaptersLibrary(params = {}) {
  const query = new URLSearchParams();

  if (params.chapter_name) query.set('chapter_name', params.chapter_name);
  if (params.sort) query.set('sort', params.sort);
  if (params.order) query.set('order', params.order);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const url = `${apiBase}/${TENANT_ID}/chapters/library?${query}`;
  return fetchJson(url);
}

export async function getTwitchBadges() {
  return fetchJson(`${apiBase}/${TENANT_ID}/badges/twitch`);
}
