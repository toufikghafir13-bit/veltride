(() => {
  const grid = document.querySelector('main.grid');
  const toolbar = document.querySelector('.toolbar-inner');
  if (!grid || !toolbar) return;

  const cards = Array.from(grid.children).filter(card => card.classList.contains('card'));
  const available = cards.filter(card => card.querySelector('.add-cart'));
  const references = cards.filter(card => !card.querySelector('.add-cart'));

  const heading = document.createElement('div');
  heading.className = 'catalogue-heading';
  heading.innerHTML = `<div><h2>Available to order</h2><p>Select a vial size, then add it to your cart.</p></div><span class="catalogue-count">${available.length} products</span>`;
  grid.before(heading);

  const section = document.createElement('section');
  section.className = 'reference-section';
  section.setAttribute('aria-label', 'Additional research references');
  const intro = document.createElement('div');
  intro.className = 'reference-intro';
  intro.innerHTML = '<div><h2>Additional research references</h2><p>Information and documentation are available on request; these items are not currently in the cart.</p></div>';
  const referenceGrid = document.createElement('div');
  referenceGrid.className = 'reference-grid';
  references.forEach(card => referenceGrid.append(card));
  section.append(intro, referenceGrid);
  grid.after(section);

  const categories = [
    ['All compounds', 'all'],
    ['Metabolic', 'metabolic'],
    ['Peptide', 'peptide'],
    ['Biochemical', 'biochemical'],
    ['Other research', 'other']
  ];
  toolbar.replaceChildren();
  const buttons = categories.map(([label, value]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = label;
    button.dataset.filter = value;
    button.setAttribute('aria-pressed', String(value === 'all'));
    if (value === 'all') button.classList.add('active');
    toolbar.append(button);
    return button;
  });

  function categoryOf(card) {
    const label = (card.querySelector('.type')?.textContent || '').toLowerCase();
    if (label.includes('metabolic')) return 'metabolic';
    if (label.includes('biochemical')) return 'biochemical';
    if (label.includes('peptide') || label.includes('recovery') || label.includes('melanocortin')) return 'peptide';
    return 'other';
  }

  function show(filter) {
    let availableCount = 0;
    let referenceCount = 0;
    for (const card of available) {
      const visible = filter === 'all' || categoryOf(card) === filter;
      card.hidden = !visible;
      if (visible) availableCount++;
    }
    for (const card of references) {
      const visible = filter === 'all' || categoryOf(card) === filter;
      card.hidden = !visible;
      if (visible) referenceCount++;
    }
    grid.hidden = availableCount === 0;
    heading.hidden = availableCount === 0;
    section.hidden = referenceCount === 0;
    heading.querySelector('.catalogue-count').textContent = `${availableCount} ${availableCount === 1 ? 'product' : 'products'}`;
    for (const button of buttons) {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }

  toolbar.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (button) show(button.dataset.filter);
  });
  show('all');
})();

