const host = 'osmu-studio.com';
const key = 'osmu-a1e343ced69d4ac3b2c1a413ff09aa28';
const origin = `https://${host}`;
const sitemap = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
if (!sitemap.ok) throw new Error(`Sitemap request failed: ${sitemap.status}`);
const xml = await sitemap.text();
const urlList = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url);
if (!urlList.length) throw new Error('No URLs found in sitemap');
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `${origin}/${key}.txt`, urlList }),
  signal: AbortSignal.timeout(20000),
});
if (!response.ok) throw new Error(`IndexNow submission failed: ${response.status} ${await response.text()}`);
console.log(`IndexNow accepted ${urlList.length} sitemap URLs.`);
