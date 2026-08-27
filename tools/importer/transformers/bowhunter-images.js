/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bowhunter lazy-image resolution.
 *
 * The legacy .NET CMS lazy-loads images: the on-page <img>/<iframe> `src` is a
 * placeholder (http(s)://.../img/BackgroundGradLoad.jpg), and the real asset URL
 * (on content.osgnetworks.tv) lives in a data attribute. This transformer copies
 * the real URL onto `src` so the actual content.osgnetworks.tv URL survives into
 * the imported markup (assets are relocated to AEM DAM later).
 *
 * Runs in `beforeTransform` so that block parsers (which run between the hooks and
 * extract <img> references into block cells) see the resolved URL, not the
 * placeholder.
 *
 * ATTRIBUTE PRIORITY (verified in migration-work/source-html/*.html):
 *   - data-src-lg          : large responsive source on article/card imgs (preferred)
 *   - data-src             : single lazy source (also used on lazy <iframe>)
 *   - data-src-xs          : small responsive source (fallback)
 *   - data-flickity-lazyload : lazy source for carousel/logo imgs
 * The placeholder marker in `src` is the substring 'BackgroundGradLoad'.
 *
 * NOTE: the local snapshot (migration-work/cleaned.html) has these data
 * attributes stripped by the scraper, so validation against the snapshot reports
 * no changes; the real attributes are present on the live page the import runs
 * against, where the resolution takes effect.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };
const PLACEHOLDER = 'BackgroundGradLoad';
const SRC_ATTRS = ['data-src-lg', 'data-src', 'data-src-xs', 'data-flickity-lazyload'];
// Real origin for root-relative source assets (partner logos /img/gray-logos/*, app icons,
// etc.). The import runs against a local staging host, so root-relative paths would otherwise
// be absolutized to that throwaway host. Pin them to the true origin instead.
const SOURCE_ORIGIN = 'https://www.bowhunter.com';

function resolveRealUrl(el) {
  for (let i = 0; i < SRC_ATTRS.length; i += 1) {
    const val = el.getAttribute(SRC_ATTRS[i]);
    if (val && !val.includes(PLACEHOLDER)) return val;
  }
  return null;
}

function pinRootRelative(el, attr) {
  const val = el.getAttribute(attr);
  // Root-relative path like "/img/gray-logos/x.png" (not "//host" protocol-relative).
  if (val && val.startsWith('/') && !val.startsWith('//')) {
    el.setAttribute(attr, SOURCE_ORIGIN + val);
  }
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Resolve every lazy <img> and lazy <iframe> that carries a real source in a
    // data attribute. Match on the lazy class or the placeholder src so we don't
    // touch already-resolved images.
    const candidates = element.querySelectorAll(
      'img.lazy, iframe.lazy, img[src*="BackgroundGradLoad"], img[data-src-lg], img[data-src], img[data-flickity-lazyload]',
    );

    candidates.forEach((el) => {
      const currentSrc = el.getAttribute('src') || '';
      // Only rewrite when the current src is missing or the placeholder.
      const needsFix = !currentSrc || currentSrc.includes(PLACEHOLDER);
      if (!needsFix) return;

      const realUrl = resolveRealUrl(el);
      if (!realUrl) return;

      el.setAttribute('src', realUrl);
      // Drop the now-redundant lazy data attributes so they don't linger in output.
      SRC_ATTRS.forEach((attr) => el.removeAttribute(attr));
      el.classList.remove('lazy');
    });

    // Pin root-relative <img> sources (partner logos, app icons) to the real origin so
    // they don't get absolutized to the local staging host during import.
    element.querySelectorAll('img[src^="/"]:not([src^="//"])').forEach((img) => {
      pinRootRelative(img, 'src');
    });
  }
}

