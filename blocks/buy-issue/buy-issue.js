export default function decorate(block) {
  const rows = [...block.children];
  const heading = rows[0];
  const icon = rows[1]?.querySelector('img');
  const subhead = rows[2];
  const label = rows[3];
  const links = [rows[4], rows[5]].map((r) => r?.querySelector('a')).filter(Boolean);

  block.textContent = '';

  const section = document.createElement('div');
  section.className = 'buy-issue-inner';

  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    section.append(h2);
  }

  const row = document.createElement('div');
  row.className = 'row middle-sm';

  const iconCol = document.createElement('div');
  iconCol.className = 'col-xs-4 col-sm has-icon';
  if (icon) iconCol.append(icon.cloneNode(true));
  row.append(iconCol);

  const textCol = document.createElement('div');
  textCol.className = 'col-xs-8 col-sm';
  if (subhead) {
    const h3 = document.createElement('h3');
    h3.append(...[...subhead.childNodes].map((n) => n.cloneNode(true)));
    textCol.append(h3);
  }
  if (label) {
    const span = document.createElement('span');
    span.className = 'hide-mobile';
    span.textContent = label.textContent.trim();
    textCol.append(span);
  }
  links.forEach((a) => {
    const link = a.cloneNode(true);
    link.style.paddingLeft = '20px';
    textCol.append(link);
  });
  row.append(textCol);

  section.append(row);
  block.append(section);
}
