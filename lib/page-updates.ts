// Dates of substantive page-content changes; do not advance on every build.
export function pageLastModified(path:string):string|undefined{
 if(['/', '/about', '/services', '/solutions', '/process', '/cases'].includes(path)||path.startsWith('/services/')||path.startsWith('/solutions/'))return '2026-11-11';
 return undefined;
}
