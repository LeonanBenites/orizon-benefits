(() => {
  'use strict';

  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  const header = document.querySelector('.site-header');
  const setMenu = (open, restoreFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.querySelector('main').inert = open;
    document.querySelector('footer').inert = open;
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => setMenu(menu.hidden));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  header.querySelector('.brand').addEventListener('click', () => setMenu(false));
  header.querySelector('.header-cta').addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') setMenu(false, true);
    if (event.key === 'Tab') {
      const focusable = [...header.querySelectorAll('a, button')].filter(el => el.getClientRects().length);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !header.contains(event.target)) setMenu(false, true);
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', event => {
    if (event.matches) setMenu(false);
  });

  // One shared, keyboard-accessible controller for all tab groups.
  document.querySelectorAll('[data-tabs]').forEach(group => {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    const panels = [...group.querySelectorAll('[role="tabpanel"]')];
    const activate = tab => {
      tabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        activate(tabs[next]);
        tabs[next].focus();
      });
    });
  });

  document.querySelectorAll('[data-interest]').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelector('#interesse').value = link.dataset.interest;
    });
  });

  const benefits = [...document.querySelectorAll('input[name="beneficios"]')];
  benefits.forEach(input => input.addEventListener('change', () => {
    if (!input.checked) return;
    benefits.forEach(other => {
      if (other !== input && (input.value === 'Nenhum atualmente' || other.value === 'Nenhum atualmente')) other.checked = false;
    });
  }));

  const form = document.querySelector('.contact-form');
  const status = form.querySelector('.form-status');
  const submit = form.querySelector('[type="submit"]');
  let sending = false;
  const clearError = input => {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    document.getElementById(`${input.id}-error`)?.remove();
  };
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', () => clearError(input));
    input.addEventListener('change', () => clearError(input));
  });
  const showError = (input, message) => {
    clearError(input);
    const error = document.createElement('span');
    error.className = 'field-error';
    error.id = `${input.id}-error`;
    error.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', error.id);
    input.after(error);
  };
  const showFailure = () => {
    status.className = 'form-status error';
    status.replaceChildren(document.createTextNode('Não foi possível confirmar o envio. Seus dados continuam no formulário. Tente novamente ou escreva para '));
    const link = document.createElement('a');
    link.href = 'mailto:comercial@orizonbenefits.com.br';
    link.textContent = 'comercial@orizonbenefits.com.br';
    status.append(link, document.createTextNode('.'));
    status.focus();
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    status.textContent = '';
    status.className = 'form-status';
    const required = [...form.querySelectorAll('[required]')];
    let firstInvalid;
    required.forEach(input => {
      clearError(input);
      input.value = input.value.trim();
      if (!input.checkValidity()) {
        showError(input, input.validity.valueMissing ? 'Preencha este campo para continuar.' : 'Informe um e-mail válido, como voce@empresa.com.br.');
        firstInvalid ||= input;
      }
    });
    if (firstInvalid) {
      status.className = 'form-status error';
      status.textContent = 'Revise os campos destacados antes de enviar.';
      firstInvalid.focus();
      return;
    }
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    payload.beneficios = data.getAll('beneficios');
    sending = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submit.querySelector('span').textContent = 'Enviando…';
    status.textContent = 'Estamos enviando sua solicitação.';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(window.ORIZON_FORM_ENDPOINT || '/api/contato', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('Unconfirmed submission');
      form.reset();
      form.querySelector('.extra-fields').open = false;
      status.className = 'form-status success';
      status.textContent = 'Solicitação recebida. Obrigado pelo contato! A equipe da Orizon retornará pelos dados que você informou.';
      status.focus();
    } catch {
      showFailure();
    } finally {
      window.clearTimeout(timeout);
      sending = false;
      submit.disabled = false;
      form.removeAttribute('aria-busy');
      submit.querySelector('span').textContent = 'Fale com a Orizon';
    }
  });

  document.querySelector('#year').textContent = new Date().getFullYear();
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = navLinks.find(item => item.hash === `#${entry.target.id}`);
        if (entry.isIntersecting) {
          navLinks.forEach(item => item.removeAttribute('aria-current'));
          link?.setAttribute('aria-current', 'location');
        } else { link?.removeAttribute('aria-current'); }
      });
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    navLinks.forEach(link => {
      const section = document.querySelector(link.hash);
      if (section) observer.observe(section);
    });
  }
})();
