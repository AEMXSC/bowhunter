/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards. Base: cards (a container that renders a GRID of `card` items).
 *
 * CRITICAL: This parser is CONTAINER-based. Each parse() call receives a container
 * element that holds MANY cards, and emits a SINGLE cards block with one row per card
 * (col 1 = image field:image, col 2 = text field:text). This is what makes the block
 * render as a responsive grid. (An earlier per-card version produced one full-width
 * block per card — visually broken.)
 *
 * Containers handled (by instance selector):
 *   - Home "Latest Articles":   #grid-0001            → children .grid-item (skip .is-sidebar)
 *   - Home "Watch":             .caro.wide.feature    → children .caro-item (no image)
 *   - Home/listing magazine:    .row.has-prods.has-mags → children .grid-item (cover + title + CTA)
 *   - Listing article groups:   .row (per group)      → children .grid-item (skip rows that are just the subhead)
 *   - Magazine "More Inside":   .more-inside          → children .row
 *
 * Model (card): 2 columns per row — col 1 image (field:image), col 2 text (field:text).
 */
export default function parse(element, { document }) {
  const promoteImg = (img) => {
    if (!img) return null;
    const real = img.getAttribute('data-src-lg')
      || img.getAttribute('data-src')
      || img.getAttribute('data-src-xs')
      || img.getAttribute('data-flickity-lazyload');
    if (real && (!img.getAttribute('src') || /BackgroundGradLoad|blank|placeholder/i.test(img.getAttribute('src') || ''))) {
      img.setAttribute('src', real);
    }
    if (!img.getAttribute('src') || /BackgroundGradLoad|blank|placeholder/i.test(img.getAttribute('src') || '')) {
      return null;
    }
    // Clean alt text: source often contains literal markup like "<p>caption</p>".
    const alt = img.getAttribute('alt');
    if (alt) {
      const clean = alt.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      img.setAttribute('alt', clean);
    }
    // Strip lazy/placeholder attributes so only a clean <img src> survives.
    ['data-src-lg', 'data-src', 'data-src-xs', 'data-flickity-lazyload', 'width', 'height', 'class'].forEach((a) => img.removeAttribute(a));
    return img;
  };

  const cells = [];
  const consumed = [];

  const linkedHeading = (level, href, text) => {
    const h = document.createElement(level);
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = text;
      h.appendChild(a);
    } else {
      h.textContent = text;
    }
    return h;
  };

  const textPara = (text, href) => {
    const p = document.createElement('p');
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = text;
      p.appendChild(a);
    } else {
      p.textContent = text;
    }
    return p;
  };

  const pushCard = (img, textNodes) => {
    const kept = textNodes.filter((n) => n && n.textContent && n.textContent.trim());
    if (!img && !kept.length) return;
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }
    const textCell = document.createDocumentFragment();
    if (kept.length) {
      textCell.appendChild(document.createComment(' field:text '));
      kept.forEach((n) => textCell.appendChild(n));
    }
    cells.push([imageCell, textCell]);
  };

  // --- per-card extractors ---
  const articleCard = (item) => {
    const headingLink = item.querySelector('h3 a, h2 a');
    const heading = item.querySelector('h3, h2');
    const href = headingLink ? headingLink.getAttribute('href')
      : (item.querySelector('a.article-link') || {}).getAttribute
        ? item.querySelector('a.article-link').getAttribute('href') : null;
    const img = promoteImg(item.querySelector('img'));
    const tag = item.querySelector('a.tag, .tag.btn, a.article-tag');
    const desc = item.querySelector('p.clamp-me');
    const author = item.querySelector('p.author-name');
    const nodes = [];
    if (tag) nodes.push(textPara(tag.textContent.replace(/\s+/g, ' ').trim(), tag.getAttribute('href')));
    if (heading) {
      nodes.push(linkedHeading(
        heading.tagName.toLowerCase(),
        headingLink ? headingLink.getAttribute('href') : href,
        (headingLink || heading).textContent.replace(/\s+/g, ' ').trim(),
      ));
    }
    if (desc) nodes.push(textPara(desc.textContent.replace(/\s+/g, ' ').trim()));
    if (author) nodes.push(textPara(author.textContent.replace(/\s+/g, ' ').trim()));
    pushCard(img, nodes);
  };

  const magazineCard = (item) => {
    const mainLink = item.querySelector('a.main-link') || item.querySelector('a[href]');
    const href = mainLink ? mainLink.getAttribute('href') : null;
    const img = promoteImg(item.querySelector('img'));
    const title = item.querySelector('.content h3, h3, h6');
    const cta = item.querySelector('.content .btn, .btn.reverse, .mobile-links a.btn, a.btn');
    const nodes = [];
    if (title) nodes.push(linkedHeading('h3', href, title.textContent.replace(/\s+/g, ' ').trim()));
    if (cta) nodes.push(textPara(cta.textContent.replace(/\s+/g, ' ').trim(), href));
    pushCard(img, nodes);
  };

  const watchTile = (item) => {
    const titleLink = item.querySelector('h3 a, h2 a');
    const title = item.querySelector('h3, h2');
    const desc = item.querySelector('.content > p, p');
    const cta = item.querySelector('a.btn, a.reverse');
    const nodes = [];
    if (title) {
      nodes.push(linkedHeading(
        title.tagName.toLowerCase(),
        titleLink ? titleLink.getAttribute('href') : null,
        (titleLink || title).textContent.replace(/\s+/g, ' ').trim(),
      ));
    }
    if (desc) nodes.push(textPara(desc.textContent.replace(/\s+/g, ' ').trim()));
    if (cta) nodes.push(textPara(cta.textContent.replace(/\s+/g, ' ').trim(), cta.getAttribute('href')));
    pushCard(null, nodes);
  };

  const moreInsideRow = (row) => {
    const img = promoteImg(row.querySelector('img'));
    const heading = row.querySelector('h1, h2, h3, h4, h5');
    const desc = row.querySelector('p');
    const nodes = [];
    if (heading) nodes.push(heading.cloneNode(true));
    if (desc) nodes.push(desc.cloneNode(true));
    pushCard(img, nodes);
  };

  // --- dispatch by container type ---
  const isWatch = element.classList.contains('caro') || element.classList.contains('feature');
  const isMoreInside = element.classList.contains('more-inside');
  const isMagRow = element.classList.contains('has-prods') || element.classList.contains('has-mags')
    || /getmagazine|specialinterest/i.test(element.id || '');

  if (isMoreInside) {
    element.querySelectorAll(':scope > .row').forEach((row) => { moreInsideRow(row); consumed.push(row); });
  } else if (isWatch) {
    element.querySelectorAll('.caro-item').forEach((it) => { watchTile(it); consumed.push(it); });
  } else if (isMagRow) {
    element.querySelectorAll('.grid-item').forEach((it) => { magazineCard(it); consumed.push(it); });
  } else {
    // Article grids (home #grid-0001, listing group .row): iterate grid-items, skip sidebar/promo.
    const items = element.querySelectorAll(':scope > .grid-item, .grid-item');
    items.forEach((item) => {
      if (item.classList.contains('is-sidebar')) return;
      if (item.querySelector('.mini-promo, .is-fixed')) return;
      articleCard(item);
      consumed.push(item);
    });
  }

  if (!cells.length) {
    // Nothing to build (e.g. a listing group .row that is just a heading) — leave DOM untouched
    // so sibling parsers (section-title) can still process it.
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  // Insert the block where the first consumed card was, then remove only the consumed
  // cards — preserving siblings (group heading, sidebar hero/video) for other parsers.
  const anchor = consumed[0];
  if (anchor && anchor.parentNode) {
    anchor.parentNode.insertBefore(block, anchor);
    consumed.forEach((n) => { if (n.parentNode) n.remove(); });
  } else {
    element.replaceWith(block);
  }
}
