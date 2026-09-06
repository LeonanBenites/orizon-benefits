(() => {
 const items=document.querySelectorAll('.reveal'); const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced){items.forEach(el=>el.classList.add('visible'));}else{const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');o.unobserve(e.target)}}),{threshold:.12});items.forEach(el=>o.observe(el));}
 const t=document.querySelector('.menu-toggle'),m=document.querySelector('.mobile-menu');if(t&&m){t.addEventListener('click',()=>{const x=m.classList.toggle('open');t.setAttribute('aria-expanded',String(x))});m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{m.classList.remove('open');t.setAttribute('aria-expanded','false')}));}
 const f=document.querySelector('.contact-form'); if(f){const s=f.querySelector('.form-status'),b=f.querySelector('.submit-btn');f.addEventListener('submit',async e=>{e.preventDefault();s.textContent='';s.className='form-status';f.querySelectorAll('.is-invalid').forEach(x=>x.classList.remove('is-invalid'));const inv=[...f.querySelectorAll('[required]')].filter(x=>!x.checkValidity());if(inv.length){inv.forEach(x=>x.classList.add('is-invalid'));inv[0].focus();s.textContent='Revise os campos obrigatórios antes de continuar.';s.classList.add('error');return}if(f.website&&f.website.value)return;const endpoint=window.ORIZON_FORM_ENDPOINT||'/api/contato';const fd=new FormData(f);const d=Object.fromEntries(fd.entries());d.beneficios=fd.getAll('beneficios');delete d.website;d.origem='website';d.data_hora=new Date().toISOString();b.disabled=true;const old=b.innerHTML;b.textContent='Enviando…';try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});if(!r.ok)throw new Error();f.innerHTML='<div class="form-success"><span class="eyebrow">CONTATO RECEBIDO</span><h3>Recebemos suas informações.</h3><p>Obrigado pelo contato. A Orizon retornará pelos dados informados para dar continuidade à conversa.</p></div>'}catch(err){s.textContent='Não foi possível enviar agora. Tente novamente em alguns instantes.';s.classList.add('error');b.disabled=false;b.innerHTML=old}})}
})();

/* =========================================================
   ORIZON TESSERACT
   16 vértices / 32 arestas, rotação em planos 4D e projeção
   perspectiva 4D → 3D → 2D.
   ========================================================= */
(() => {
  const svg = document.getElementById('orizonTesseract');
  if (!svg) return;

  const edgesGroup = svg.querySelector('.tesseract-edges');
  const pointsGroup = svg.querySelector('.tesseract-points');
  const NS = 'http://www.w3.org/2000/svg';

  // 16 vértices do hipercubo.
  const vertices = [];
  for (const x of [-1, 1])
    for (const y of [-1, 1])
      for (const z of [-1, 1])
        for (const w of [-1, 1])
          vertices.push([x, y, z, w]);

  // Arestas ligam vértices que diferem em uma dimensão.
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      let diff = 0;
      for (let d = 0; d < 4; d++) {
        if (vertices[i][d] !== vertices[j][d]) diff++;
      }
      if (diff === 1) edges.push([i, j]);
    }
  }

  const edgeEls = edges.map(() => {
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('class', 'tesseract-edge');
    edgesGroup.appendChild(line);
    return line;
  });

  const pointEls = vertices.map(() => {
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('class', 'tesseract-point');
    pointsGroup.appendChild(circle);
    return circle;
  });

  function rotate4(v, a, b, angle) {
    const p = v.slice();
    const c = Math.cos(angle), s = Math.sin(angle);
    const va = p[a], vb = p[b];
    p[a] = c * va - s * vb;
    p[b] = s * va + c * vb;
    return p;
  }

  function rotate3(v, ax, ay) {
    let [x, y, z] = v;
    let c = Math.cos(ay), s = Math.sin(ay);
    [x, z] = [c*x + s*z, -s*x + c*z];
    c = Math.cos(ax); s = Math.sin(ax);
    [y, z] = [c*y - s*z, s*y + c*z];
    return [x, y, z];
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let start = performance.now();

  function render(now) {
    const t = reducedMotion ? 0.9 : (now - start) / 1000;

    const projected = vertices.map(v => {
      let p = rotate4(v, 0, 3, t * 0.55);
      p = rotate4(p, 1, 2, t * 0.37);
      p = rotate4(p, 0, 1, t * 0.16);

      // 4D -> 3D perspective
      const d4 = 3.65;
      const f4 = 1 / (d4 - p[3]);
      let q = [p[0] * f4 * 3.0, p[1] * f4 * 3.0, p[2] * f4 * 3.0];

      // Subtle 3D orientation, so it reads as a volumetric object.
      q = rotate3(q, -0.42, t * 0.16 + 0.55);

      // 3D -> 2D perspective
      const d3 = 5.2;
      const f3 = d3 / (d3 - q[2]);
      const scale = 86;
      return {
        x: 160 + q[0] * f3 * scale,
        y: 160 + q[1] * f3 * scale,
        z: q[2]
      };
    });

    const zVals = projected.map(p => p.z);
    const zMin = Math.min(...zVals);
    const zMax = Math.max(...zVals);
    const zRange = Math.max(0.001, zMax - zMin);

    // Depth-aware edge styling.
    edges.forEach(([a, b], idx) => {
      const pa = projected[a], pb = projected[b];
      const depth = (((pa.z + pb.z) / 2) - zMin) / zRange;
      const line = edgeEls[idx];
      line.setAttribute('x1', pa.x.toFixed(2));
      line.setAttribute('y1', pa.y.toFixed(2));
      line.setAttribute('x2', pb.x.toFixed(2));
      line.setAttribute('y2', pb.y.toFixed(2));
      line.setAttribute('stroke-width', (1.15 + depth * 1.65).toFixed(2));
      line.setAttribute('opacity', (0.34 + depth * 0.60).toFixed(2));
    });

    projected.forEach((p, idx) => {
      const depth = (p.z - zMin) / zRange;
      const c = pointEls[idx];
      c.setAttribute('cx', p.x.toFixed(2));
      c.setAttribute('cy', p.y.toFixed(2));
      c.setAttribute('r', (1.3 + depth * 1.8).toFixed(2));
      c.setAttribute('opacity', (0.45 + depth * 0.55).toFixed(2));
      c.setAttribute('stroke-width', (0.35 + depth * 0.45).toFixed(2));
    });

    if (!reducedMotion) requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();


/* =========================================================
   V16 — Intelligence pager
   ========================================================= */
(() => {
  const pager = document.querySelector('[data-intelligence-pager]');
  if (!pager) return;

  const track = pager.querySelector('.intel-track');
  const tabs = [...pager.querySelectorAll('.intel-tab')];
  const pages = [...pager.querySelectorAll('.intel-page')];
  const prev = pager.querySelector('.intel-prev');
  const next = pager.querySelector('.intel-next');
  const counter = pager.querySelector('.intel-counter b');
  const progress = pager.querySelector('.intel-progress i');
  const viewport = pager.querySelector('.intel-viewport');

  let current = 0;
  let timer = null;
  let paused = false;
  let pointerStartX = null;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render(index, userInitiated = false) {
    current = (index + pages.length) % pages.length;
    track.style.transform = `translateX(-${current * 20}%)`;

    tabs.forEach((tab, i) => {
      const active = i === current;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    pages.forEach((page, i) => page.classList.toggle('is-active', i === current));

    const referenceSteps = [...pager.querySelectorAll('.intel-reference-steps span')];
    referenceSteps.forEach((step, i) => step.classList.toggle('is-active', i === current));

    const currentNumber = String(current + 1).padStart(2, '0');
    if (counter) counter.textContent = currentNumber;
    pager.querySelectorAll('.intel-counter b').forEach(el => {
      el.textContent = currentNumber;
    });
    if (progress) progress.style.width = `${((current + 1) / pages.length) * 100}%`;

    const activeTab = tabs[current];

    // Nunca usar scrollIntoView() aqui: em autoplay isso pode deslocar
    // verticalmente a página inteira até a seção de Inteligência.
    // Quando a troca for iniciada pelo usuário, ajustamos apenas o scroll
    // horizontal do container de abas.
    if (userInitiated && activeTab) {
      const tabsRect = activeTab.parentElement.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      const delta = (tabRect.left + tabRect.width / 2) - (tabsRect.left + tabsRect.width / 2);

      activeTab.parentElement.scrollBy({
        left: delta,
        behavior: 'smooth'
      });
    }

    // Navegação exclusivamente manual: não reinicia autoplay.
  }

  function advance() {
    if (!paused) render(current + 1);
  }

  function start() {
    if (reducedMotion) return;
    stop();
    timer = setInterval(advance, 8000);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function restart() {
    stop();
    start();
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => render(i, true)));
  prev?.addEventListener('click', () => render(current - 1, true));
  next?.addEventListener('click', () => render(current + 1, true));

  pager.addEventListener('mouseenter', () => { paused = true; });
  pager.addEventListener('mouseleave', () => { paused = false; });
  pager.addEventListener('focusin', () => { paused = true; });
  pager.addEventListener('focusout', () => { paused = false; });

  viewport?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); render(current + 1, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); render(current - 1, true); }
  });

  viewport?.addEventListener('pointerdown', (e) => {
    pointerStartX = e.clientX;
  });

  viewport?.addEventListener('pointerup', (e) => {
    if (pointerStartX == null) return;
    const delta = e.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(delta) < 40) return;
    render(current + (delta < 0 ? 1 : -1), true);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });

  render(0);
  // Sinistralidade permanece fixa até interação manual do usuário.
})();


/* V18 — safeguard: pager autoplay must not move document scroll */
(() => {
  const pager = document.querySelector('[data-intelligence-pager]');
  if (!pager) return;

  // Prevent accidental browser scroll restoration from focus changes
  // inside automated pager transitions.
  pager.querySelectorAll('.intel-tab, .intel-arrow').forEach(el => {
    el.addEventListener('mousedown', (e) => {
      // user interaction remains normal; no programmatic focus is triggered
    }, {passive:true});
  });
})();



/* =========================================================
   Header anchors — alinhamento real do conteúdo
   Evita o grande espaço vazio causado pelo padding superior
   das sections quando a navegação usa #âncoras.
   ========================================================= */
(() => {
  const header = document.querySelector('header');
  const headerLinks = document.querySelectorAll('header a[href^="#"]');

  if (!headerLinks.length) return;

  const getHeaderOffset = () => {
    if (!header) return 24;
    const rect = header.getBoundingClientRect();
    return Math.max(rect.height, 0) + 20;
  };

  const getVisualAnchor = (target) => {
    if (!target) return null;

    // "Serviços Complementares" tem padding próprio dentro do container,
    // então o container não representa o início visual do conteúdo.
    // Alinhamos diretamente pelo cabeçalho real da seção.
    if (target.id === 'complementares') {
      return target.querySelector('.health-orbit-header, .eyebrow, h2') || target;
    }

    // Demais seções: usa o primeiro bloco real de conteúdo.
    const preferred = target.querySelector(
      ':scope > .container, :scope > [class*="container"], .container, header, .section-head, .section-header'
    );

    return preferred || target;
  };

  const scrollToSection = (id, updateHash = true) => {
    const target = document.getElementById(id);
    if (!target) return;

    const anchor = getVisualAnchor(target);
    const top = window.scrollY + anchor.getBoundingClientRect().top - getHeaderOffset();

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth'
    });

    if (updateHash) {
      history.pushState(null, '', `#${id}`);
    }
  };

  headerLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const id = decodeURIComponent(href.slice(1));
      if (!document.getElementById(id)) return;

      event.preventDefault();
      scrollToSection(id, true);
    });
  });

  // Se a página for aberta já com uma âncora, aplica o mesmo alinhamento.
  window.addEventListener('load', () => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    if (!document.getElementById(id)) return;

    setTimeout(() => scrollToSection(id, false), 50);
  });
})();

// Programas de Gestão em Saúde — navegação editorial
(() => {
  const explorer = document.querySelector('[data-programs]');
  if (!explorer) return;
  const tabs = [...explorer.querySelectorAll('.program-tab')];
  const panels = [...explorer.querySelectorAll('.program-panel')];
  tabs.forEach(tab => tab.addEventListener('click', () => {
    const key = tab.dataset.program;
    tabs.forEach(t => { const active=t===tab; t.classList.toggle('is-active',active); t.setAttribute('aria-selected', active ? 'true' : 'false'); });
    panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.panel===key));
    if (window.innerWidth <= 760) explorer.querySelector('.program-detail')?.scrollIntoView({behavior:'smooth',block:'nearest'});
  }));
})();

// Soluções Complementares — navegação compacta
(() => {
  const explorer = document.querySelector('[data-complementary]');
  if (!explorer) return;
  const tabs = [...explorer.querySelectorAll('.complementary-tab')];
  const panels = [...explorer.querySelectorAll('.complementary-panel')];
  tabs.forEach(tab => tab.addEventListener('click', () => {
    const key = tab.dataset.complementaryKey;
    tabs.forEach(t => { const active = t === tab; t.classList.toggle('is-active', active); t.setAttribute('aria-selected', active ? 'true' : 'false'); });
    panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.complementaryPanel === key));
    if (window.innerWidth <= 760) explorer.querySelector('.complementary-detail')?.scrollIntoView({behavior:'smooth', block:'nearest'});
  }));
})();

/* Operations journey — contextual detail without leaving the section */
(() => {
  const root = document.querySelector('[data-operations-journey]');
  if (!root) return;
  const detail = root.querySelector('.operation-detail');
  const buttons = [...root.querySelectorAll('.operation-step')];
  const content = {
    cadastro:{kicker:'01 · CADASTRO & MOVIMENTAÇÕES',title:'Uma base correta é o primeiro passo para uma operação que funciona.',text:'Inclusões, exclusões, alterações e acompanhamento da base de beneficiários, com organização dos movimentos e atenção aos prazos de cada operadora.',tags:['Inclusões','Exclusões','Alterações','Elegibilidade']},
    atendimento:{kicker:'02 · ATENDIMENTO',title:'O benefício precisa funcionar também quando o colaborador precisa dele.',text:'Apoio à jornada do colaborador em demandas relacionadas ao benefício, organizando solicitações, orientações e encaminhamentos ao longo do atendimento.',tags:['Orientação','Solicitações','Acompanhamento','Experiência']},
    conciliacao:{kicker:'03 · CONCILIAÇÃO CADASTRAL',title:'Divergências pequenas na base podem se transformar em problemas grandes na operação.',text:'Confronto entre bases disponibilizadas pela empresa e registros das operadoras para identificação de inconsistências, diferenças cadastrais e necessidades de regularização.',tags:['Bases','Divergências','Validação','Regularização']},
    faturamento:{kicker:'04 · CONFERÊNCIA DE FATURAMENTO',title:'Conferir a cobrança é entender o que está por trás de cada valor.',text:'Análise das informações cadastrais, financeiras e contratuais relacionadas à cobrança, apoiando a identificação de divergências e pontos que demandem esclarecimento.',tags:['Faturas','Cadastro','Contrato','Divergências']},
    rede:{kicker:'05 · REDE',title:'A rede assistencial faz parte da experiência real do benefício.',text:'Leitura das informações disponíveis sobre rede e utilização para apoiar demandas de acesso, contexto assistencial e necessidades específicas da população atendida.',tags:['Rede credenciada','Acesso','Utilização','Contexto']},
    operadoras:{kicker:'06 · INTERLOCUÇÃO COM OPERADORAS',title:'Quando a situação exige articulação, a Orizon ajuda a conectar as partes certas.',text:'Acompanhamento de situações que demandem interação entre empresa, beneficiário e operadora, com organização das informações e condução dos pontos necessários para evolução da demanda.',tags:['Articulação','Operadoras','Acompanhamento','Resolução']}
  };
  function activate(btn){
    const item=content[btn.dataset.operation]; if(!item) return;
    buttons.forEach(b=>{const active=b===btn;b.classList.toggle('is-active',active);b.setAttribute('aria-selected',String(active));});
    detail.classList.add('is-switching');
    window.setTimeout(()=>{
      detail.querySelector('.operation-detail-kicker').textContent=item.kicker;
      detail.querySelector('h3').textContent=item.title;
      detail.querySelector('p').textContent=item.text;
      detail.querySelector('.operation-detail-tags').innerHTML=item.tags.map(t=>`<span>${t}</span>`).join('');
      detail.classList.remove('is-switching');
    },120);
  }
  buttons.forEach(btn=>{
    btn.addEventListener('click',()=>activate(btn));
    btn.addEventListener('mouseenter',()=>{if(window.matchMedia('(hover:hover)').matches) activate(btn)});
    btn.addEventListener('keydown',e=>{
      const i=buttons.indexOf(btn); let next=null;
      if(e.key==='ArrowRight'||e.key==='ArrowDown') next=buttons[(i+1)%buttons.length];
      if(e.key==='ArrowLeft'||e.key==='ArrowUp') next=buttons[(i-1+buttons.length)%buttons.length];
      if(next){e.preventDefault();next.focus();activate(next)}
    });
  });
})();

/* =========================================================
   Contact — compact multi-select for current benefits
   ========================================================= */
(() => {
  const fieldset = document.querySelector('.benefits-multiselect');
  if (!fieldset) return;
  const trigger = fieldset.querySelector('.benefits-trigger');
  const menu = fieldset.querySelector('.benefits-menu');
  const text = fieldset.querySelector('.benefits-trigger-text');
  const checks = [...fieldset.querySelectorAll('input[name="beneficios"]')];
  const none = checks.find(c => c.value === 'Nenhum atualmente');

  const render = () => {
    const selected = checks.filter(c => c.checked).map(c => c.value);
    if (!selected.length) text.textContent = 'Selecione os benefícios';
    else if (selected.length <= 2) text.textContent = selected.join(' · ');
    else text.textContent = `${selected.length} benefícios selecionados`;
  };

  const setOpen = open => {
    trigger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };

  trigger.addEventListener('click', () => setOpen(trigger.getAttribute('aria-expanded') !== 'true'));

  checks.forEach(check => check.addEventListener('change', () => {
    if (check === none && check.checked) {
      checks.forEach(c => { if (c !== none) c.checked = false; });
    } else if (check !== none && check.checked && none) {
      none.checked = false;
    }
    render();
  }));

  document.addEventListener('click', e => {
    if (!fieldset.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { setOpen(false); trigger.focus(); }
  });
  render();
})();

/* =========================================================
   BENEFÍCIOS — accordion compacto no touch/mobile
   ========================================================= */
(() => {
  const grid = document.querySelector('.benefits-interactive');
  if (!grid) return;
  const items = [...grid.querySelectorAll('.benefit-item')];
  items.forEach(item => {
    const btn = item.querySelector('.benefit-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      items.forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.benefit-toggle')?.setAttribute('aria-expanded','false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded','true');
      }
    });
  });
})();

/* Benefits — accordion compacto no touch/mobile */
(() => {
  const grid = document.querySelector('.benefits-interactive');
  if (!grid) return;
  const items = [...grid.querySelectorAll('.benefit-item')];
  items.forEach(item => {
    const btn = item.querySelector('.benefit-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      items.forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.benefit-toggle')?.setAttribute('aria-expanded','false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded','true');
      }
    });
  });
})();
