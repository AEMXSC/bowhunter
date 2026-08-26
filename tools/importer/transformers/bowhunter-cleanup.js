/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bowhunter site-wide cleanup.
 *
 * Removes non-authorable page shell / chrome from the legacy .NET CMS output so
 * the import contains only page-level authorable content.
 *
 * ALL selectors below were verified by reading the scraped DOM in
 * migration-work/cleaned.html and migration-work/pages/{article,listing,magazine}/cleaned.html
 * (and the corresponding migration-work/source-html/*.html). None are guessed.
 *
 * NOTE ON SIDEBARS: the homepage right-rail (#MainContent_HomePageArticles_homepage_right_rail,
 * class "is-sidebar") holds the authorable hero + video blocks, so `.is-sidebar` is
 * deliberately NOT removed. Only the ad slots inside it are stripped (via adpos_/.ad-wrapper).
 * The article "related-articles" sidebar is non-authorable and is removed by its own class.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / consent / hidden modals — removed early so they cannot interfere
    // with block parsing. Verified in cleaned.html.
    WebImporter.DOMUtils.remove(element, [
      '#ketch-banner', // ketch cookie/consent banner (fixed overlay)
      '#ketch-consent-banner',
      '#currentSubscribers', // .lity-hide modal
      '#sub-modal-container', // .lity-hide modal
      '#newsletter-modal-container', // .lity-hide modal
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome + ad slots + tracking noise.
    WebImporter.DOMUtils.remove(element, [
      // top promo lanyard + main navigation panel
      '#lanyard_root',
      '#MainNav_MainNavigationControl_magazineMainNavPanel',
      // header / masthead
      'header',
      // navigation (main dropdown, breadcrumb sub-nav, article pagination)
      'nav',
      // search bar
      '.wrapper.search-bar',
      '#cludo_search_form',
      // advertising slots (adpos_top / adpos_right* / adpos_bottom* etc. + wrappers)
      '[id^="adpos_"]',
      '.ad-wrapper',
      // article related-articles sidebar (non-authorable; NOT present on home)
      '.related-articles',
      // social share widgets
      '.social-links',
      // footer + footer nav panel + legal disclaimer
      'footer',
      '#FooterNavigation_magazineFooterPanel',
      '.disclaimer-text',
      '#dfpid',
      // script/style noise
      'script',
      'noscript',
    ]);

    // Strip legacy tracking / behaviour attributes left on surviving elements.
    element.querySelectorAll('[data-ga], [onclick], [data-page]').forEach((el) => {
      el.removeAttribute('data-ga');
      el.removeAttribute('onclick');
      el.removeAttribute('data-page');
    });
  }
}
