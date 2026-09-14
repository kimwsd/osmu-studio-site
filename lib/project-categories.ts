import type { Project } from './projects';
export const categories = ['All', 'Brand Strategy', 'Branding', 'BI/CI', 'UX/UI', 'WEB/APP', 'Character', 'Package', 'Graphic Design', 'Motion Graphic', 'Film', 'Photograph', 'AI Visual Studio', 'Marketing'];

export function categoryMatches(project: Pick<Project, 'cat' | 'type' | 'name' | 'slug'>, category: string) {
  if (category === 'All') return true;

  const selected = project.cat.split(/\s*\+\s*/).map(value=>value.trim());
  if(selected.length && selected.every(value=>categories.includes(value))) return selected.includes(category);

  const searchable = [project.cat, project.type, project.name, project.slug]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return ({
    'Brand Strategy': /strategy/,
    Branding: /branding|identity/,
    'Motion Graphic': /motion|animation/,
    'BI/CI': /\b(?:bi|ci|logo|identity|branding)\b/,
    'UX/UI': /\b(?:ux|ui)\b/,
    'WEB/APP': /\b(?:web|app)\b|website|application design/,
    Character: /character|mascot/,
    Package: /packag/,
    'Graphic Design': /graphic|poster|campaign/,
    Film: /film|video|motion/,
    Photograph: /photo/,
    'AI Visual Studio': /\bai\b|artificial intelligence/,
    Marketing: /campaign|marketing|social|content/
  }[category]?.test(searchable) ?? false);
}
