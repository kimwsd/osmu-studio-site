# Homepage Kinetic V5 hero

## Approved scope

- Replace only the homepage's first project slider with the 18-second brand film.
- Always silent, autoplay, infinite loop, no sound/pause/native playback buttons.
- PC 16:9 and mobile 9:16 use distinct files, preserving the complete frame.
- Remove the video-edge top/bottom labels throughout all scenes. Central typography, imagery, original SVG wordmark and timing remain unchanged.
- Keep the header, editorial section, downstream showreel and selected work unchanged.

## Media provenance and preservation

The original After Effects project and previous delivery remain preserved locally. An additional snapshot preserved the user's open unsaved project. Website changes were made in `OSMU_KINETIC_V5_WEBSITE_CLEAN.aep`: 81 remaining edge text layers disabled (the mobile closing scene already had its three labels removed), music disabled in both master compositions. Rendered using After Effects 2026; encoded for the web without any audio stream.

| File | Resolution | Duration / frames | Bytes | SHA-256 |
| --- | --- | --- | --- | --- |
| hero-pc-silent.mp4 | 2560 x 1440 | 18s / 540 | 5254445 | 44f2104708d6a314731127f8f7676733e3d8b8bf0d8c1a7be265ccfb017291c2 |
| hero-mobile-silent.mp4 | 1080 x 1920 | 18s / 540 | 3462272 | e5f80b30480494748b37e19b68df03760c90a08eeb2ba615a38e54cd3ce79b0f |

H.264, yuv420p, 30fps, fast-start MP4. Full-file decoding passed. No black segments of 200ms or longer detected. PC and mobile contact sheets each inspected at 0.9, 2.7, 4.9, 6.4, 7.9, 8.8, 9.3, 9.8, 11.3, 13.5, 15.6 and 17.2 seconds. Edge labels are absent, including the requested card-feed frame. Intentional moving-card overlap with background typography is retained.

## Verification

- `npm run build`: passed (37 static pages).
- `npm run typecheck`: passed.
- `npm test`: 21/21 passed, including real served MP4 track, dimension, duration, fast-start and range-request checks.
- Browser checked at iframe viewports of 1280, 390 and 360 CSS pixels using the actual exported homepage. Each had no horizontal overflow, `object-fit: contain`, correct PC/mobile source and poster, 18s duration, muted/loop enabled, no native controls, zero hero buttons, and active video playback.
- Actual loop wraps observed at PC 1280 pixels and mobile 390/360 pixels.
- OS reduced-motion uses the static responsive poster; page-hidden/offscreen playback pauses and resumes when visible. These are automatic resource/accessibility behaviors with no added UI controls.
- Physical iOS/Safari devices not tested in this environment.

The responsive QA harness is local-only in ignored `out/`; it is not committed or included in CI-generated deployment artifacts.
