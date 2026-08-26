/**
 * Static fragment loader — this section's carousel engine is shared
 * (global .caro init) with the footer logo carousel, so it can't be
 * an independent block. Not authored in DA. See decisions.json.
 */
import { ensureDOMPurify } from '../../scripts/scripts.js';
import { DOMPURIFY } from '../../scripts/aem.js';

export default async function decorate(block) {
  const resp = await fetch('/fragments/bowhunter/watch-carousel.html');
  if (!resp.ok) return;
  const html = await resp.text();
  await ensureDOMPurify();
  block.innerHTML = window.DOMPurify.sanitize(html, DOMPURIFY);
}
