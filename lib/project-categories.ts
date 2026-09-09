import type { Project } from './projects';
export const categories = ['All', 'Brand Strategy', 'Branding', 'Logo', 'Graphic Design', 'Visual Art', 'Brand Film', 'AI Image / Video', 'Web UI', 'Marketing'];
export function categoryMatches(project: Pick<Project, 'cat'|'type'|'name'|'slug'>, category: string) {
  if (category === 'All') return true;
  const searchable = [project.cat, project.type, project.name, project.slug].filter(Boolean).join(' ').toLowerCase();
  return ({
    'Brand Strategy': /strategy/,
    'Branding': /branding|brand identity|identity|packag/,
    'Logo': /logo|ci.bi|brand identity|identity/,
    'Graphic Design': /graphic|poster|campaign/,
    'Visual Art': /visual|art|gallery/,
    'Brand Film': /film|video|motion/,
    'AI Image / Video': /\bai\b|artificial intelligence/,
    'Web UI': /web|ui|digital|website/,
    'Marketing': /campaign|marketing|social|content/
  }[category]?.test(searchable) ?? false);
}
