import type { Project } from './projects';
export const categories = ['All', 'Brand Strategy', 'Identity & Package', 'Space Branding', 'Campaign & Marketing', 'Brand Film'];
export function categoryMatches(project: Pick<Project, 'cat'>, category: string) {
  return category === 'All' || ({
    'Brand Strategy': /strategy|branding/, 'Identity & Package': /identity|ci.bi|packag|logo/,
    'Space Branding': /space|spatial|signage/, 'Campaign & Marketing': /campaign|marketing|social|content/,
    'Brand Film': /film|video|motion/
  }[category]?.test(project.cat.toLowerCase()) ?? false);
}
