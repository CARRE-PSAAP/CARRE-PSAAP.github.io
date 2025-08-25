document.addEventListener('DOMContentLoaded', () => {
  const form   = document.getElementById('navSearchForm');
  if (!form) return; // navbar not on this page

  const input  = form.querySelector('.search-input');
  const toggle = form.querySelector('.search-toggle');

  const open = () => {
    form.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    // delay focus until after class is applied so width animates cleanly
    requestAnimationFrame(() => input && input.focus());
  };
  const close = () => {
    form.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    input && input.blur();
  };

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    form.classList.contains('open') ? close() : open();
  });

  // close when clicking outside or pressing Esc
  document.addEventListener('click', (e) => { if (!form.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
});
