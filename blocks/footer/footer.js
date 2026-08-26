/**
 * Loads the site footer fragment from the code bus.
 * Overlay-controlled (page-level) pages set main.dataset.overlay = <template>
 * during loadEager; block-level pages don't, so this falls back to the
 * shared brand fragment (header/footer are site-wide, not per-template).
 * Fragments live at /fragments/<template>/footer.html.
 */
export default async function decorate(block) {
  const template = document.querySelector('main')?.dataset?.overlay || 'bowhunter';
  const path = `/fragments/${template}/footer.html`;
  const resp = await fetch(`${window.hlx.codeBasePath}${path}`);
  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.warn(`[footer] fragment not found at ${path}`);
    return;
  }
  block.innerHTML = await resp.text();
}
