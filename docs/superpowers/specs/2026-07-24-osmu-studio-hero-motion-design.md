# OSMÜ STÜDIO Hero Motion Design

## Objective

Renew the Studio page so visitors immediately understand that OSMÜ STÜDIO is a branding agency that connects strategy, space, identity, marketing, content, and film.

The result must feel premium, dynamic, and decisive without becoming visually chaotic. It must remove the location-based origin story and focus the narrative on the client's brand, customer experience, and business impact.

## Approved Direction

The selected direction is **Dynamic Brand System**.

The 15-second hero uses the supplied 1920×1080, 30fps, approximately two-second source video as visual material. The footage is expanded through rhythmic cropping, repetition, scale changes, split screens, freeze frames, and contrast shifts. Kinetic typography and a precise grid communicate OSMÜ's connected service system.

The visual character combines:

- Monochrome, high-contrast art direction
- Large condensed typography
- Fast but controlled cuts
- Split-screen and modular grid compositions
- Short white flashes or hard cuts used sparingly
- A clean OSMÜ STÜDIO logo lockup at the conclusion

Glitch effects, excessive rotation, and decorative noise are excluded because they would weaken professional credibility.

## Studio Page Copy

### Page Lead

OSMÜ STÜDIO는 브랜드의 방향을 정의하고, 모든 접점에서 선택의 이유를 만드는 브랜딩 에이전시입니다.

### Main Statement

브랜드의 가치는 보이는 방식이 아니라, 선택되는 이유에서 시작됩니다. OSMÜ STÜDIO는 전략을 공간과 아이덴티티, 콘텐츠와 영상으로 확장해 브랜드가 작동하는 모든 장면을 설계합니다.

### Supporting Copy

우리는 시장과 고객을 정교하게 읽고 브랜드가 가져야 할 고유한 위치와 언어를 정의합니다. 명확한 전략은 모든 표현의 기준이 되고, 흔들리지 않는 브랜드 경험을 만듭니다.

공간 브랜딩, 브랜딩, CI/BI, 마케팅, 영상까지. 분리된 결과물이 아닌 하나의 시스템으로 연결해 고객의 인식에서 경험, 선택까지 일관된 흐름을 완성합니다.

### Closing CTA

Headline:

브랜드의 다음 장면을 함께 설계합니다.

Button:

프로젝트 문의하기

## Fifteen-Second Storyboard

### 0–3 seconds — Question

- Start from black with a brief, controlled reveal of the supplied footage.
- Use a severe crop and rapid scale shift to establish energy.
- Primary text: `WHAT MOVES A BRAND?`
- Small system label: `OSMÜ STÜDIO / BRANDING AGENCY`

### 3–6 seconds — Experience

- Divide the footage into a two- or four-panel grid.
- Alternate close crops with negative space.
- Primary text: `SPACE × IDENTITY`
- Secondary text: `STRATEGY INTO EXPERIENCE`

### 6–10 seconds — Growth

- Increase rhythm with typography crossing grid boundaries.
- Use a controlled contrast flash between service pairs.
- Primary text: `STRATEGY × MARKETING`
- Secondary text: `POSITION / MESSAGE / CAMPAIGN`

### 10–13 seconds — Content

- Expand the original footage into larger texture fields and motion crops.
- Primary text: `CONTENT × FILM`
- Secondary text: `STORY INTO MOTION`

### 13–15 seconds — Brand Lockup

- Reduce visual noise and settle into a centered lockup.
- Primary text: `OSMÜ STÜDIO`
- Closing line: `ONE BRAND, EVERY TOUCHPOINT`
- End on a dark frame that can loop cleanly into the opening.

## Production Architecture

### Video Project

- Create an isolated video-production directory inside the project.
- Install the official `hyperframes` and `motion` npm packages there.
- Install the HyperFrames core agent workflow required for composition authoring.
- Use HyperFrames as the deterministic HTML-to-video renderer.
- Use Motion for seekable kinetic typography and grid transitions.
- Keep production dependencies separate from the static website runtime.

### Media Handling

- Copy the supplied source video into the video project's media directory without modifying the original file.
- Produce a 1920×1080 master at 30fps with a duration between 14.5 and 15.5 seconds.
- Export an MP4 master and a web-optimized WebM when the installed encoder supports it.
- Generate a poster frame from the final lockup or another calm, representative frame.
- Do not add narration or music. The hero is designed for muted autoplay.

### Studio Hero Integration

- Replace the current text-only Studio page hero with a full-viewport media hero.
- Place the rendered video in a `<video>` element using `autoplay`, `muted`, `loop`, and `playsinline`.
- Use MP4 as the required source and WebM as an optional preferred source.
- Keep only a restrained text overlay so the rendered motion remains the primary message.
- Add a discreet pause/play control for users who want to stop the motion.
- Preserve the transparent, contrast-inverted global navigation.

### Responsive Behavior

- Desktop uses a full-bleed 16:9 crop.
- Mobile uses `object-fit: cover` with the important typography kept inside a central safe zone during rendering.
- The hero remains readable from 320px width upward.
- The poster image appears before playback and whenever video playback is unavailable.

### Accessibility and Performance

- The video is muted and decorative, with an accessible text equivalent in the page heading and lead.
- Respect `prefers-reduced-motion: reduce` by showing the poster rather than autoplaying the video.
- Provide a keyboard-accessible pause/play control with an updated accessible label.
- Avoid loading the video as an oversized blocking resource; use appropriate preload behavior and a compressed website encode.
- Keep the current Studio content accessible when video playback fails.

## Validation

Automated checks must confirm:

- The Studio page includes the approved lead, main statement, supporting copy, and CTA.
- The hero video contains `autoplay`, `muted`, `loop`, and `playsinline`.
- A poster image and reduced-motion fallback exist.
- A pause/play control exists and updates playback state.
- The output video is 1920×1080, 30fps, and between 14.5 and 15.5 seconds.
- The output can be decoded without errors.
- Existing navigation, Work filters, service pages, and prior regression tests remain valid.

Manual review must confirm:

- Typography remains inside the desktop and mobile safe zones.
- The motion feels dynamic and impactful without appearing chaotic.
- The final lockup is legible and the loop does not produce an accidental visual jump.
- The Studio page remains clear when the poster is shown instead of the video.

## Out of Scope

- Voiceover, music, sound design, or a speaking avatar
- New AI-generated footage beyond the supplied source video
- Changes to Home, Work, Services, or Contact page layouts
- A content-management interface for replacing the hero video
- Deployment before the local result is reviewed and approved
