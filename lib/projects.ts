import { cache } from 'react';
import local from './local-projects.json';
import config from './public-config.json';

export type Project = { slug: string; name: string; cat: string; type?: string; year: number; month?: number; loc?: string; summary: string; body: string; images: string[]; videos: string[]; concept?: boolean; archived?: boolean };
export function safeMedia(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (/^(?:\/)?assets\/[\w./-]+$/.test(value) && !value.includes('..')) return '/' + value.replace(/^\//, '');
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}
function normalize(value: Record<string, unknown>): Project | null {
  if (typeof value.slug !== 'string' || !/^[\w-]+$/.test(value.slug) || typeof value.name !== 'string') return null;
  const strings = (key: string) => Array.isArray(value[key]) ? (value[key] as unknown[]).map(safeMedia).filter((v): v is string => Boolean(v)) : [];
  return { slug: value.slug, name: value.name, cat: String(value.cat || 'Branding'), year: Number(value.year) || 2026,
    month: Number(value.month) || undefined, loc: String(value.loc || ''), type: String(value.type || ''),
    summary: String(value.summary || ''), body: String(value.body || ''), images: strings('images'), videos: strings('videos'),
    concept: local.featured.some(p => p.slug === value.slug) || value.concept === true };
}
export const getProjects = cache(async (): Promise<Project[]> => {
  try {
    const response = await fetch(`${process.env.SUPABASE_URL || config.url}/rest/v1/projects?select=*&order=sort_order.desc,created_at.desc`, {
      headers: { apikey: process.env.SUPABASE_ANON_KEY || config.anonKey }, cache: 'force-cache', signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error(`Project read: ${response.status}`);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Invalid project data');
    const projects = rows.map(normalize).filter((p): p is Project => p !== null);
    if (projects.length) return projects;
  } catch { console.warn('Project source unavailable; showing labeled local concept studies.'); }
  return local.featured as Project[];
});
export async function getProject(slug: string) {
  return (await getProjects()).find(p => p.slug === slug) || [...local.featured, ...local.legacy].find(p => p.slug === slug) as Project | undefined;
}
