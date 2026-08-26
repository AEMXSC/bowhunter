/**
 * Static fragment loader — shared carousel engine with the Watch
 * video carousel (same global .caro init), decorative cross-promo
 * content. Not authored in DA. See decisions.json.
 */
export default async function decorate(block) {
  const resp = await fetch('/fragments/bowhunter/logo-carousel.html');
  if (!resp.ok) return;
  block.innerHTML = await resp.text();
}
