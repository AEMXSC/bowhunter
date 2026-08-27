/**
 * The source sidebar widget (current-issue preview + a randomly-picked
 * featured video) is CMS-randomized, not a fixed content shape — baked
 * in as static chrome from the capture snapshot rather than authored.
 * See snowflake decisions.json / notes.md for the analysis.
 */
function buildSidebar() {
  const aside = document.createElement('div');
  aside.className = 'grid-item is-sidebar home-sidebar-video';
  aside.innerHTML = `
    <div class="row mini-promo hidden-sm">
      <div class="col-xs-5 col-sm-5 col-md-5 col-lg-5 has-img">
        <a aria-hidden="true" href="https://www.bowhunter.com/magazine/bowhunter-current-issue/451705">
          <img src="https://content.osgnetworks.tv/bowhunter/content/current-issue/bh_cover.png?dt=20260809" alt="Preview This Month's Issue" />
        </a>
      </div>
      <div class="col-xs-5 col-sm-5 col-md-5 col-lg-5 has-head">
        <a href="https://www.bowhunter.com/magazine/bowhunter-current-issue/451705">
          <span><strong>Preview This<br>Month's Issue</strong></span>
        </a>
        <span class="is-date">July / August 2026</span>
      </div>
      <div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 has-cta center">
        <a href="https://www.bowhunter.com/magazine/bowhunter-current-issue/451705" class="btn-arrow">
          <span class="icon-arrow-right" aria-hidden="true"></span>
        </a>
      </div>
    </div>
    <div class="is-fixed">
      <h2>Featured Video</h2>
      <h3>Browning Pro Scout Max with AI Technology</h3>
      <a href="https://www.bowhunter.com/listing/video/videos-most-recent/384246" class="btn full-gray">See All Videos</a>
    </div>
  `;
  return aside;
}

export default function decorate(block) {
  const rows = [...block.children];
  const headingRow = rows[0];
  const cardRows = rows.slice(1);
  const heading = headingRow?.textContent.trim() || '';

  block.textContent = '';

  const h2 = document.createElement('h2');
  h2.textContent = heading;
  block.append(h2);

  const grid = document.createElement('div');
  grid.className = 'grid default-grid four-wide has-offset has-sidebar latest-articles';
  grid.append(buildSidebar());

  cardRows.forEach((r) => {
    const cells = [...r.children];
    const img = cells[0]?.querySelector('img, picture');
    const category = cells[1]?.textContent.trim();
    const titleLink = cells[2]?.querySelector('a');
    const title = (titleLink || cells[2])?.textContent.trim() || '';
    const href = titleLink?.getAttribute('href') || '#';
    const author = cells[3]?.textContent.trim();

    const item = document.createElement('div');
    item.className = 'grid-item';
    const content = document.createElement('div');
    content.className = 'content';

    const linkWrap = document.createElement('a');
    linkWrap.className = 'article-link';
    linkWrap.href = href;
    if (img) linkWrap.append(img.cloneNode(true));
    content.append(linkWrap);

    const artContent = document.createElement('div');
    artContent.className = 'article-content';
    if (category) {
      const tag = document.createElement('a');
      tag.className = 'tag btn';
      tag.href = href;
      tag.textContent = category;
      artContent.append(tag);
    }
    const h3 = document.createElement('h3');
    const titleA = document.createElement('a');
    titleA.href = href;
    titleA.textContent = title;
    h3.append(titleA);
    artContent.append(h3);
    if (author) {
      const p = document.createElement('p');
      p.className = 'author-name';
      p.textContent = author;
      artContent.append(p);
    }
    content.append(artContent);
    item.append(content);
    grid.append(item);
  });

  block.append(grid);
}

