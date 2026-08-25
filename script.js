const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
menuBtn?.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') === 'true';
  menuBtn.setAttribute('aria-expanded', String(!open));
  mobileMenu.hidden = open;
});
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.hidden = true;
  menuBtn.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const form = document.getElementById('leadForm');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  form.querySelector('.form-status').textContent = 'Formulário demonstrativo. Integração com CRM/WhatsApp pode ser conectada na versão de produção.';
});


// Animação da linha dourada dos quatro pilares.
(() => {
  const journey = document.getElementById('jornadaOrizon');
  if (!journey) return;

  if (!('IntersectionObserver' in window)) {
    journey.classList.add('is-visible');
    return;
  }

  const observer = new IntersectionObserver(([entry], obs) => {
    if (entry.isIntersecting) {
      journey.classList.add('is-visible');
      obs.disconnect();
    }
  }, { threshold: 0.2 });

  observer.observe(journey);
})();
