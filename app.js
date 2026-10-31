'use strict';

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS & DOM UTILS
// -----------------------------------------------------------------------------

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const TAU = 2 * Math.PI;

const blue = '#254fd4';
const muted = '#778494';
const line = '#e2e7ef';
const red = '#bd5961';

const fmt = (n, d = 2) => Number(n).toLocaleString('pt-BR', { 
  minimumFractionDigits: d, 
  maximumFractionDigits: d 
});

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const listen = (id, event, fn) => $('#' + id).addEventListener(event, fn);

const read = (id, items) => { 
  $('#' + id).innerHTML = items
    .map(([k, v]) => `<div><small>${k}</small><strong>${v}</strong></div>`)
    .join('');
};

const out = (id, v) => $('#' + id + '-v').textContent = v;
const val = id => +$('#' + id).value;

// -----------------------------------------------------------------------------
// PROBABILITY / MATH DISTRIBUTION FUNCTIONS
// -----------------------------------------------------------------------------

function gauss() { 
  return Math.sqrt(-2 * Math.log(Math.random() || 1e-9)) * Math.cos(TAU * Math.random()); 
}

function poisson(m) { 
  let k = 0, p = 1, L = Math.exp(-m); 
  do { 
    k++; 
    p *= Math.random(); 
  } while (p > L); 
  return k - 1; 
}

// -----------------------------------------------------------------------------
// CANVAS & ANIMATION ENGINE
// -----------------------------------------------------------------------------

let animations = [];
let visible = new Set();

const observer = new IntersectionObserver(es => {
  es.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
}, { rootMargin: '100px' });

function animate(id, fn) { 
  let el = $('#' + id); 
  observer.observe(el); 
  animations.push({ el, fn }); 
}

function cv(id) { 
  let e = $('#' + id), 
      r = e.getBoundingClientRect(), 
      d = Math.min(devicePixelRatio || 1, 2), 
      w = r.width, 
      h = r.height; 
      
  if (e.width !== Math.round(w * d) || e.height !== Math.round(h * d)) { 
    e.width = Math.round(w * d); 
    e.height = Math.round(h * d); 
  } 
  
  let c = e.getContext('2d'); 
  c.setTransform(d, 0, 0, d, 0, 0); 
  c.clearRect(0, 0, w, h); 
  c.font = '11px Arial'; 
  return { c, w, h }; 
}

function text(c, t, x, y, col = muted, align = 'left') { 
  c.fillStyle = col; 
  c.textAlign = align; 
  c.textBaseline = 'middle'; 
  c.fillText(t, x, y); 
}

function path(c, points, col = blue, width = 1.5) { 
  c.beginPath(); 
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); 
  c.strokeStyle = col; 
  c.lineWidth = width; 
  c.stroke(); 
}

function dot(c, x, y, r = 5, col = blue) { 
  c.beginPath(); 
  c.arc(x, y, r, 0, TAU); 
  c.fillStyle = col; 
  c.fill(); 
}

let prev = performance.now();
function loop(t) { 
  let dt = Math.min((t - prev) / 1000, .05); 
  prev = t; 
  animations.forEach(a => { 
    if (visible.has(a.el)) a.fn(t / 1000, dt); 
  }); 
  requestAnimationFrame(loop); 
}
requestAnimationFrame(loop);

// -----------------------------------------------------------------------------
// NAVIGATION & INTERACTION LISTENERS
// -----------------------------------------------------------------------------

listen('menu', 'click', () => { 
  let open = $('#navlinks').classList.toggle('open'); 
  $('#menu').setAttribute('aria-expanded', open); 
});

$$('#navlinks a').forEach(a => a.onclick = () => { 
  $('#navlinks').classList.remove('open'); 
  $('#menu').setAttribute('aria-expanded', 'false'); 
});

window.addEventListener('scroll', () => { 
  $('#progress').style.width = 100 * scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight) + '%'; 
}, { passive: true });

const navObserver = new IntersectionObserver(es => {
  es.forEach(e => { 
    if (e.isIntersecting) { 
      let id = e.target.id, 
          key = ['porque', 'qubit', 'emaranhamento'].includes(id) ? 'porque' : 
                ['arquitetura', 'ion'].includes(id) ? 'arquitetura' : 
                ['prender', 'resfriar', 'controlar', 'acoplar', 'medir', 'escala'].includes(id) ? 'prender' : id; 
                
      $$('#navlinks a').forEach(a => { 
        let active = a.hash === '#' + key; 
        a.classList.toggle('active', active); 
        if (active) a.setAttribute('aria-current', 'location'); 
        else a.removeAttribute('aria-current'); 
      }); 
    } 
  });
}, { rootMargin: '-15% 0px -65% 0px' });

$$('section').forEach(s => navObserver.observe(s));

// -----------------------------------------------------------------------------
// EXPONENTIAL GROWTH SIMULATION
// -----------------------------------------------------------------------------

function exponential() { 
  let n = val('exn'), 
      bytes = 16 * 2 ** n, 
      u = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'], 
      i = 0; 
      
  while (bytes >= 1000 && i < u.length - 1) { 
    bytes /= 1000; 
    i++; 
  } 
  
  out('exn', n); 
  read('exread', [
    ['Amplitudes', `${fmt(2 ** n / 10 ** Math.floor(Math.log10(2 ** n)))} × 10<sup>${Math.floor(Math.log10(2 ** n))}</sup>`], 
    ['Memória do vetor', fmt(bytes) + ' ' + u[i]]
  ]); 
  
  let { c, w, h } = cv('exp'), 
      X = x => 50 + (w - 70) * x / 60, 
      Y = y => h - 35 - (h - 60) * y / 20;

  [0, 6, 12, 18].forEach((v, i) => { 
    path(c, [[50, Y(v)], [w - 15, Y(v)]], line, 1); 
    text(c, ['1 B', '1 MB', '1 TB', '1 EB'][i], 42, Y(v), muted, 'right'); 
  });

  [0, 20, 40, 60].forEach(v => text(c, v, X(v), h - 17)); 

  path(c, Array.from({ length: 61 }, (_, v) => [X(v), Y(Math.log10(16) + v * Math.log10(2))])); 
  dot(c, X(n), Y(Math.log10(16) + n * Math.log10(2))); 

  c.setLineDash([4, 4]); 
  let y = Y(Math.log10(16e9)); 
  path(c, [[50, y], [w - 15, y]], '#a3afc4', 1); 
  c.setLineDash([]); 
  text(c, '16 GB', w - 20, y - 10, muted, 'right'); 
}

listen('exn', 'input', exponential); 
new ResizeObserver(exponential).observe($('#exp')); 
exponential();

// -----------------------------------------------------------------------------
// QUBIT MEASUREMENT & SUPERPOSITION SIMULATION
// -----------------------------------------------------------------------------

let bit = 0, qmeasured = null; 

function qprepare() { 
  qmeasured = null; 
  $('#qucoin').textContent = '?'; 
  $('#qucoin').classList.add('spin'); 
  $('#qustatus').textContent = 'Preparado em superposição.'; 
} 

function qp() { 
  out('qp', val('qp') + '%'); 
  qprepare(); 
} 

listen('qp', 'input', qp); 
listen('bitflip', 'click', () => { 
  bit ^= 1; 
  $('#bit').textContent = bit; 
  $('#bitstatus').textContent = 'Estado definido: ' + bit + '.'; 
}); 

listen('bitread', 'click', () => $('#bitstatus').textContent = 'Leitura: ' + bit + '. O estado permanece igual.'); 

listen('qmeasure', 'click', () => { 
  if (qmeasured === null) qmeasured = Math.random() < val('qp') / 100 ? 0 : 1; 
  $('#qucoin').classList.remove('spin'); 
  $('#qucoin').textContent = qmeasured; 
  $('#qustatus').textContent = 'Resultado ' + qmeasured + '. Nova leitura repete este valor.'; 
}); 

listen('qreset', 'click', qprepare); 

function many(n) { 
  let n0 = 0; 
  for (let i = 0; i < n; i++) n0 += Math.random() < val('qp') / 100 ? 1 : 0; 

  [n0, n - n0].forEach((x, i) => { 
    $('#bar' + i).style.width = x / n * 100 + '%'; 
    $('#count' + i).textContent = x + ' · ' + fmt(x / n * 100, 0) + '%'; 
  }); 
} 

listen('qm100', 'click', () => many(100)); 
listen('qm1000', 'click', () => many(1000)); 
qp(); 
many(100);

// -----------------------------------------------------------------------------
// BELL STATES / ENTANGLEMENT SIMULATION
// -----------------------------------------------------------------------------

let bc = [0, 0, 0, 0]; 

function bell() { 
  let chi = val('chi') / 100 * Math.PI / 2, 
      p = Math.sin(chi) ** 2, 
      ent = p > 1e-12 && p < 1 - 1e-12 ? -p * Math.log2(p) - (1 - p) * Math.log2(1 - p) : 0; 
      
  out('chi', fmt(chi / Math.PI, 2) + 'π'); 
  $('#belleq').textContent = `${fmt(Math.cos(chi))}|00⟩ + i·${fmt(Math.sin(chi))}|11⟩`; 
  read('bellread', [
    ['P(00) / P(11)', fmt((1 - p) * 100, 0) + '% / ' + fmt(p * 100, 0) + '%'], 
    ['Entropia do par puro', fmt(ent) + ' ebit']
  ]); 
  $('#bellcounts').innerHTML = bc.map((n, i) => `<div><small>|${['00', '01', '10', '11'][i]}⟩</small>${n}</div>`).join(''); 
} 

function bellmany(n) { 
  let r = 0; 
  for (let i = 0; i < n; i++) { 
    r = Math.random() < Math.sin(val('chi') / 100 * Math.PI / 2) ** 2 ? 1 : 0; 
    bc[r ? 3 : 0]++; 
  } 
  $('#bellA').textContent = r; 
  $('#bellB').textContent = r; 
  bell(); 
} 

listen('chi', 'input', () => { 
  bc = [0, 0, 0, 0]; 
  bell(); 
}); 

listen('bellone', 'click', () => bellmany(1)); 
listen('bellmany', 'click', () => bellmany(1000)); 
listen('bellclear', 'click', () => { 
  bc = [0, 0, 0, 0]; 
  bell(); 
}); 
bell();

// -----------------------------------------------------------------------------
// HARDWARE MAPPING & PIPELINE UI
// -----------------------------------------------------------------------------

const mapping = [
  ['Memória', 'Níveis internos', 'Estados atômicos', 'Dois níveis internos de cada íon codificam o qubit; a armadilha mantém os íons no lugar.'], 
  ['Suporte', 'Armadilha de Paul', 'Laplace e RF', 'Campos oscilantes proporcionam confinamento dinâmico radial, enquanto eletrodos adicionais confinam axialmente.'], 
  ['Inicialização', 'Resfriar e preparar', 'Momento dos fótons', 'O resfriamento reduz o movimento; o bombeamento óptico prepara o estado interno.'], 
  ['Operações', 'Pulsos de controle', 'Acoplamento EM', 'Duração e fase dos pulsos determinam as rotações de um qubit.'], 
  ['Barramento', 'Modos coletivos', 'Lei de Coulomb', 'O movimento compartilhado permite mediar portas entre qubits.'], 
  ['Saída', 'Fluorescência', 'Absorção e emissão', 'A detecção de fótons distingue estados brilhantes de estados escuros.']
]; 

mapping.forEach((r, i) => { 
  let tr = document.createElement('tr'); 
  tr.dataset.pick = i; 
  tr.tabIndex = 0; 
  tr.innerHTML = r.slice(0, 3).map(t => '<td>' + t + '</td>').join(''); 
  
  const pick = () => { 
    $$('#mapping tr').forEach(t => t.classList.remove('selected')); 
    tr.classList.add('selected'); 
    $('#mapdetail').innerHTML = '<strong>' + r[0] + ' → ' + r[1] + '</strong><p>' + r[3] + '</p>'; 
  }; 

  tr.onclick = pick; 
  tr.onkeydown = e => { 
    if (['Enter', ' '].includes(e.key)) { 
      e.preventDefault(); 
      pick(); 
    } 
  }; 
  $('#mapping tbody').appendChild(tr); 
  if (!i) pick(); 
}); 

const pipe = [
  ['CPU clássica', 'Guarda o programa.'], 
  ['Controle', 'Emite pulsos de RF e laser.'], 
  ['QPU', 'Executa operações nos íons.'], 
  ['Detecção', 'Registra a fluorescência.'], 
  ['Estatística', 'Analisa resultados clássicos.']
]; 

$('#pipeline').innerHTML = pipe.map((s, i) => `<div><small>0${i + 1}</small><strong>${s[0]}</strong><p>${s[1]}</p></div>`).join(''); 

let cycle = false; 
listen('cycle', 'click', () => { 
  if (cycle) return; 
  cycle = true; 
  $('#cycle').disabled = true; 
  let i = 0; 
  function step() { 
    $$('#pipeline div').forEach((el, j) => el.classList.toggle('on', j === i)); 
    if (i++ < 5) {
      setTimeout(step, reduced ? 250 : 700); 
    } else { 
      cycle = false; 
      $('#cycle').disabled = false; 
    } 
  } 
  step(); 
});

// -----------------------------------------------------------------------------
// PAUL TRAP SIMULATION (RUNGE-KUTTA INTEGRATION)
// -----------------------------------------------------------------------------

let pt = 0, 
    ps = [1, .6, 0, 0], 
    ptrail = [], 
    ppause = reduced, 
    escaped = false; 

function paulreset() { 
  pt = 0; 
  ps = [1, .6, 0, 0]; 
  ptrail = []; 
  escaped = false; 
} 

listen('paulq', 'input', paulreset); 
listen('paulreset', 'click', paulreset); 
listen('paulpause', 'click', () => { 
  $('#paulpause').textContent = (ppause = !ppause) ? 'Continuar' : 'Pausar'; 
}); 

if (reduced) $('#paulpause').textContent = 'Continuar'; 

function deriv(t, s, q) { 
  let g = 2 * q * Math.cos(2 * t); 
  return [s[2], s[3], g * s[0], -g * s[1]]; 
} 

function integrate(h, q) { 
  let add = (s, k, a) => s.map((v, i) => v + k[i] * a), 
      a = deriv(pt, ps, q), 
      b = deriv(pt + h / 2, add(ps, a, h / 2), q), 
      c = deriv(pt + h / 2, add(ps, b, h / 2), q), 
      d = deriv(pt + h, add(ps, c, h), q); 
      
  ps = ps.map((v, i) => v + h / 6 * (a[i] + 2 * b[i] + 2 * c[i] + d[i])); 
  pt += h; 
}

animate('paul', (t, dt) => { 
  let q = val('paulq') / 100; 
  if (!ppause && !escaped) { 
    for (let i = 0; i < 8; i++) integrate(dt * 3 / 8, q); 
    ptrail.push(ps.slice(0, 2)); 
    if (ptrail.length > 240) ptrail.shift(); 
    if (Math.hypot(ps[0], ps[1]) > 6) escaped = true; 
  } 
  
  out('paulq', fmt(q)); 
  read('paulread', [
    ['Regime a = 0', q === 0 ? 'Sem confinamento' : q < .908 ? 'Região estável' : 'Região instável'], 
    ['Aproximação secular', q > 0 && q < .3 ? fmt(q * 20 / (2 * Math.SQRT2)) + ' MHz' : 'Aproximação de q pequeno']
  ]); 
  
  let { c, w, h } = cv('paul'), 
      s = Math.min(w / 7, h / 5), 
      P = (x, y, z) => [w / 2 + (x * .8 - y * .6) * s, h * .54 - (z * .85 + (x * .6 + y * .8) * .4) * s], 
      z = (x, y) => -.14 * Math.cos(2 * pt) * (x * x - y * y); 
      
  for (let i = -4; i <= 4; i++) { 
    let v = i * .55; 
    for (let axis = 0; axis < 2; axis++) {
      path(c, Array.from({ length: 31 }, (_, j) => { 
        let u = -2.2 + j * 4.4 / 30, 
            x = axis ? v : u, 
            y = axis ? u : v; 
        return P(x, y, z(x, y)); 
      }), i === 0 ? '#93a9df' : '#cbd6ec', 1); 
    }
  } 
  
  path(c, ptrail.map(([x, y]) => P(x, y, 0)), '#a6b4cd', 1); 
  if (!escaped) { 
    let x = ps[0], y = ps[1]; 
    dot(c, ...P(x, y, z(x, y)), 5, blue); 
  } 
  text(c, escaped ? 'Íon escapou · reinicie para tentar novamente' : 'RF: alternância desacelerada', 18, h - 19, escaped ? red : muted); 
});

// -----------------------------------------------------------------------------
// DOPPLER COOLING SIMULATION
// -----------------------------------------------------------------------------

let temp = 10; 

function dopupdate() { 
  out('delta', fmt(val('delta') / 100)); 
  $('#dopmsg').textContent = val('delta') < 0 ? 'Dessintonia vermelha: resfriamento até o equilíbrio.' : 
                             val('delta') === 0 ? 'Na ressonância: difusão sem atrito neste modelo.' : 
                             'Dessintonia azul: aquecimento.'; 
} 

listen('delta', 'input', dopupdate); 
listen('heat', 'click', () => temp = 12); 
dopupdate(); 

animate('doppler', (t, dt) => { 
  let d = val('delta') / 100, 
      eq = d < 0 ? (1 + 4 * d * d) / (4 * Math.abs(d)) : null; 
      
  if (!reduced) temp = eq ? temp + (eq - temp) * Math.min(1, dt * 1.5) : Math.min(45, temp + dt * 2); 
  
  let { c, w, h } = cv('doppler'), 
      L = 25, 
      B = h - 38, 
      X = x => L + (w - 2 * L) * (x + 10) / 20, 
      Y = p => B - p * (h - 70) * 3.5; 
      
  path(c, [[L, B], [w - L, B]], line, 1); 
  for (let i = -10; i < 10; i += .5) { 
    let p = Math.exp(-i * i / (2 * temp)) / Math.sqrt(TAU * temp); 
    c.fillStyle = '#93aceb'; 
    c.fillRect(X(i) + 1, Y(p), (w - 2 * L) / 40 - 2, B - Y(p)); 
  } 
  
  if (eq) { 
    c.setLineDash([4, 4]); 
    path(c, Array.from({ length: 100 }, (_, i) => { 
      let x = -10 + i * 20 / 99; 
      return [X(x), Y(Math.exp(-x * x / (2 * eq)) / Math.sqrt(TAU * eq))]; 
    }), blue, 1.5); 
    c.setLineDash([]); 
  } 
  
  text(c, '0', X(0), B + 14); 
  text(c, 'velocidade →', w - 20, h - 12, muted, 'right'); 
  read('dopread', [
    ['Temperatura ilustrativa', fmt(temp * .53) + ' mK'], 
    ['Equilíbrio ideal', eq ? fmt(eq * .53) + ' mK' : 'Sem equilíbrio']
  ]); 
});

// -----------------------------------------------------------------------------
// RABI OSCILLATIONS SIMULATION
// -----------------------------------------------------------------------------

function rabi() { 
  let t = val('rabit') / 100, 
      p = Math.sin(Math.PI * t) ** 2; 
      
  out('rabit', fmt(t)); 
  read('rabiread', [
    ['Ângulo de rotação', fmt(t * 2) + 'π'], 
    ['P(|1⟩)', fmt(p * 100, 1) + '%']
  ]); 
  
  let { c, w, h } = cv('rabi'), 
      X = x => 40 + (w - 60) * x / 2, 
      Y = y => h - 35 - (h - 65) * y;

  [0, .5, 1].forEach(v => { 
    path(c, [[40, Y(v)], [w - 20, Y(v)]], line, 1); 
    text(c, fmt(v, 1), 32, Y(v), muted, 'right'); 
  });

  [0, .5, 1, 1.5, 2].forEach(x => text(c, fmt(x, 1), X(x), h - 17, muted, 'center')); 

  path(c, Array.from({ length: 201 }, (_, i) => [X(i / 100), Y(Math.sin(Math.PI * i / 100) ** 2)])); 
  dot(c, X(t), Y(p)); 
  text(c, 'P(|1⟩)', 42, 15); 
  text(c, 't / TR', w - 20, 15, muted, 'right'); 
}

listen('rabit', 'input', rabi);
[['pi2', 25], ['pi', 50], ['twopi', 100]].forEach(([id, v]) => listen(id, 'click', () => { 
  $('#rabit').value = v; 
  rabi(); 
})); 
new ResizeObserver(rabi).observe($('#rabi')); 
rabi();

// -----------------------------------------------------------------------------
// BLOCH SPHERE INTERACTIVE SIMULATION
// (Correções de erros de quebra de linha do original incluídas)
// -----------------------------------------------------------------------------

let v = [0, 0, 1], yaw = -.6, pitch = .4; 

function angles() { 
  let th = val('theta') * Math.PI / 180, 
      ph = val('phi') * Math.PI / 180; 
  v = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)]; 
  blochinfo(); 
} 

function blochinfo() { 
  let th = Math.acos(clamp(v[2], -1, 1)), 
      ph = (Math.atan2(v[1], v[0]) + TAU) % TAU; 
      
  $('#theta').value = Math.round(th * 180 / Math.PI); 
  if (Math.sin(th) > 1e-6) {
    $('#phi').value = Math.round(ph * 180 / Math.PI); 
  }
  
  out('theta', val('theta') + '°'); 
  out('phi', val('phi') + '°'); 
  read('blochread', [
    ['P(0) / P(1)', fmt((1 + v[2]) * 50, 1) + '% / ' + fmt((1 - v[2]) * 50, 1) + '%'], 
    ['Vetor de Bloch', v.map(x => fmt(x)).join(' · ')], 
    ['Amplitude de |1⟩', fmt(Math.sin(th / 2), 3) + ' × eⁱᶲ']
  ]); 
} 

['theta', 'phi'].forEach(id => listen(id, 'input', angles));
['X', 'Y', 'Z', 'H', 'M', 'R'].forEach(g => listen('gate' + g, 'click', () => { 
  let [x, y, z] = v; 
  if (g === 'X') v = [x, -y, -z]; 
  if (g === 'Y') v = [-x, y, -z]; 
  if (g === 'Z') v = [-x, -y, z]; 
  if (g === 'H') v = [z, -y, x]; 
  if (g === 'R') v = [0, 0, 1]; 
  if (g === 'M') { 
    let r = Math.random() < (1 + z) / 2 ? 0 : 1; 
    v = [0, 0, r ? -1 : 1]; 
    $('#blochmsg').textContent = 'Resultado da medida: |' + r + '⟩. Uma nova leitura mantém esse resultado.'; 
  } else {
    $('#blochmsg').textContent = g === 'R' ? 'Estado preparado em |0⟩.' : 'Porta ' + g + ' aplicada ao estado.'; 
  }
  blochinfo(); 
})); 

const sphere = $('#bloch'); 
sphere.tabIndex = 0; 
sphere.style.touchAction = 'pan-y'; 
let drag = null; 

sphere.onpointerdown = e => { 
  drag = [e.clientX, e.clientY]; 
  sphere.setPointerCapture(e.pointerId); 
}; 

sphere.onpointermove = e => { 
  if (!drag) return; 
  yaw += (e.clientX - drag[0]) * .01; 
  if (e.pointerType !== 'touch') pitch = clamp(pitch + (e.clientY - drag[1]) * .01, -1.3, 1.3); 
  drag = [e.clientX, e.clientY]; 
}; 

sphere.onpointerup = sphere.onpointercancel = () => drag = null; 

sphere.onkeydown = e => { 
  if (e.key === 'ArrowLeft') yaw -= .1; 
  else if (e.key === 'ArrowRight') yaw += .1; 
  else if (e.key === 'ArrowUp') pitch += .08; 
  else if (e.key === 'ArrowDown') pitch -= .08; 
  else return; 
  e.preventDefault(); 
}; 

angles(); 

animate('bloch', () => { 
  let { c, w, h } = cv('bloch'), 
      R = Math.min(w * 0.32, h * 0.32), 
      cx = w / 2, 
      cy = h / 2; 

  const P = ([x, y, z]) => { 
    let xx = x * Math.cos(yaw) - y * Math.sin(yaw), 
        yy = x * Math.sin(yaw) + y * Math.cos(yaw); 
    return [cx + xx * R, cy - (z * Math.cos(pitch) + yy * Math.sin(pitch)) * R]; 
  }; 

  c.strokeStyle = '#c2cddd'; 
  c.lineWidth = 1; 
  c.beginPath(); 
  c.arc(cx, cy, R, 0, TAU); 
  c.stroke(); 

  for (let k = 0; k < 3; k++) { 
    c.setLineDash([3, 4]); 
    path(c, Array.from({ length: 100 }, (_, i) => { 
      let a = TAU * i / 99; 
      return P(k === 0 ? [Math.cos(a), Math.sin(a), 0] : k === 1 ? [Math.cos(a), 0, Math.sin(a)] : [0, Math.cos(a), Math.sin(a)]); 
    }), '#cbd4e2', 1); 
    c.setLineDash([]); 
  } 

  [[1, 0, 0, 'X'], [0, 1, 0, 'Y'], [0, 0, 1, '|0⟩'], [0, 0, -1, '|1⟩']].forEach(a => { 
    path(c, [P(a.slice(0, 3).map(x => -x)), P(a.slice(0, 3))], line, 1); 
    let p = P(a.slice(0, 3).map(x => x * 1.2)); 
    text(c, a[3], ...p, muted, 'center'); 
  }); 

  let p = P(v); 
  path(c, [[cx, cy], p], blue, 2.5); 
  dot(c, ...p, 5); 
  text(c, '|ψ⟩', p[0] + 12, p[1] - 12, blue); 
});

// -----------------------------------------------------------------------------
// PHONON MODES & EQUILIBRIUM SOLVER (GAUSSIAN & JACOBI)
// -----------------------------------------------------------------------------

function solve(A, b) { 
  let M = A.map((r, i) => r.concat(b[i])), 
      n = b.length; 
      
  for (let i = 0; i < n; i++) { 
    let p = i; 
    for (let r = i + 1; r < n; r++) {
      if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r; 
    }
    [M[i], M[p]] = [M[p], M[i]]; 
    
    for (let r = i + 1; r < n; r++) { 
      let m = M[r][i] / M[i][i]; 
      for (let k = i; k <= n; k++) M[r][k] -= m * M[i][k]; 
    } 
  } 

  let x = Array(n).fill(0); 
  for (let i = n - 1; i >= 0; i--) { 
    let s = M[i][n]; 
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j]; 
    x[i] = s / M[i][i]; 
  } 
  return x; 
} 

function hessian(u) { 
  return u.map((x, i) => u.map((y, j) => 
    i === j 
      ? 1 + u.reduce((s, z, k) => s + (k === i ? 0 : 2 / Math.abs(x - z) ** 3), 0) 
      : -2 / Math.abs(x - y) ** 3
  )); 
} 

function equilibrium(N) { 
  let sp = 2.018 * N ** (-.559), 
      u = Array.from({ length: N }, (_, i) => (i - (N - 1) / 2) * sp); 
      
  for (let k = 0; k < 250; k++) { 
    let g = u.map((x, i) => x - u.reduce((s, y, j) => s + (i === j ? 0 : Math.sign(x - y) / (x - y) ** 2), 0)); 
    if (Math.max(...g.map(Math.abs)) < 1e-11) break; 
    let d = solve(hessian(u), g); 
    u = u.map((x, i) => x - clamp(d[i], -.15, .15)); 
  } 
  return u; 
} 

function jacobi(A) { 
  let n = A.length, 
      V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => +(i === j))); 
      
  for (let it = 0; it < 100 * n * n; it++) { 
    let p = 0, q = 1; 
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(A[i][j]) > Math.abs(A[p][q])) { p = i; q = j; } 
      }
    }
    if (Math.abs(A[p][q]) < 1e-12) break; 
    
    let t = .5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]), 
        c = Math.cos(t), 
        s = Math.sin(t); 
        
    for (let k = 0; k < n; k++) { 
      let x = A[k][p], y = A[k][q]; 
      A[k][p] = c * x - s * y; 
      A[k][q] = s * x + c * y; 
    } 
    for (let k = 0; k < n; k++) { 
      let x = A[p][k], y = A[q][k]; 
      A[p][k] = c * x - s * y; 
      A[q][k] = s * x + c * y; 
    } 
    for (let k = 0; k < n; k++) { 
      let x = V[k][p], y = V[k][q]; 
      V[k][p] = c * x - s * y; 
      V[k][q] = s * x + c * y; 
    } 
  } 
  return Array.from({ length: n }, (_, i) => ({ 
    w: Math.sqrt(A[i][i]), 
    v: V.map(r => r[i]) 
  })).sort((a, b) => a.w - b.w); 
} 

let u = [], modes = [], clock = 0, mpause = reduced; 

function modebuild() { 
  let N = val('modeN'); 
  out('modeN', N); 
  u = equilibrium(N); 
  modes = jacobi(hessian(u)); 
  $('#modeK').innerHTML = modes.map((m, i) => 
    `<option value="${i}">${i === 0 ? 'Centro de massa' : i === 1 ? 'Respiração' : 'Modo ' + (i + 1)}</option>`
  ).join(''); 
  modeinfo(); 
} 

function modeinfo() { 
  let k = val('modeK'), m = modes[k]; 
  $('#modemsg').textContent = k === 0 ? 'Todos os íons se movem juntos.' : 
                              k === 1 ? 'Os íons se aproximam e se afastam do centro.' : 
                              'Deslocamentos coletivos com diferentes sinais e amplitudes.'; 
  read('moderead', [
    ['Frequência do modo', fmt(m.w, 3) + ' ωz'], 
    ['Todos os modos', modes.map(m => fmt(m.w)).join(' · ')]
  ]); 
} 

listen('modeN', 'input', modebuild); 
listen('modeK', 'change', modeinfo); 
listen('modepause', 'click', () => {
  $('#modepause').textContent = (mpause = !mpause) ? 'Continuar' : 'Pausar';
}); 

if (reduced) $('#modepause').textContent = 'Continuar'; 

modebuild(); 

animate('modes', (t, dt) => { 
  if (!mpause) clock += dt; 
  let { c, w, h } = cv('modes'), 
      N = u.length, 
      m = modes[val('modeK')], 
      X = x => 35 + (w - 70) * (x - u[0]) / (u[N - 1] - u[0]), 
      spacing = Math.min(...u.slice(1).map((x, i) => X(x) - X(u[i]))), 
      mx = Math.max(...m.v.map(Math.abs)), 
      xs = u.map((x, i) => X(x) + .28 * spacing * m.v[i] / mx * Math.cos(clock * m.w * TAU * 0.35)), 
      y = h * 0.43; 
      
  path(c, [[15, y], [w - 15, y]], line, 1); 
  path(c, xs.map(x => [x, y]), '#9bafd9', 1.5); 
  
  xs.forEach((x, i) => { 
    dot(c, x, y, 7); 
    text(c, i + 1, x, y + 24, muted, 'center'); 
    let a = m.v[i] / mx * 24; 
    c.fillStyle = a > 0 ? blue : '#9daecb'; 
    c.fillRect(X(u[i]) - 3, h * 0.50 - Math.max(0, a), 6, Math.abs(a)); 
  }); 

  path(c, [[15, h * 0.50], [w - 15, h * 0.50]], line, 1); 
  text(c, 'Forma relativa do modo', 20, h * 0.15); 
});

// -----------------------------------------------------------------------------
// MULTI-ION FLUORESCENCE MEASUREMENT
// -----------------------------------------------------------------------------

let states = [1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1], 
    measured = null, 
    photons = null, 
    measN = 0; 

function measurementrender() { 
  $('#measureions').innerHTML = ''; 
  states.forEach((s, i) => { 
    let col = document.createElement('div'); 
    col.className = 'ioncol'; 
    
    let b = document.createElement('button'); 
    b.textContent = ['|0⟩', '|1⟩', '|+⟩'][s]; 
    b.setAttribute('aria-label', 'Estado do íon ' + (i + 1) + ': ' + b.textContent); 
    b.onclick = () => { 
      states[i] = (states[i] + 1) % 3; 
      measured = null; 
      photons = null; 
      measurementrender(); 
    }; 
    col.appendChild(b); 
    
    let bead = document.createElement('div'); 
    bead.className = 'bead' + (measured && measured[i] ? ' bright' : ''); 
    col.appendChild(bead); 
    
    let small = document.createElement('small'); 
    small.textContent = photons ? photons[i] + ' γ' : i + 1; 
    col.appendChild(small); 
    
    $('#measureions').appendChild(col); 
  }); 

  read('measureread', [
    ['Bits detectados', measured ? measured.join(' ') : 'Aguardando leitura'], 
    ['Medições', measN]
  ]); 
} 

listen('detect', 'click', () => { 
  let actual = states.map(s => s === 2 ? +(Math.random() > .5) : s); 
  states = actual; 
  photons = actual.map(s => poisson(s ? 55 : 3)); 
  measured = photons.map(n => +(n >= 20)); 
  measN++; 
  $('#measuremsg').textContent = 'Os qubits foram projetados em estados definidos. Prepare novamente para repetir o experimento.'; 
  measurementrender(); 
}); 

listen('prepareall', 'click', () => { 
  states = states.map(() => 2); 
  measured = null; 
  photons = null; 
  measurementrender(); 
}); 

measurementrender();

// -----------------------------------------------------------------------------
// QCCD (QUANTUM CHARGE-COUPLED DEVICE) SIMULATION
// -----------------------------------------------------------------------------

let zone = 0, 
    positions = [.1, .21, .32], 
    selected = [.19, .3], 
    target = [.19, .3]; 

[0, 1, 2].forEach(z => listen('zone' + z, 'click', () => { 
  zone = z; 
  target = [[.19, .3], [.49, .59], [.8, .9]][z]; 
  [0, 1, 2].forEach(i => $('#zone' + i).classList.toggle('pri', i === z)); 
  $('#qccdmsg').textContent = [
    'Dois íons selecionados na zona de armazenamento.', 
    'Transporte para operação de dois qubits.', 
    'Transporte para detecção de fluorescência.'
  ][z]; 
})); 

animate('qccd', (t, dt) => { 
  selected = selected.map((x, i) => reduced ? target[i] : x + (target[i] - x) * Math.min(1, dt * 4)); 
  let { c, w, h } = cv('qccd'), 
      y = h * .54; 

  ['Armazenamento', 'Porta lógica', 'Leitura'].forEach((s, i) => { 
    let bounds = [0, .4, .7, 1]; 
    c.fillStyle = i === zone ? '#edf2fc' : '#f8fafc'; 
    c.fillRect(bounds[i] * w + 2, 0, (bounds[i + 1] - bounds[i]) * w - 4, h); 
    text(c, s, (bounds[i] + bounds[i + 1]) / 2 * w, 28, i === zone ? blue : muted, 'center'); 
  }); 

  for (let i = 0; i < 30; i++) { 
    c.fillStyle = '#d6dfed'; 
    c.fillRect(12 + i * (w - 24) / 30, y + 26, (w - 24) / 30 - 3, 10); 
  } 

  path(c, [[12, y], [w - 12, y]], line, 1); 
  [.07, ...selected].forEach((x, i) => dot(c, x * w, y, 7, i ? blue : '#92a3bf')); 

  if (zone === 1) { 
    selected.forEach(x => path(c, [[x * w, 50], [x * w, y - 10]], '#a0b5e9', 1.5)); 
  } 

  text(c, 'Eletrodos segmentados', 20, h - 20); 
});