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
  grid.className = 'row flex-grid video-grid-inner';

  cardRows.forEach((r) => {
    const cells = [...r.children];
    const img = cells[0]?.querySelector('img, picture');
    const category = cells[1]?.textContent.trim();
    const titleLink = cells[2]?.querySelector('a');
    const title = (titleLink || cells[2])?.textContent.trim() || '';
    const href = titleLink?.getAttribute('href') || '#';
    const excerpt = cells[3]?.textContent.trim();

    const item = document.createElement('div');
    item.className = 'grid-item col-xs-12 col-sm-4 col-md-3';
    const content = document.createElement('div');
    content.className = 'content';

    const linkWrap = document.createElement('a');
    linkWrap.className = 'article-link video';
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
    content.append(artContent);

    const hover = document.createElement('div');
    hover.className = 'article-hover';
    hover.setAttribute('aria-hidden', 'true');
    const hoverFree = document.createElement('div');
    hoverFree.className = 'hover-free';
    const hoverTop = document.createElement('div');
    hoverTop.className = 'hover-top';
    const playLink = document.createElement('a');
    playLink.href = href;
    playLink.className = 'video';
    playLink.innerHTML = '<span class="sr-only">Play</span><span class="icon-play-video"></span>';
    hoverTop.append(playLink);
    hoverFree.append(hoverTop);
    hover.append(hoverFree);
    if (category) {
      const strong = document.createElement('strong');
      strong.className = 'gray';
      strong.textContent = category;
      hover.append(strong);
    }
    const hoverH3 = document.createElement('h3');
    const hoverA = document.createElement('a');
    hoverA.href = href;
    hoverA.textContent = title;
    hoverH3.append(hoverA);
    hover.append(hoverH3);
    if (excerpt) {
      const p = document.createElement('p');
      p.textContent = excerpt;
      hover.append(p);
    }
    content.append(hover);

    item.append(content);
    grid.append(item);
  });

  block.append(grid);
}

