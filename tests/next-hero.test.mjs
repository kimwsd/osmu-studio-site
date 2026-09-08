import test from 'node:test';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

test('homepage hero renders a silent looping video without playback controls', async () => {
  const response = await fetch(base + '/');
  assert.equal(response.status, 200);
  const html = await response.text();
  const hero = html.match(/<section[^>]*class="hero-video"[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero, 'The first hero must be the brand film');
  const video = hero.match(/<video\b[^>]*>/)?.[0];
  assert.ok(video, 'The hero needs its own video, separate from the showreel');
  for (const attribute of ['muted', 'autoPlay', 'loop', 'playsInline']) {
    assert.match(video, new RegExp(`\\s${attribute}(?:[\\s=>])`, 'i'), attribute);
  }
  assert.doesNotMatch(video, /\scontrols(?:[\s=>])/i);
  assert.doesNotMatch(hero, /<button\b/);
  assert.match(hero, /<h1\b/);
  assert.match(hero, /<source[^>]*media="\(max-width: 767px\)"[^>]*srcSet="\/assets\/hero\/kinetic-v5\/poster-mobile.jpg"/i);
  assert.match(hero, /<img[^>]*src="\/assets\/hero\/kinetic-v5\/poster-pc.jpg"/);
  assert.match(html, /class="reel-section section-pad"/);
  assert.match(html, /Selected Work/);
});

function boxes(buffer, start = 0, end = buffer.length) {
  const result = [];
  for (let offset = start; offset + 8 <= end;) {
    let size = buffer.readUInt32BE(offset);
    let header = 8;
    if (size === 1) { size = Number(buffer.readBigUInt64BE(offset + 8)); header = 16; }
    if (size === 0) size = end - offset;
    assert.ok(size >= header && offset + size <= end, 'Valid MP4 box boundaries');
    result.push({ type: buffer.toString('ascii', offset + 4, offset + 8), start: offset + header, end: offset + size, offset });
    offset += size;
  }
  return result;
}

for (const [variant, width, height] of [['pc', 2560, 1440], ['mobile', 1080, 1920]]) {
  test(`${variant} hero ships an 18-second, audio-free, fast-start film at its native aspect ratio`, async () => {
    const response = await fetch(`${base}/assets/hero/kinetic-v5/hero-${variant}-silent.mp4`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /video\/mp4/);
    const buffer = Buffer.from(await response.arrayBuffer());
    const top = boxes(buffer);
    const moov = top.find(box => box.type === 'moov');
    const mdat = top.find(box => box.type === 'mdat');
    assert.ok(moov && mdat && moov.offset < mdat.offset, 'Metadata comes before video data for fast playback');
    const tracks = boxes(buffer, moov.start, moov.end).filter(box => box.type === 'trak');
    assert.equal(tracks.length, 1, 'Only the video track is shipped; audio cannot be enabled');
    const track = boxes(buffer, tracks[0].start, tracks[0].end);
    const tkhd = track.find(box => box.type === 'tkhd');
    assert.equal(buffer.readUInt32BE(tkhd.end - 8) / 65536, width);
    assert.equal(buffer.readUInt32BE(tkhd.end - 4) / 65536, height);
    const mdia = track.find(box => box.type === 'mdia');
    const media = boxes(buffer, mdia.start, mdia.end);
    const handler = media.find(box => box.type === 'hdlr');
    assert.equal(buffer.toString('ascii', handler.start + 8, handler.start + 12), 'vide');
    // Movie duration includes the edit list that trims encoder preroll.
    // Raw media duration can include an extra decoded B-frame.
    const mvhd = boxes(buffer, moov.start, moov.end).find(box => box.type === 'mvhd');
    const version = buffer[mvhd.start];
    const scaleOffset = mvhd.start + (version === 1 ? 20 : 12);
    const timescale = buffer.readUInt32BE(scaleOffset);
    const duration = version === 1 ? Number(buffer.readBigUInt64BE(scaleOffset + 4)) : buffer.readUInt32BE(scaleOffset + 4);
    assert.equal(duration / timescale, 18);
    const range = await fetch(`${base}/assets/hero/kinetic-v5/hero-${variant}-silent.mp4`, { headers: { Range: 'bytes=0-1023' } });
    assert.equal(range.status, 206);
    assert.equal((await range.arrayBuffer()).byteLength, 1024);
    const poster = await fetch(`${base}/assets/hero/kinetic-v5/poster-${variant}.jpg`);
    assert.equal(poster.status, 200);
    assert.match(poster.headers.get('content-type'), /image\/jpeg/);
  });
}
