# Wolff Olins reference → OSMU implementation

Reference inspected: https://wolffolins.com/ and Work, About, Contact, Decathlon detail. Date: 2026-09-07. Desktop 1440×900 and mobile 390×844.

Selection intent: large work-led presentation, restrained navigation, readable long-form project pages, and a distinctive motion rhythm. The later Wolff request supersedes the earlier Fineworks composition.

| Observed reference element | Implemented OSMU behavior |
|---|---|
| 88px header becoming a floating 56px rounded bar | Scroll threshold 40px; centred desktop pill, mobile rounded bar; fixed 88px document space |
| Full-viewport horizontal hero | Eight OSMU concepts, 300ms slide, 550ms caption reveal, 6s autoplay, counter, previous/next and pause |
| Yellow Previous/Next/diagonal cursor | Captured small cursor SVGs used locally on desktop zones |
| Mobile menu and expanded search | Native dialogs, backdrop blur, Escape, focus restoration, page-scroll lock; search filters real local page/project items |
| Inset showreel with centred Play | Own 12s image-based concept reel; pause, fullscreen, offscreen pause, error fallback |
| Large Our Ambition statement | OSMU positioning with links to Work, Services, About; Helvetica at user's direction |
| Asymmetric 6/5/full/5/6 work cards | Responsive 12-column grid, category and concept tags, project links; OSMU filters/list retained |
| News card READ MORE hover ticker | Four Inside OSMU cards linking existing content; no invented news or awards |
| Yellow full-height footer and variable logotype | Yellow footer with true OSMU contact routes; original SVG moves vertically on scroll, preserves proportions |
| Black Work/Contact/project pages | Black surface, large introduction, detailed project media and next-project link |
| Project More Info and Download Images | Expand/collapse narrative with accessible state and actual image download |
| Page entrances and section reveals | 500ms route fade, 700ms below-fold reveals; prefers-reduced-motion fallback |

Exclusions: source client photos/videos, clients, testimonials, offices, news, awards and proprietary variable wordmark. They are replaced by actual OSMU content or explicitly labelled concept studies. The source serif/Untitled font is replaced by the requested Helvetica-first stack. OSMU retains independent Services and Process routes and a real inquiry form.

Limits: this is a reconstruction of the observed desktop/mobile surfaces and interactions, not a claim that every hidden state or third-party asset is identical. Mobile swipe and desktop cursor/hover behavior have implementation checks; native touch gesture and pointer-hover automation were not available in this browser tool. Reduced-motion branches were reviewed in source; operating-system preference toggling was not exercised.
