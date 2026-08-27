/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel. Base: carousel (a container rendering `carousel-item` slides).
 *
 * CONTAINER-based: receives the .caro.multi container and emits ONE block with one row per
 * slide (col 1 backgroundImage field:backgroundImage, col 2 content field:content). Each
 * slide = one linked logo image. One block per container makes it a single rotating strip
 * rather than N stacked blocks.
 *
 * Source (home/listing): section.has-logos.has-carousel .caro.multi → children .caro-item
 */
export default function parse(element, { document }) {
  const promoteImg = (img) => {
    if (!img) return null;
    const real = img.getAttribute('data-flickity-lazyload')
      || img.getAttribute('data-src')
      || img.getAttribute('data-src-lg');
    if (real && (!img.getAttribute('src') || /BackgroundGradLoad|blank|placeholder/i.test(img.getAttribute('src') || ''))) {
      img.setAttribute('src', real);
    }
    if (!img.getAttribute('src')) return null;
    const alt = img.getAttribute('alt');
    if (alt) img.setAttribute('alt', alt.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
    ['data-flickity-lazyload', 'data-src', 'data-src-lg', 'width', 'height', 'class'].forEach((a) => img.removeAttribute(a));
    return img;
  };

  const cells = [];

  const slides = element.classList.contains('caro-item')
    ? [element]
    : [...element.querySelectorAll('.caro-item')];

  slides.forEach((slide) => {
    const link = slide.querySelector('a[href]');
    const img = promoteImg(slide.querySelector('img'));
    const href = link ? link.getAttribute('href') : null;
    const label = link
      ? (link.getAttribute('aria-label') || (img && img.getAttribute('alt')) || '').trim()
      : ((img && img.getAttribute('alt')) || '').trim();
    if (!img && !href) return;

    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:backgroundImage '));
      imageCell.appendChild(img);
    }
    const contentCell = document.createDocumentFragment();
    if (href) {
      contentCell.appendChild(document.createComment(' field:content '));
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = label || href;
      const p = document.createElement('p');
      p.appendChild(a);
      contentCell.appendChild(p);
    }
    cells.push([imageCell, contentCell]);
  });

  if (!cells.length) {
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}

