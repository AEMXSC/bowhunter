/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bowhunter section boundaries + Section Metadata.
 *
 * Establishes EDS section breaks (<hr>) around styled sections and inserts a
 * "Section Metadata" block carrying the section background style.
 *
 * DATA SOURCE (why this reads `blocks`, not `sections`):
 *   This project's tools/importer/page-templates.json expresses styled sections
 *   via the per-block `section` property (light | highlight | dark) rather than a
 *   top-level `template.sections[]` array. Each such block's `instances[0]`
 *   selector is the top-level <section> wrapper for that styled section
 *   (verified against the per-page page-structure.json files + cleaned.html):
 *     - section.wrapper.has-grid.lastest-articles.clearfix:not(.has-prods-container)  -> light   (home)
 *     - section.has-promo.is-magazine-sub                                              -> highlight (home/listing/magazine)
 *     - section.full-width-container.is-newsletter.has-promo                           -> dark    (home/listing)
 *   We also honour a standard `template.sections[]` array if a future template
 *   provides one (forward-compatible), preferring it when present.
 *
 * ISOLATION MODEL: each styled section is wrapped with an <hr> before and after
 * (when a neighbouring element exists) so its background style cannot bleed into
 * adjacent sections. A marker <hr> gives a stable anchor for the metadata block
 * because block parsers may replace the section element between the two hooks.
 *
 * WHY BOTH HOOKS: breaks are inserted in `beforeTransform` while every section
 * element still exists (parsers run between the hooks and call
 * element.replaceWith(block), destroying section elements that are themselves a
 * block). Metadata is inserted in `afterTransform`, anchored to the surviving
 * marker <hr>. Sections are processed in reverse so inserts never disturb the
 * positions of not-yet-processed sections.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };
const SECTION_MARKER_ATTR = 'data-excat-section-id';

/**
 * Build the ordered list of styled sections for the current page from the
 * template payload. Returns [{ id, selector, style }].
 */
function getStyledSections(payload) {
  const template = (payload && payload.template) || {};

  // Forward-compatible: a real sections[] array with style takes precedence.
  if (Array.isArray(template.sections) && template.sections.length) {
    return template.sections
      .filter((s) => s && s.selector && s.style)
      .map((s, idx) => ({ id: s.id || `section-${idx}`, selector: s.selector, style: s.style }));
  }

  // This project's schema: styled blocks carry a `section` style; their first
  // instance selector is the top-level <section> wrapper.
  const blocks = Array.isArray(template.blocks) ? template.blocks : [];
  return blocks
    .filter((b) => b && b.section && Array.isArray(b.instances) && b.instances.length)
    .map((b) => ({ id: b.name, selector: b.instances[0], style: b.section }));
}

export default function transform(hookName, element, payload) {
  const sections = getStyledSections(payload);
  if (!sections.length) return;

  if (hookName === TransformHook.beforeTransform) {
    // Insert isolating breaks now, while every section element still exists.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      // Trailing break: end the styled section before the following content so
      // its background style cannot bleed forward. Only if a neighbour exists.
      if (sectionEl.nextElementSibling && sectionEl.nextElementSibling.tagName !== 'HR') {
        sectionEl.after(document.createElement('hr'));
      }

      // Leading marker break: starts the styled section and is the stable anchor
      // for the Section Metadata block inserted in afterTransform.
      const marker = document.createElement('hr');
      marker.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(marker);
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Parsers have run; section elements may be gone. Anchor metadata to the
    // surviving marker <hr> (or the original element as a fallback).
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        // If this styled section is the very first content on the page, drop the
        // leading break to avoid an empty leading section; the metadata stays as
        // the first content of the (now first) section.
        if (!marker.previousElementSibling) marker.remove();
      }
    }
  }
}

