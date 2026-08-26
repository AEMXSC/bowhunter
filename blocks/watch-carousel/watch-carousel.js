/**
 * Static fragment loader — this section's carousel engine is shared
 * (global .caro init) with the footer logo carousel, so it can't be
 * an independent block. Not authored in DA. See decisions.json.
 */
export default async function decorate(block) {
  const resp = await fetch('/fragments/bowhunter/watch-carousel.html');
  if (!resp.ok) return;
  block.innerHTML = await resp.text();
}
