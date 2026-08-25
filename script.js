
(() => {
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });

  items.forEach(el => observer.observe(el));

  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
  }
})();
