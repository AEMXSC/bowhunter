/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero. Base: hero.
 * Sources:
 *   - home:     #MainContent_HomePageArticles_homepage_right_rail .row.mini-promo
 *               (issue promo: cover image + "Preview This Month's Issue" heading + date + CTA)
 *   - magazine: main.single-article .whats-inside  (label fragment; real hero content —
 *               cover image, headline, subtitle, intro — lives in the .page-title / .content ancestors)
 * Model (hero): 1 column, up to 3 rows — row 2 = image (field:image), row 3 = text (field:text).
 * imageAlt collapses into the <img alt> attribute (no separate hint).
 * Generated: 2026-08-26
 */
export default function parse(element, { document }) {
  // Promote lazy-loaded images to a real src so the importer downloads them.
  const promoteImg = (img) => {
    if (!img) return;
    const real = img.getAttribute('data-src-lg')
      || img.getAttribute('data-src')
      || img.getAttribute('data-src-xs')
      || img.getAttribute('data-flickity-lazyload');
    if (real && (!img.getAttribute('src') || /BackgroundGradLoad|blank|placeholder/i.test(img.getAttribute('src') || ''))) {
      img.setAttribute('src', real);
    }
  };

  let image = null;
  const textParts = [];

  if (element.classList.contains('whats-inside')) {
    // Magazine featured-issue hero. The .whats-inside selector matches label
    // fragments; build the hero from the shared .page-title / .content ancestors,
    // and process it only once (guard against the sibling .whats-inside match).
    const article = element.closest('article, main.single-article') || element.parentElement;
    if (!article || article.getAttribute('data-hero-done') === '1') {
      element.replaceWith(...element.childNodes);
      return;
    }
    article.setAttribute('data-hero-done', '1');

    image = article.querySelector('figure img, .story-image img, .content img');
    promoteImg(image);

    // Issue label(s) (e.g. "Big Game Special — July / August 2026"), headline, subtitle, intro.
    article.querySelectorAll(':scope .page-title .whats-inside, .page-title .whats-inside').forEach((w) => {
      const p = document.createElement('p');
      p.append(...Array.from(w.childNodes).map((n) => n.cloneNode(true)));
      if (p.textContent.trim()) textParts.push(p);
    });
    const h1 = article.querySelector('.page-title h1');
    if (h1) textParts.push(h1.cloneNode(true));
    const sub = article.querySelector('.page-title h3');
    if (sub) textParts.push(sub.cloneNode(true));
    const intro = article.querySelector('.content > p');
    if (intro) textParts.push(intro.cloneNode(true));
  } else {
    // Home issue-promo (.mini-promo).
    image = element.querySelector('.has-img img, img');
    promoteImg(image);

    // Heading built from the promo copy (strong text in .has-head).
    const headStrong = element.querySelector('.has-head strong');
    if (headStrong) {
      const h = document.createElement('h2');
      // Convert <br> to spaces so "Preview This<br>Month's Issue" reads correctly.
      const tmp = headStrong.cloneNode(true);
      tmp.querySelectorAll('br').forEach((br) => br.replaceWith(document.createTextNode(' ')));
      h.textContent = tmp.textContent.replace(/\s+/g, ' ').trim();
      textParts.push(h);
    }
    const date = element.querySelector('.is-date');
    if (date) {
      const p = document.createElement('p');
      p.textContent = date.textContent.trim();
      textParts.push(p);
    }
    // CTA — link the whole promo to the issue page.
    const ctaHref = (element.querySelector('.has-head a[href], .has-img a[href], a.btn-arrow[href]') || {}).getAttribute
      ? element.querySelector('.has-head a[href], .has-img a[href], a.btn-arrow[href]').getAttribute('href')
      : null;
    if (ctaHref) {
      const cta = document.createElement('a');
      cta.setAttribute('href', ctaHref);
      // Preserve the CTA's own label (sr-only date), matching source visible text.
      const ctaEl = element.querySelector('.has-cta a, a.btn-arrow');
      const ctaLabel = ctaEl ? ctaEl.textContent.replace(/\s+/g, ' ').trim() : '';
      cta.textContent = ctaLabel || 'Preview This Month’s Issue';
      const p = document.createElement('p');
      p.appendChild(cta);
      textParts.push(p);
    }
  }

  // Empty-block guard.
  if (!image && textParts.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  const imageCell = document.createDocumentFragment();
  if (image) {
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(image);
    cells.push([imageCell]);
  }

  if (textParts.length) {
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    textParts.forEach((n) => textCell.appendChild(n));
    cells.push([textCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}

