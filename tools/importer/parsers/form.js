/* eslint-disable */
/* global WebImporter */

/**
 * Parser for form. Base: form (xwalk base form block).
 * Source (home/listing): section.is-newsletter .row
 *   Newsletter signup: email input (label "Add an email address") + "Sign Me Up" submit link.
 * Model (form): reference (aem-content — form definition) + action (text — Action URL).
 *   The source is a static signup widget with no backing form model or action URL, so we
 *   emit the action URL when discoverable and preserve the visible label/CTA as content.
 * Generated: 2026-08-26
 */
export default function parse(element, { document }) {
  const label = element.querySelector('label');
  const submit = element.querySelector('a.btn, a[title], button, input[type="submit"]');
  const action = submit && submit.getAttribute('href') && submit.getAttribute('href') !== '#'
    ? submit.getAttribute('href')
    : null;

  const cells = [];

  // Row 1: action URL (field:action) — only when a real endpoint is present.
  if (action) {
    const actionCell = document.createDocumentFragment();
    actionCell.appendChild(document.createComment(' field:action '));
    actionCell.appendChild(document.createTextNode(action));
    cells.push([actionCell]);
  }

  // Row: reference/content — preserve the signup prompt and CTA label so no copy is lost.
  const refCell = document.createDocumentFragment();
  refCell.appendChild(document.createComment(' field:reference '));
  const labelText = label ? label.textContent.replace(/\s+/g, ' ').trim() : 'Add an email address';
  if (labelText) {
    const p = document.createElement('p');
    p.textContent = labelText;
    refCell.appendChild(p);
  }
  if (submit) {
    const cta = document.createElement('a');
    cta.setAttribute('href', submit.getAttribute('href') || '#');
    cta.textContent = (submit.textContent || submit.getAttribute('title') || 'Sign Me Up').replace(/\s+/g, ' ').trim();
    const p = document.createElement('p');
    p.appendChild(cta);
    refCell.appendChild(p);
  }
  cells.push([refCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}

