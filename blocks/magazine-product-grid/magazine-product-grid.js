/**
 * Rows are classified by shape rather than fixed position: Crosswalk
 * renders the parent's own fields (heading, seeAll) before its child
 * item components, but authors can reorder blocks in Universal Editor,
 * so position alone isn't reliable.
 */
function classifyRow(row) {
  const cells = [...row.children];
  if (cells.length >= 3) return 'item';
  const link = row.querySelector('a');
  if (link && row.textContent.trim() === link.textContent.trim()) return 'seeAll';
  return 'heading';
}

export default function decorate(block) {
  const rows = [...block.children];
  let heading = '';
  let seeAllLink = null;
  const itemRows = [];

  rows.forEach((r) => {
    const kind = classifyRow(r);
    if (kind === 'item') itemRows.push(r);
    else if (kind === 'seeAll') seeAllLink = r.querySelector('a');
    else if (!heading) heading = r.textContent.trim();
  });

  block.textContent = '';

  const h2 = document.createElement('h2');
  h2.textContent = heading;
  block.append(h2);

  const row = document.createElement('div');
  row.className = 'row has-prods has-mags';

  itemRows.forEach((r) => {
    const cells = [...r.children];
    const img = cells[0]?.querySelector('img');
    const titleCell = cells[1];
    const titleLink = titleCell?.querySelector('a');
    const title = (titleLink || titleCell)?.textContent.trim() || '';
    const href = titleLink?.getAttribute('href') || '#';
    const btnLabel = cells[2]?.textContent.trim() || 'Subscribe';

    const item = document.createElement('div');
    item.className = 'col-xs-6 col-sm-3 grid-item';

    const a = document.createElement('a');
    a.className = 'main-link';
    a.target = '_blank';
    a.href = href;
    a.title = title;
    if (img) a.append(img.cloneNode(true));

    const content = document.createElement('div');
    content.className = 'content';
    const h3 = document.createElement('h3');
    h3.textContent = title;
    content.append(h3);
    const btn = document.createElement('span');
    btn.className = 'btn reverse';
    btn.textContent = btnLabel;
    content.append(btn);
    a.append(content);

    const mobileLinks = document.createElement('div');
    mobileLinks.className = 'mobile-links mobile-viewable';
    const h6 = document.createElement('h6');
    h6.textContent = title;
    mobileLinks.append(h6);
    const mobileBtn = document.createElement('a');
    mobileBtn.className = 'btn';
    mobileBtn.href = href;
    mobileBtn.textContent = btnLabel;
    mobileLinks.append(mobileBtn);

    item.append(a, mobileLinks);
    row.append(item);
  });

  block.append(row);

  if (seeAllLink) {
    const p = document.createElement('p');
    p.className = 'center padding-bottom';
    const seeAll = seeAllLink.cloneNode(true);
    seeAll.className = 'btn btn-full-width center';
    p.append(seeAll);
    block.append(p);
  }
}
