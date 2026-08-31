---
name: Voyani — Ngowa Karisa
description: A portfolio built as printed cloth — a border, a field of evidence, and one large printed line.
colors:
  cloth-50: "#FAF8F3"
  cloth-100: "#F2EEE5"
  cloth-200: "#E9E3D6"
  cloth-300: "#DCD5C5"
  cloth-400: "#C6BEAB"
  mark-900: "#14171C"
  mark-700: "#3B3E45"
  mark-600: "#4E525A"
  mark-500: "#5B5F67"
  pindo: "#243D8F"
  pindo-deep: "#1A2C68"
  pindo-wash: "#E4E7F3"
  warn: "#8A5A08"
  alarm: "#A32014"
typography:
  jina:
    fontFamily: "\"Bricolage Grotesque\", Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6.2vw, 5.25rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  jina-lead:
    fontFamily: "\"Bricolage Grotesque\", Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4.6vw, 4rem)"
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  jina-sm:
    fontFamily: "\"Bricolage Grotesque\", Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: "-0.03em"
  display:
    fontFamily: "Archivo, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "clamp(1.875rem, 3.4vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title:
    fontFamily: "\"Bricolage Grotesque\", Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 2.2vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "\"Bricolage Grotesque\", Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 2vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tabular-nums"
  lead:
    fontFamily: "Archivo, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "clamp(1.0625rem, 1.15vw, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "Archivo, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0.09em"
rounded:
  DEFAULT: "0px"
  sm: "0px"
  md: "0px"
  lg: "0px"
  full: "9999px"
spacing:
  pindo: "16px"
  section: "clamp(3.5rem, 7.5vw, 6.5rem)"
  panel-x: "1rem"
  panel-x-sm: "2rem"
  panel-x-lg: "3rem"
  panel-y: "2rem"
  panel-y-sm: "2.5rem"
  panel-y-lg: "3.5rem"
components:
  button-primary:
    backgroundColor: "{colors.pindo}"
    textColor: "{colors.cloth-50}"
    rounded: "{rounded.DEFAULT}"
    padding: "0.875rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.pindo-deep}"
    textColor: "{colors.cloth-50}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.pindo}"
    rounded: "{rounded.DEFAULT}"
    padding: "0.75rem 1.5rem"
  button-outline-hover:
    backgroundColor: "{colors.pindo}"
    textColor: "{colors.cloth-50}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.mark-700}"
    rounded: "{rounded.DEFAULT}"
    padding: "0.5rem 1rem"
  button-quiet-hover:
    textColor: "{colors.pindo}"
  field:
    backgroundColor: "{colors.cloth-50}"
    textColor: "{colors.mark-900}"
    rounded: "{rounded.DEFAULT}"
    padding: "0.75rem 1rem"
    width: "100%"
  field-label:
    textColor: "{colors.mark-700}"
    typography: "{typography.body}"
  panel:
    backgroundColor: "{colors.cloth-100}"
    rounded: "{rounded.DEFAULT}"
    padding: "2rem 1rem"
  panel-head-reversed:
    backgroundColor: "{colors.pindo}"
    textColor: "{colors.cloth-50}"
    rounded: "{rounded.DEFAULT}"
    padding: "2.5rem 1rem"
  band-cell:
    backgroundColor: "{colors.cloth-100}"
    textColor: "{colors.mark-900}"
    rounded: "{rounded.DEFAULT}"
    padding: "1rem 1.25rem 1rem 0"
  packet:
    backgroundColor: "{colors.cloth-50}"
    textColor: "{colors.mark-900}"
    rounded: "{rounded.DEFAULT}"
  link:
    textColor: "{colors.pindo}"
  mark-state:
    textColor: "{colors.mark-700}"
    typography: "{typography.label}"
---

# Design System: Voyani — Ngowa Karisa

## Overview

**Creative North Star: "The Kanga Sheet"**

A kanga is not decorated cloth. It is a printed statement you hold up: a border (the **pindo**) enclosing a plain field (the **mji**), captioned along the hem by one large printed line (the **jina**). Its whole grammar is frame, evidence, statement — and every section of this site is built that way. A panel is one kanga. The border is authored artwork, not a stroke; the field carries running client software and measured numbers; the jina says the claim out loud at true display scale, because on cloth the printed line is the largest thing on the object.

The surface is flat, warm and printed rather than lit. There is no gradient, no vignette, no texture image, no glass, no shadow. Depth exists only where ink meets cloth: a two-weight nine-slice border, hairline rules, a 2px indigo seam, and tonal steps in the unbleached-cotton ground. One accent carries the entire chromatic argument, and it is spent on structure and evidence — the border, state, links, the primary action — never on decoration.

This world replaced a near-black, acid-lime "developer terminal" identity. That look was coherent but argued in a vocabulary its audience — non-profit directors and business owners, often on a phone on a constrained connection — does not read. Confirmed rejections carried in the shipped direction contract: the category-default dark hero over a grid of hover-lifting project cards, and the mono terminal this site already was.

**Key Characteristics:**
- Unbleached cotton ground (`#F2EEE5`), never white, never a gradient.
- Exactly one accent, kanga indigo (`#243D8F`), spent on frame, state, links and the primary action.
- The pindo: a real nine-slice `border-image` at two weights, authored as SVG tiles.
- The seam: a 2px indigo rule with the jina hanging beneath it, in the same place on every panel.
- Square corners everywhere; `full` radius exists only for status dots.
- Two self-hosted variable faces, no monospace; measurement is set in Archivo's tabular figures.
- One motion orchestration and one easing curve for the whole site.

## Colors

A warm, printed neutral field with a single indigo ink — the palette of a two-colour press run, not of a UI kit.

### Primary
- **Kanga Indigo** (`pindo`): the border ink and the state ink. It draws every pindo tile, the 2px seam, links in running copy, the primary action, the focus ring, the caret, selection, and the scrollbar thumb on hover. 8.5:1 on the page ground; `cloth-50` on an indigo field is 9.3:1.
- **Indigo Deep** (`pindo-deep`): hover and pressed states of the primary action only.
- **Indigo Wash** (`pindo-wash`): a pale indigo ground for selected/active chrome. Non-text ground only.

### Neutral
- **Raised Cotton** (`cloth-50`): input grounds, packet grounds, and text reversed out of an indigo field.
- **Page Cotton** (`cloth-100`): the page ground and every panel field.
- **Recessed Cotton** (`cloth-200`): recessed bands, table stripes, the packet reverse, hover ground inside a band.
- **Hairline** (`cloth-300`): 1px rules and dividers.
- **Heavy Rule** (`cloth-400`): heavier rules, quiet-button and field strokes, disabled chrome, link underlines at rest.
- **Ink** (`mark-900`): primary copy, headings, jina, and the 1px hard edge around packets and screenshots.
- **Secondary Ink** (`mark-700`), **Tertiary Ink** (`mark-600`), **Caption Ink** (`mark-500`): the descending copy ramp.

### Tertiary
- **Maintenance Ochre** (`warn`): status only — a client site inside a maintenance window (5.1:1 on the page ground).
- **Alarm Red** (`alarm`): destructive only — form validation errors (5.0:1 on `cloth-100`, 5.4:1 on `cloth-50`).

### Named Rules
**The One Ink Rule.** There is exactly one accent. It is spent on the border, on state, on links and on the primary action. If indigo is doing something decorative — a tint block, a fill for interest, a second brand colour — it is wrong.

**The Non-Text Floor Rule.** `cloth-400` is 2.2:1 on the page ground and is **never** used for text. Every text colour on this site is one of `mark-900` / `700` / `600` / `500`, each of which clears WCAG AA on `cloth-50`, `cloth-100` and `cloth-200` (15.5:1 / 9.3:1 / 6.8:1 / 5.5:1 on `cloth-100`). `mark-500` is the floor; placeholders are text and sit on it.

**The Legacy Boundary Rule.** `tailwind.config.js` also carries an `ink` / `signal` dark ramp. That is the previous identity, retained solely because the private `/admin` area still runs on it. Nothing under `src/components` or `src/sections` may reference it — by token name **or as a literal hex in a default prop, a fallback, or an inline style**. The leak that survived longest was `#C8FF3D`, the previous identity's acid lime, sitting as a default argument on a public loading spinner where no class name would ever betray it. If `/admin` is ever redesigned, the block is deleted with it.

## Typography

**Display Font:** Bricolage Grotesque (self-hosted variable woff2, 400–800; falls back to Archivo)
**Body Font:** Archivo (self-hosted variable woff2, 400–700; falls back to system-ui)
**Label/Mono Font:** none — deliberately

**Character:** Bricolage carries the printed line: tight, weighted, slightly irregular, set at a size that behaves like ink on cloth rather than like a web headline. Archivo does everything else — plain, measured, and honest about numbers, since its tabular figures let columns of measurements line up without a monospace costume.

### Hierarchy
- **Jina** (Bricolage 700, `clamp(2.25rem, 6.2vw, 5.25rem)`, 0.94, -0.035em): the printed line under the seam on every full-width panel. The largest thing on the object, and the sentence the visitor leaves with. Balanced wrapping.
- **Jina Lead** (Bricolage 700, `clamp(2.25rem, 4.6vw, 4rem)`, 0.96): the lead panel's jina only; it sets against a half-width column, so it climbs on a shallower slope. Used once, on the h1.
- **Jina Small** (Bricolage 700, `clamp(1.75rem, 4vw, 3rem)`, 1.0): a jina in a narrower measure.
- **Display** (Archivo 600, `clamp(1.875rem, 3.4vw, 2.75rem)`, 1.08): the section's real `h2`, set under the jina at `max-w-[26ch]` in secondary ink. The jina states; the heading names.
- **Title** (Bricolage 700, `clamp(1.25rem, 2.2vw, 1.75rem)`, 1.15): sub-headings inside a panel's field.
- **Figure** (Bricolage 700, `clamp(1.375rem, 2vw, 1.875rem)`, 1, tabular): the measured value in a band. Never used for anything that isn't a measurement.
- **Lead** (Archivo 400, `clamp(1.0625rem, 1.15vw, 1.1875rem)`, 1.65): the paragraph under a heading, capped at `68ch`.
- **Body** (Archivo 400, 1rem, 1.6): running copy, capped at `68ch`.
- **Label** (Archivo 400, 0.6875rem, +0.09em, uppercase): band labels, table headers, tag chips, and provenance meta.

### Named Rules
**The No-Costume Rule.** There is no monospace face. Labels, dates, repo names and figures are not code, and setting them in mono was the old system wearing "technical" as a costume. Measurement is set in Archivo with tabular figures via the `.tabular` class — which is also applied by default to `table td`, `table th` and `time`, so columns line up and nothing jitters on hover.

**The Jina-First Rule.** Exactly one jina per panel, and it is always the largest type on that panel. Never set two competing display lines in one field, and never use jina scale for anything that isn't the panel's claim.

**The Label Is Interior Rule.** The uppercase label style belongs **inside** bands, tables, chips and figure captions. It is never set above a heading as a kicker or eyebrow. A section is introduced by its seam and its jina, not by a small capitalised word. Where an identity line must accompany a heading, it sits **beside** it on a shared baseline (`flex flex-wrap items-baseline justify-between`, heading first) or rides at the end of the tagline as an inline span — the arrangement the packet reverse and the case-study modal both use.

## Layout

The site is a vertical stack of panels. Each panel is a `<section>` with horizontal page padding (1rem / 1.5rem at `sm` / 2.5rem at `lg`) and a bottom rhythm of `spacing.section` (`clamp(3.5rem, 7.5vw, 6.5rem)`). Inside it, one centred sheet capped at `max-w-sheet` (1360px) on the page ground, wearing the pindo. Inside the frame, the field carries a uniform inner padding of `1rem/2rem` → `2rem/2.5rem` at `sm` → `3rem/3.5rem` at `lg`.

The pindo band width (`spacing.pindo`, 16px) is also the panel's inner gutter measure, so the frame and its content share one measure. Prose is capped at `68ch` (`max-w-prose`); the `h2` under a jina is capped at `26ch`.

Bands are a single-column stack below `sm` — figure, label, source on one baseline column — and open to `--band-cols` (default three equal columns) at `sm` and up, separated by 1px gaps in `cloth-300` that read as printed rules. Breakpoints are `xs` 320, `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.

The lead panel is a two-column grid at `lg` (minimum height `calc(100svh - 8rem)`) that inverts source order on mobile: the field with the running client platform is `order-1` on a phone, so shipped software is on screen before any claim about it, and moves to the right column on desktop so claim and evidence land in the same viewport. The navbar is fixed; `scroll-padding-top: 4.5rem` keeps anchored sections clear of it.

### Named Rules
**The Seam Is The Law.** Every panel head is a 2px indigo top rule (`.hem`) with the jina hanging directly beneath it at `pt-6` / `md:pt-8`, in the same place on every panel of the sheet. **Nothing else on this site draws a 2px indigo rule.** That exclusivity is the rule: the moment a second element borrows the seam, the sheet stops being a sheet.

**The Mirror-Margins Rule.** `PanelHead`'s `reversed` variant bleeds to the panel's own edges using negative margins (`-mx-4 -mt-8` → `sm:-mx-8 -mt-10` → `lg:-mx-12 -mt-14`) that mirror `Panel`'s inner padding exactly. Change one and you must change the other, or the reversed band tears away from the frame.

## Elevation & Depth

**There are no shadows.** Not one elevation token exists in the config, and no surface on the site casts one — no panel, packet, button, field, menu, modal or error state. This is printed cloth: depth is carried entirely by ink weight and tonal ground.

The depth vocabulary, from heaviest to lightest:
1. **The full pindo** (14px, 20px at `md`) — the lead panel only.
2. **The rule pindo** (12px, 16px at `md`) — every other panel. The same border language at a third of the ink.
3. **The 2px indigo seam** — the panel head, and nothing else.
4. **A 1px `mark-900` hard edge** — around packets and screenshots; the finished edge of an object.
5. **Hairlines in `cloth-300`, heavier strokes in `cloth-400`** — dividers, field and quiet-button strokes.
6. **Tonal ground steps** — `cloth-50` raised, `cloth-100` field, `cloth-200` recessed.

### Named Rules
**The Printed-Not-Lit Rule.** The ground is flat cotton. No gradient, no vignette, no texture image, no blur, no glass, no `box-shadow`, no hover lift. If a surface needs to read as separate, change its tonal step or draw a rule; do not light it.

## Shapes

Square. `borderRadius` is overridden to `0px` for `DEFAULT`, `sm`, `md` and `lg`; the only survivor is `full` (9999px), which exists solely for the round dot inside a live status mark. Printed cloth has no rounded corners, so buttons, fields, chips, packets, panels and menus are all hard rectangles.

The recurring silhouette is the framed rectangle: an authored border enclosing a plain field. The border is a genuine nine-slice — `border-image-source` pointing at a 64×64 authored SVG tile, `border-image-slice: 16`, `border-image-repeat: round` — so corners carry their own motif and the run repeats cleanly at any width. The rule tile draws double edge lines with tick marks; the full tile adds an inner track and diamond motifs. Both are drawn in a single colour, indigo.

### Named Rules
**The Real Frame Rule.** The pindo is a nine-slice `border-image` at two weights (`.pindo-full` on the lead panel only, `.pindo` everywhere else). Four CSS border lines pretending to be a frame is not this border. New framed surfaces reuse the existing tiles; they do not invent a third weight.

## Components

### Buttons
- **Shape:** hard rectangles (0px), inline-flex, centred, with a 0.625rem gap for an inline SVG glyph.
- **Primary (`.btn-pindo`):** indigo ground, `cloth-50` text, semibold, `0.875rem 1.5rem`. Hover deepens to `pindo-deep`. The navbar variant tightens to `1.25rem/0.625rem` at `text-sm`.
- **Outline (`.btn-outline`):** 2px indigo stroke, indigo text, transparent ground, `0.75rem 1.5rem`. Hover fills indigo with `cloth-50` text.
- **Quiet (`.btn-quiet`):** 1px `cloth-400` stroke, `mark-700` text, `text-sm` medium, `0.5rem 1rem`. Hover moves stroke and text to indigo. This is the utility control — the packet turn, filters.
- **Focus:** the global ring — 2px indigo outline at 2px offset. No per-button focus treatment.
- **Transition:** colour only, 250ms on `press`. Buttons do not move, scale or lift.

### Cards / Containers (Panel)
- **Corner Style:** square (0px).
- **Background:** `cloth-100` field on the `cloth-100` page ground; the frame is what separates them.
- **Shadow Strategy:** none — see Elevation & Depth.
- **Border:** the pindo (`.pindo`, or `.pindo-full` for the lead panel).
- **Internal Padding:** `1rem/2rem` → `2rem/2.5rem` (`sm`) → `3rem/3.5rem` (`lg`).

### Inputs / Fields
- **Style (`.field`):** full width, 1px `cloth-400` stroke, `cloth-50` ground, `mark-900` text, `0.75rem 1rem`, square.
- **Focus:** stroke moves to indigo with a 2px indigo ring at 25% opacity; the default outline is suppressed for this one control because the ring replaces it.
- **Error:** `aria-invalid="true"` swaps the stroke to `alarm`. The state is announced by the attribute and the message, not by the colour alone.
- **Label (`.field-label`):** `text-sm`, semibold, `mark-700`, 0.5rem above the control. Always visible; no placeholder-as-label.

### Navigation
Fixed full-width bar on the page ground, `max-w-sheet`, capped at `0.875rem` vertical padding. Wordmark set in Bricolage bold at `1.0625rem` beside an indigo inline SVG mark. Desktop links are `text-sm` medium `mark-700`, hover to indigo, no underline, colour transition only; the right-hand action is the primary button at small size. Below `lg` the links collapse behind an inline SVG toggle into a full-width panel on the page ground with a **2px indigo bottom border** — the one place the seam weight is echoed as the panel's own closing edge — with items set in Bricolage semibold at `text-lg`, each divided by a `cloth-300` hairline.

### Band (the measured facts)
The provenance component. Under every hem, figures are stated in one shape, in one place, in tabular type. A cell stacks figure (`figure` scale, Bricolage bold), label (uppercase `label`), then source (`text-xs`, `mark-500`, capped at 34ch). A cell with an `href` becomes a link to the artifact that proves it: hover moves the ground to `cloth-200` and the figure to indigo, colour only.

**The Sourced-Figure Rule.** A figure reaches display scale only if it carries provenance. `Band` renders `item.source` beneath the label rather than beside it, and `Projects` renders `metrics.filter(m => m.source)` — an unsourced number is structurally unable to appear at figure scale. This is a content rule with teeth: it is enforced by the filter, not by discipline.

### State Mark
**The Printed Mark Rule.** State is a printed mark plus its own word, never a hue. `.mark-state` sets an uppercase label in `mark-700` preceded by a 9×9px indigo square. `data-state="live"` rounds that square to a dot; `data-state="maintenance"` hollows it into a rotated ochre diamond and shifts the text to `warn`. Colour never carries the state alone, and green/amber/red status dots are not part of this language.

### Reversed Panel Head
`PanelHead` with `reversed` prints the head into an indigo field, jina reversed out in `cloth-50` and heading/lead in `cloth-100`, bled to the panel's own edges, opened by a 2px `cloth-100` rule that is the seam inverted. **It is spent exactly once, on the closing contact panel.** On all eight panels it would be wallpaper; on the one panel a visitor is meant to act in, it is the anchor the whole scroll builds toward. Its negative margins are coupled to `Panel`'s inner padding (see The Mirror-Margins Rule).

### The Packet (signature component)
A case study is a two-faced object, like a seed packet: the running screenshot on the face, the specification on the reverse. Both faces occupy **one grid cell** (`grid-area: 1 / 1`) inside a `transform-style: preserve-3d` stack, so the object keeps its height through the turn; `data-turned="true"` rotates the stack 180°, and `.packet-reverse` is pre-rotated to meet it. A `@supports not (transform-style: preserve-3d)` block flattens both transforms so the turn degrades to a cross-fade rather than a broken plane. The reverse subtree mounts only on first turn. The face is a 1px `mark-900` rectangle on `cloth-50`; the reverse sits on `cloth-200`. Below the stack, a fixed stile — a `mark-900` top rule over `cloth-100` — carries the state mark on the left and the quiet turn button (`aria-pressed`) on the right, and stays put while the sheet turns.

The stack pins its own track: `grid-template-columns: minmax(0, 1fr)` with `min-width: 0` on the stack and on both faces. Without it, a grid item's default `min-width: auto` lets the widest face set the width of the object — the specification table's intrinsic minimum pushed the whole packet past the panel's border on a phone, and the table's scroll container never scrolled because nothing was ever narrower than it.

The reverse renders its schema twice from one data source: stacked rows below `sm` (table name and shape on one baseline, the description beneath), the three-column table at `sm` and up. A schema is genuinely tabular at reading width and genuinely is not on a phone, and asking someone to drag sideways inside a card that also turns is not a control.

**The Pinned-Track Rule.** A flip container is a grid, and a grid track that is not pinned to `minmax(0, 1fr)` will be widened by its widest face. Every face of a two-faced object carries `min-width: 0`, and any content with an intrinsic minimum (a table, a long token, a preformatted line) gets a narrow rendering rather than a horizontal scroller. Verified with both packets turned at 320, 390, 430 and 768: nothing exceeds the panel frame.

### Motion
**The One Press Rule.** Motion is a single orchestration, declared once in `index.css` and applied by `Panel` / `PanelHead`, never authored per section. A panel prints: the frame settles (`settle`, 500ms), the jina wipes left-to-right through a `clip-path: inset(0 100% 0 0)` → `inset(0)` reveal (`print`, 620ms, 90ms delay), the body settles (480ms, 160ms), the band settles last (480ms, 260ms). One easing curve site-wide: `press` = `cubic-bezier(0.16, 1, 0.3, 1)`, an exponential settle like a press coming down. Durations outside the print are 250ms or 400ms, and interaction transitions are colour-only. `prefers-reduced-motion: reduce` collapses every animation and transition to 0.01ms and disables smooth scrolling.

### Browser Surfaces
The parts of the page nobody draws still carry the design. Selection is indigo with `cloth-50` text; the caret is indigo; `:focus-visible` is a single 2px indigo outline at 2px offset for the whole site; Firefox scrollbars are thin in `cloth-400` on `cloth-100`, and the WebKit scrollbar is a 12px `cloth-400` thumb inset by a 3px `cloth-100` border that goes indigo on hover. Links carry `text-underline-offset: 0.22em` with `from-font` thickness. `color-scheme: light` and `theme-color: #F2EEE5` extend the ground into browser chrome.

## Do's and Don'ts

### Do:
- **Do** build every new section as a panel: pindo, field, seam, jina — `<Panel>` + `<PanelHead>`, not a bespoke layout.
- **Do** spend indigo on the frame, state, links and the primary action only.
- **Do** give every figure a `source` (or an `href` to the artifact); the filter will drop it otherwise.
- **Do** state status as a printed mark plus its word (`.mark-state` with `data-state`).
- **Do** keep every text colour at `mark-500` or darker, and treat `cloth-400` as non-text.
- **Do** set measurements with the `.tabular` class in Archivo.
- **Do** let `Panel`/`PanelHead` supply the entrance; one orchestration, one curve (`press`).
- **Do** inline icons as SVG paths at 16–18px, stroked in `currentColor`.
- **Do** pin any flip or stacked-face container to `minmax(0, 1fr)` with `min-width: 0` on the container and every face.
- **Do** give tabular content a stacked rendering below `sm` rather than a horizontal scroller.
- **Do** set an identity line beside a heading on a shared baseline, never above it.
- **Do** keep error and fallback states inside the palette: `border-alarm` on square corners, no shadow.

### Don't:
- **Don't** add a second accent, a tint block, or any decorative use of indigo.
- **Don't** draw a 2px indigo rule anywhere but a panel's seam.
- **Don't** use the `reversed` panel head a second time; it belongs to the closing contact panel.
- **Don't** add `box-shadow`, gradients, blur, glass, texture images or hover-lift; depth is ink weight and tonal ground.
- **Don't** round a corner. The only `full` radius on the site is the live status dot.
- **Don't** fake the pindo with plain CSS borders, or author a third border weight.
- **Don't** introduce a monospace face, or set labels, dates, repo names or figures as if they were code.
- **Don't** set a small uppercase label above a heading as a kicker or eyebrow; the seam and the jina are the introduction.
- **Don't** author per-section entrance animations, or a second easing curve.
- **Don't** reference the legacy `ink` / `signal` ramp anywhere in `src/components` or `src/sections`, including as a raw hex in a default prop or fallback.
- **Don't** solve an overflowing face with `overflow-x: auto` and a `min-width`; pin the track and render narrow instead.
- **Don't** reach for a Tailwind default palette colour (`red-500` and friends) for an error surface; `alarm` is the destructive ink.
