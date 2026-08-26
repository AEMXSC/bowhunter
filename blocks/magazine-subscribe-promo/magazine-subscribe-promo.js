/**
 * Static fragment loader — CMS-injected promo keyed by an external
 * promo ID, not a fixed content shape. Not authored in DA.
 * See decisions.json.
 */
export default async function decorate(block) {
  const resp = await fetch('/fragments/bowhunter/magazine-subscribe-promo.html');
  if (!resp.ok) return;
  block.innerHTML = await resp.text();
}
