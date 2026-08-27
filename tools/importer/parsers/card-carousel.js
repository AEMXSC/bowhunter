/* eslint-disable */
/* global WebImporter */

/**
 * Parser for card-carousel. Base: card-carousel (a container rendering a strip of `card` items).
 *
 * CONTAINER-based: receives the .video-grid container and emits ONE block with one row per
 * video card (col 1 image field:image, col 2 text field:text). Each card = thumbnail +
 * category tag + linked video title (+ hover-overlay description). Emitting one block per
 * container is what makes it render as a single strip rather than N stacked blocks.
 *
 * Source (home): .video-grid  → children .grid-item
 */
export default function parse(element, { document }) {
  const promoteImg = (img) => {
    if (!img) return null;
    const real = img.getAttribute('data-src')
      || img.getAttribute('data-src-lg')
      || img.getAttribute('data-src-xs')
      || img.getAttribute('data-flickity-lazyload');
    if (real && (!img.getAttribute('src') || /BackgroundGradLoad|blank|placeholder/i.test(img.getAttribute('src') || ''))) {
      img.setAttribute('src', real);
    }
    if (!img.getAttribute('src') || /BackgroundGradLoad|blank|placeholder/i.test(img.getAttribute('src') || '')) {
      return null;
    }
    const alt = img.getAttribute('alt');
    if (alt) img.setAttribute('alt', alt.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
    ['data-src-lg', 'data-src', 'data-src-xs', 'data-flickity-lazyload', 'width', 'height', 'class'].forEach((a) => img.removeAttribute(a));
    return img;
  };

  const cells = [];

  // A card-carousel instance may itself be a single grid-item (legacy selector) or the
  // whole .video-grid container. Normalize to a list of card items.
  const items = element.classList.contains('grid-item')
    ? [element]
    : [...element.querySelectorAll('.grid-item')];

  items.forEach((item) => {
    const primary = item.querySelector(':scope > .content') || item;
    const img = promoteImg(primary.querySelector('.article-link img, img'));
    const tag = primary.querySelector('a.tag, .tag.btn');
    const headingLink = primary.querySelector('.article-content h3 a, h3 a, h2 a');
    const heading = primary.querySelector('.article-content h3, h3, h2');
    const videoHref = headingLink
      ? headingLink.getAttribute('href')
      : ((primary.querySelector('a.article-link') || {}).getAttribute
        ? primary.querySelector('a.article-link').getAttribute('href') : null);

    const textNodes = [];
    if (tag) {
      const p = document.createElement('p');
      if (tag.getAttribute('href')) {
        const a = document.createElement('a');
        a.setAttribute('href', tag.getAttribute('href'));
        a.textContent = tag.textContent.replace(/\s+/g, ' ').trim();
        p.appendChild(a);
      } else {
        p.textContent = tag.textContent.replace(/\s+/g, ' ').trim();
      }
      textNodes.push(p);
    }
    if (heading) {
      const h = document.createElement(heading.tagName.toLowerCase());
      if (videoHref) {
        const a = document.createElement('a');
        a.setAttribute('href', videoHref);
        a.textContent = (headingLink || heading).textContent.replace(/\s+/g, ' ').trim();
        h.appendChild(a);
      } else {
        h.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
      }
      textNodes.push(h);
    }
    const desc = item.querySelector('.article-hover p, .hover-free p');
    if (desc && desc.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.replace(/\s+/g, ' ').trim();
      textNodes.push(p);
    }

    if (!img && !textNodes.length) return;
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }
    const textCell = document.createDocumentFragment();
    if (textNodes.length) {
      textCell.appendChild(document.createComment(' field:text '));
      textNodes.forEach((n) => textCell.appendChild(n));
    }
    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'card-carousel', cells });
  element.replaceWith(block);
}

