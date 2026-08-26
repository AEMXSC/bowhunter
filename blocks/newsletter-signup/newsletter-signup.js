/**
 * Static fragment loader — the signup form posts to a CMS-configured
 * endpoint (data-request-from/data-request-website-id on the source
 * <section>) that isn't reconstructable outside that CMS. Chrome only,
 * not wired to a real backend. Not authored in DA. See decisions.json.
 */
import { ensureDOMPurify } from '../../scripts/scripts.js';
import { DOMPURIFY } from '../../scripts/aem.js';

export default async function decorate(block) {
  const resp = await fetch('/fragments/bowhunter/newsletter-signup.html');
  if (!resp.ok) return;
  const html = await resp.text();
  await ensureDOMPurify();
  block.innerHTML = window.DOMPurify.sanitize(html, DOMPURIFY);
}
