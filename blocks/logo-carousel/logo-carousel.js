/**
 * Static fragment loader — shared carousel engine with the Watch
 * video carousel (same global .caro init), decorative cross-promo
 * content. Not authored in DA. See decisions.json.
 */
import { ensureDOMPurify } from '../../scripts/scripts.js';
import { DOMPURIFY } from '../../scripts/aem.js';

export default async function decorate(block) {
  const resp = await fetch('/fragments/bowhunter/logo-carousel.html');
  if (!resp.ok) return;
  const html = await resp.text();
  await ensureDOMPurify();
  block.innerHTML = window.DOMPurify.sanitize(html, DOMPURIFY);
}

