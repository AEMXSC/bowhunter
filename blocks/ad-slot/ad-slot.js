/**
 * Ad-serving in the source relies on a page-wide inline GPT/DFP config
 * script that defines every ad slot's size mapping at once — not
 * something a single decorator instance can reconstruct, and there's
 * no ad-network account to serve real creative anyway. This renders
 * the visual placeholder chrome only. See decisions.json (ad-adpos_*
 * entries) for the analysis.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const positionId = rows[0]?.textContent.trim() || 'adpos';

  block.textContent = '';
  block.classList.add('ad-wrapper', 'full-width');

  const label = document.createElement('div');
  label.className = 'advertisement-label';
  label.textContent = 'Advertisement';
  block.append(label);

  const slot = document.createElement('div');
  slot.id = positionId;
  slot.className = 'ad-slot-placeholder';
  block.append(slot);
}
