(() => {
 const items=document.querySelectorAll('.reveal'); const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced){items.forEach(el=>el.classList.add('visible'));}else{const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');o.unobserve(e.target)}}),{threshold:.12});items.forEach(el=>o.observe(el));}
 const t=document.querySelector('.menu-toggle'),m=document.querySelector('.mobile-menu');if(t&&m){t.addEventListener('click',()=>{const x=m.classList.toggle('open');t.setAttribute('aria-expanded',String(x))});m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{m.classList.remove('open');t.setAttribute('aria-expanded','false')}));}
 const f=document.querySelector('.contact-form'); if(f){const s=f.querySelector('.form-status'),b=f.querySelector('.submit-btn');f.addEventListener('submit',async e=>{e.preventDefault();s.textContent='';s.className='form-status';f.querySelectorAll('.is-invalid').forEach(x=>x.classList.remove('is-invalid'));const inv=[...f.querySelectorAll('[required]')].filter(x=>!x.checkValidity());if(inv.length){inv.forEach(x=>x.classList.add('is-invalid'));inv[0].focus();s.textContent='Revise os campos obrigatórios antes de continuar.';s.classList.add('error');return}if(f.website&&f.website.value)return;const endpoint=window.ORIZON_FORM_ENDPOINT;if(!endpoint){s.textContent='Não foi possível enviar agora. Tente novamente em alguns instantes.';s.classList.add('error');return}const d=Object.fromEntries(new FormData(f).entries());delete d.website;d.origem='website';d.data_hora=new Date().toISOString();b.disabled=true;const old=b.innerHTML;b.textContent='Enviando…';try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});if(!r.ok)throw new Error();f.innerHTML='<div class="form-success"><span class="eyebrow">CONTATO RECEBIDO</span><h3>Recebemos suas informações.</h3><p>Obrigado pelo contato. A Orizon retornará pelos dados informados para dar continuidade à conversa.</p></div>'}catch(err){s.textContent='Não foi possível enviar agora. Tente novamente em alguns instantes.';s.classList.add('error');b.disabled=false;b.innerHTML=old}})}
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
