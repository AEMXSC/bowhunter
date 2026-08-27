/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns. Base: columns.
 * Sources:
 *   - section.has-promo.is-magazine-sub .row   (cover image | "Subscribe & Save" heading + CTAs)
 *   - section.wrapper.buy-issue .row.middle-sm  (app icon | "Buy single digital issue" heading + app-store links)
 * Model (columns): first content row = N cells, one per column. Columns blocks take
 * ONLY default content — NO field-hint comments (per xwalk hinting rules, Rule 4 exception).
 * Generated: 2026-08-26
 */
export default function parse(element, { document }) {
  const promoteImg = (img) => {
    if (!img) return;
    const real = img.getAttribute('data-src')
      || img.getAttribute('data-src-lg')
      || img.getAttribute('data-src-xs')
      || img.getAttribute('data-flickity-lazyload');
    if (real && (!img.getAttribute('src') || /BackgroundGradLoad|blank|placeholder/i.test(img.getAttribute('src') || ''))) {
      img.setAttribute('src', real);
    }
  };

  // Each direct child div is a column.
  const columnEls = Array.from(element.querySelectorAll(':scope > div'))
    .filter((d) => d.textContent.trim() || d.querySelector('img'));

  if (columnEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const row = columnEls.map((col) => {
    // Promote lazy images inside the column, then hand the column's children
    // to the cell as default content (no field hints for columns).
    col.querySelectorAll('img').forEach(promoteImg);
    const frag = document.createDocumentFragment();
    Array.from(col.childNodes).forEach((n) => frag.appendChild(n.cloneNode(true)));
    return frag;
  });

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}

