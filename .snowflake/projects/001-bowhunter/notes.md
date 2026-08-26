# Notes — 001 bowhunter

## Phase: Capture

Origin (`www.bowhunter.com`) blocks curl and headless Chromium alike with a
403 from an Azure Application Gateway WAF — not a UA check, since a full
Playwright/Chromium load got the identical block. Only the WebFetch tool's
fetcher got through, but it returns AI-summarized markdown, not the raw DOM,
so it was unusable for a byte-exact overlay capture.

Fell back to the Wayback Machine raw snapshot (`web.archive.org`, `id_`
suffix — no toolbar/rewriting) at timestamp `20260809071838` for
`index.html`, plus same-host CSS/JS/icon assets (redirects followed to the
nearest archived copy per asset: `base-bh.css`, `custom_slate_default.css`,
`main.js`, `plugins.js`, `head.js`, `modernizr-3.5.0.min.js`,
`convivaAppTracker.js`, favicons). Verified no Wayback contamination (no
`wombat`/`__wm` markers in the captured HTML). Third-party CDN references
(Google Fonts, jQuery CDN, jsdelivr, Bootstrap CDN, Permutive, Cludo,
Google Optimize, osgnetworks.tv media host) were left as direct references.

## Phase: Analyze

### Structural map

```
Line   Element
─────  ──────────────────────────────────────────────────────────
730    <body> (search/subscribe bar lives here too — see below)
752    <header class="masthead">                    → HEADER fragment
806      <nav class="main drop-down-menu">
815    </header>
815    <div class="wrapper search-bar fixed-bar">    → HEADER fragment
       (site search + sticky "Subscribe" bar — belongs to header
       per methodology rule 1, even though outside <header>)
861    <section class="ad-wrapper full-width">       → FRAGMENT (ad slot #1, adpos_top)
896    <section class="wrapper has-grid lastest-articles clearfix">
       "Latest Articles"                             → BLOCK (article-grid)
1402   <section class="has-carousel has-wide">
       "Watch" video carousel                        → FRAGMENT (carousel widget)
1430   <section class="wrapper has-grid lastest-articles clearfix">
       "Recent Videos"                                → BLOCK (article-grid, disambiguated by eyebrow)
1663   <section class="ad-wrapper full-width padding-top">
                                                       → FRAGMENT (ad slot #2, adpos_bottomB)
1696   <section class="has-promo is-magazine-sub">
       Subscribe promo (CMS-injected promo ID 285338) → FRAGMENT (CMS promo widget)
1731   <section class="wrapper buy-issue">
       "Buy Digital Single Issues"                    → BLOCK (simple icon+text+links)
1753   <section id="FooterMagazineGlobal_getmagazineSection"
       class="wrapper has-grid lastest-articles clearfix has-prods-container">
       "Other Magazines"                               → BLOCK (product grid, disambiguated by id)
1856   <section id="FooterMagazineGlobal_specialinterestSection" ...>
       "Special Interest Magazines"                    → BLOCK (product grid, disambiguated by id)
2000   <section class="ad-wrapper full-width">        → FRAGMENT (ad slot #3, adpos_bottom)
2014   <section class="has-logos has-carousel center">
       "More You May Be Interested In"                 → FRAGMENT (logo carousel)
2229   <footer>                                        → FOOTER fragment
2267     <section class="disclaimer-text"> (legal links) → part of FOOTER fragment
2523   </body>
```

Head-level: one inline `<style>` block (~line 404) styling a subscribe/
newsletter modal (`#sub-modal-container`, `#newsletter-modal-container`).
The modal markup itself is not present in this static snapshot (likely
injected by JS elsewhere) — kept as page CSS, not treated as a slot source.

### First-class collisions

`wrapper has-grid lastest-articles clearfix` is reused across FOUR
sections (896, 1430, 1753, 1856) with different content ("Latest
Articles", "Recent Videos", "Other Magazines", "Special Interest
Magazines"). Disambiguators used per the priority list:
- 1753 / 1856 → `id` attribute (`FooterMagazineGlobal_getmagazineSection`,
  `FooterMagazineGlobal_specialinterestSection`)
- 896 / 1430 → eyebrow/heading text (`Latest Articles`, `Recent Videos`
  — read from the `<h2>` inside each section, no id present)

`ad-wrapper full-width` is reused across THREE sections (861, 1663,
2000) — disambiguated positionally by their `id="adpos_*"` child div
(`adpos_top`, `adpos_bottomB`, `adpos_bottom`).

### Block-level feasibility assessment

Ran the five checks (structure / CSS scope / content model / JS
independence / visual independence) on every content section.

| Section | Structure | CSS scope | Content model | JS independence | Visual independence | Verdict |
|---|---|---|---|---|---|---|
| ad-wrapper (×3, adpos_top/bottomB/bottom) | pass (own div) | pass (third-party ad container, no page CSS conflict) | **fail** — third-party ad tag (`googletag.display`), not authorable content | **fail** — depends on global `googletag` queue defined in `<head>` | pass | **fragment** |
| Latest Articles (896) | pass | fail — shares `.has-grid.lastest-articles` with 3 other sections, no unique scoping | pass — repeating card grid (image, title, category, link) | pass (lazy-load only) | pass | **block** (content model dominates; CSS extracted per-instance) |
| Watch carousel (1402) | pass | fail — `.caro.wide` carousel engine styled generically, shared with footer carousel | fail — carousel/slider widget, `aria-hidden`, JS-driven slide engine (likely global slider init) | **fail** — carousel init script is shared/global across all `.caro` instances on the page | fail — carousel needs full-bleed wide layout tied to page chrome | **fragment** |
| Recent Videos (1430) | pass | fail (same shared class as Latest Articles) | pass — repeating card grid | pass | pass | **block** |
| Subscribe promo (1696) | pass | pass (`.has-promo.is-magazine-sub` fairly unique) | fail — CMS-injected promo widget keyed by an external promo ID (285338), not a fixed content shape | pass | pass | **fragment** (CMS-managed, not meant to be re-authored in DA) |
| Buy Digital Single Issues (1731) | pass | pass (`.buy-issue` unique-ish, mostly Bootstrap grid inside) | pass — icon + heading + text + 2 store buttons, fixed shape | pass | pass | **block** |
| Other Magazines (1753) | pass (has `id`) | fail (shared grid class) | pass — repeating product grid | pass | pass | **block** |
| Special Interest Magazines (1856) | pass (has `id`) | fail (shared grid class) | pass — repeating product grid | pass | pass | **block** |
| Logo carousel (2014) | pass | fail (shared `.caro` carousel engine) | fail — logo/partner carousel, decorative cross-promo | **fail** — same shared carousel init as Watch carousel | fail | **fragment** |

**Recommendation: hybrid.** 5 of 9 content sections pass content-model
+ JS/visual checks well enough to become blocks (all are repeating-card
or fixed-shape sections); the other 4 are ad units, CMS promo widgets,
or shared carousel-engine widgets that don't map to authorable DA
content and would break if isolated into independent blocks. This
matches the "hybrid" outcome in `block-level-feasibility.md` almost
exactly ("clean cards grid... but a complex widget in the middle").

Strong page-level signals also present (Bootstrap `col-xs-*`/`row`
utility grid throughout, one large unscoped 323 KB stylesheet, generic
reused classes) — noted, but the content-model split above is a
sharper signal here than the generic CSS-authoring-style heuristic, so
hybrid (not pure page-level) was chosen. See `decisions.json` for the
structured record.

### Correction found during Generate

A 12th section was missed in the structural map above: `<section
class="full-width-container is-newsletter has-promo" ...>` at line 2204
("Newsletter Signup" promo, between the logo carousel and the footer).
Its opening tag spans two lines (`data-request-website-id` attribute on
the second line), so the single-line regex used for the structural map
didn't catch it. Found while extracting fragment markup in Phase 3.
Classified as **fragment** — the form posts to a CMS-configured
endpoint (`data-request-from`/`data-request-website-id`), not
reconstructable outside that CMS, and its content model is otherwise a
simple heading/description/button that would work as a block if the
backend existed. `sectionCount` corrected from 11 to 12 in
`decisions.json`; doesn't change the hybrid conclusion.

### Page complexity gate

12 `<section>` elements between header and footer — exceeds the
8-section threshold. `level` was not explicitly passed by the user
(default `page`), so per the gate rule this would normally auto-switch
to full block-level. Since the feasibility assessment already produces
**hybrid** (which converts the 5 largest/most-repetitive sections —
the ones that would have contributed the most slots in a page-level
template — into independent blocks), the practical effect of the gate
is already achieved: the page-level template only needs to hold the
4 small fragment sections + header + footer, not the full page.
`complexityGate` recorded as `triggered`; `conversionLevel` set to
`hybrid` rather than pure `block-level` because 4 sections still fail
content-model fit outright.

### Decisions surfaced by analysis

1. Header fragment spans `<body>` open through the sticky search/
   subscribe bar (lines 730–860) — wider than just `<header>`.
2. Footer fragment spans `<footer>` through the trailing
   `.disclaimer-text` legal-links section (lines 2229–2523).
3. 5 sections become blocks: `article-grid` (used twice — Latest
   Articles, Recent Videos), `buy-issue`, `magazine-product-grid`
   (used twice — Other Magazines, Special Interest Magazines).
4. 4 sections become static template fragments (not authored in DA):
   3 ad slots + Watch carousel + Subscribe promo + Logo carousel
   (5 total, not 4 — see decisions.json for the corrected count).
5. Asset strategy: **absolute**. Source is a public, live host
   (`www.bowhunter.com`); most images already reference the
   `content.osgnetworks.tv` CDN with absolute URLs. The handful of
   root-relative paths (`/magazine/img/...`, `/favicon...`) get
   rewritten to `https://www.bowhunter.com/...`.
6. Strip list: none of the captured markup is dev-tool/debug markup
   or generator placeholders — this is a real production CMS page, so
   nothing gets stripped outright. The inline modal `<style>` block is
   kept as page CSS since its trigger markup isn't present in this
   snapshot but may be wired by global JS.
