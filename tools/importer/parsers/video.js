/* eslint-disable */
/* global WebImporter */

/**
 * Parser for video. Base: video.
 * Source (home): #MainContent_HomePageArticles_homepage_right_rail .is-fixed
 *   Featured-video module: "Featured Video" label, iframe player, video title (h3), "See All Videos" CTA.
 * Model (video): 1 column, up to 3 rows.
 *   Row 2 = video uri (field:uri) — a link to the video/stream URL.
 *   Row 3 = placeholder image (field:placeholder_image) — optional poster.
 * placeholder_imageAlt collapses into the <img alt> attribute.
 * Generated: 2026-08-26
 */
export default function parse(element, { document }) {
  const iframe = element.querySelector('iframe');
  // The real media URL lives in data-media-src; data-src holds the poster/thumbnail.
  const videoUrl = iframe
    ? (iframe.getAttribute('data-media-src') || iframe.getAttribute('src') || iframe.getAttribute('data-src'))
    : null;
  const posterUrl = iframe
    ? (iframe.getAttribute('data-src') || iframe.getAttribute('data-poster'))
    : null;

  const label = element.querySelector('h2');
  const title = element.querySelector('h3');
  const seeAll = element.querySelector('a.btn, a.full-gray, a[href*="video"]');
  const titleText = title ? title.textContent.replace(/\s+/g, ' ').trim() : '';

  const cells = [];

  // Row 2: video uri as a link. Its label carries the module heading + video title
  // + "See All" CTA so no source copy is lost (the video model has no dedicated
  // heading/CTA fields; author can refine after import).
  const uriCell = document.createDocumentFragment();
  if (videoUrl) {
    uriCell.appendChild(document.createComment(' field:uri '));
    const link = document.createElement('a');
    link.setAttribute('href', videoUrl);
    link.textContent = titleText || videoUrl;
    uriCell.appendChild(link);
    if (label && label.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = label.textContent.replace(/\s+/g, ' ').trim();
      uriCell.appendChild(p);
    }
    if (seeAll && seeAll.getAttribute('href')) {
      const cta = document.createElement('a');
      cta.setAttribute('href', seeAll.getAttribute('href'));
      cta.textContent = seeAll.textContent.replace(/\s+/g, ' ').trim();
      const p = document.createElement('p');
      p.appendChild(cta);
      uriCell.appendChild(p);
    }
  }

  // Row 3: placeholder / poster image.
  const posterCell = document.createDocumentFragment();
  if (posterUrl) {
    const img = document.createElement('img');
    img.setAttribute('src', posterUrl);
    img.setAttribute('alt', titleText);
    posterCell.appendChild(document.createComment(' field:placeholder_image '));
    posterCell.appendChild(img);
  }

  // Empty-block guard.
  if (!videoUrl && !posterUrl) {
    element.replaceWith(...element.childNodes);
    return;
  }

  cells.push([uriCell]);
  cells.push([posterCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'video', cells });
  element.replaceWith(block);
}
