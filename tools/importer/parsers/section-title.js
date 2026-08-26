/* eslint-disable */
/* global WebImporter */

/**
 * Parser for section-title. Base: section-title.
 * Source (listing): ... .col-xs-12.col-sm-8.col-md-9 > div.row h2.subhead
 *   Listing group headings (e.g. "Whitetail", "Big Game", "Turkeys").
 * Model (section-title): title (field:title) + titleType (collapsed into heading tag).
 *   A single row/cell holds the heading element; the tag (h2) encodes titleType,
 *   so no separate hint for titleType (collapsed-field rule).
 * Generated: 2026-08-26
 */
export default function parse(element, { document }) {
  // The matched element is the heading itself (h2.subhead) or a wrapper containing it.
  const heading = element.matches('h1, h2, h3, h4, h5, h6')
    ? element
    : element.querySelector('h1, h2, h3, h4, h5, h6');

  const text = heading ? heading.textContent.replace(/\s+/g, ' ').trim() : '';
  if (!text) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Preserve the heading level (encodes titleType) — default h2 for listing subheads.
  const level = heading ? heading.tagName.toLowerCase() : 'h2';
  const h = document.createElement(level);
  h.textContent = text;

  const titleCell = document.createDocumentFragment();
  titleCell.appendChild(document.createComment(' field:title '));
  titleCell.appendChild(h);

  const cells = [[titleCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'section-title', cells });
  element.replaceWith(block);
}
