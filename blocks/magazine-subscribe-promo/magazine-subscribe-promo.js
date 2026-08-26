/**
 * Static fragment loader — CMS-injected promo keyed by an external
 * promo ID, not a fixed content shape. Not authored in DA.
 * See decisions.json.
 */
import { ensureDOMPurify } from '../../scripts/scripts.js';
import { DOMPURIFY } from '../../scripts/aem.js';

export default async function decorate(block) {
  const resp = await fetch('/fragments/bowhunter/magazine-subscribe-promo.html');
  if (!resp.ok) return;
  const html = await resp.text();
  await ensureDOMPurify();
  block.innerHTML = window.DOMPurify.sanitize(html, DOMPURIFY);
}
