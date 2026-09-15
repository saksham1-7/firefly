const field = document.querySelector('.firefly-field');
const swarmStatus = document.querySelector('.swarm-status');

const socket = io();

const fireflies = new Map();

let myCharge = 0;
let myPeriod = 2.5 + Math.random() * 1.0;

let couplingBoost = 0.1;

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

function createDot(id,x,y,isMine) {
      const dot = document.createElement('div');
  dot.className = 'firefly';
  if (isMine) dot.classList.add('my-firefly');
  dot.style.setProperty('--x', `${x}%`);
  dot.style.setProperty('--y', `${y}%`);
  dot.style.setProperty('--hue', Math.floor(40 + Math.random() * 30));
  dot.style.setProperty('--size', '10px');
  dot.style.opacity = '0.15';
  field.appendChild(dot);
  fireflies.set(id, { dot, isMine, fadeTimeout: null });
}

function flash(f) {
  // Cancel any fade-out still pending from a previous flash on this same
  // dot, so two flashes close together can't race each other and leave
  // the dot stuck at the wrong brightness.
  clearTimeout(f.fadeTimeout);

  f.dot.style.transition = prefersReducedMotion
    ? 'none'
    : 'opacity 120ms ease-out';
  f.dot.style.opacity = '1';

  f.fadeTimeout = setTimeout(() => {
    f.dot.style.transition = prefersReducedMotion
      ? 'none'
      : 'opacity 900ms ease-in';
    f.dot.style.opacity = '0.15';
  }, 120);
}

function updateStatus() {
  swarmStatus.textContent = `${fireflies.size} firefl${
    fireflies.size === 1 ? 'y' : 'ies'
  } here.`;
}

socket.on('connect', () => {
  console.log('CONNECTED:', socket.id);
});

socket.on('firefly:roster', (roster) => {
  for (const [id, data] of Object.entries(roster)) {
    if (fireflies.has(id)) continue;
    createDot(id, data.x, data.y, id === socket.id);
  }
  updateStatus();
});


socket.on('firefly:joined', ({ id, x, y }) => {
  if (fireflies.has(id)) return;
  createDot(id, x, y, false);
  updateStatus();
});

socket.on('firefly:fired', (id) => {
  console.log('RECEIVED FIRE FROM:', id, 'MY ID:', socket.id);
  const f = fireflies.get(id);
  if (!f) return;

  flash(f);

  // Only respond if you're already reasonably far into your own cycle.
  // Without this gate, a firefly that just fired gets yanked by every
  // ambient flash around it — noisy, and a known runaway-feedback risk
  // in this exact model. This also makes convergence read as clean
  // bursts instead of constant small jitter.
  if (myCharge > 0.3) {
    myCharge += couplingBoost;
  }
});

socket.on('fireflies:scattered', (roster) => {
    for (const [id, data] of Object.entries(roster)) {
        const f = fireflies.get(id);

        if (!f) continue;

        f.dot.style.setProperty('--x', `${data.x}%`);
        f.dot.style.setProperty('--y', `${data.y}%`);
    }
});

socket.on('userDisconnected', (id) => {
  const f = fireflies.get(id);
  if (!f) return;
  clearTimeout(f.fadeTimeout);
  f.dot.remove();
  fireflies.delete(id);
  updateStatus();
});

let lastTime = performance.now();

function tick(now) {
  // not sure how to make a background tab from acting as a stationary dot
  
  const dt = Math.min((now - lastTime) / 1000, 0.25);
  lastTime = now;

  myCharge += dt / myPeriod;

  if (myCharge >= 1) {
    myCharge = 0;
    const me = fireflies.get(socket.id);
    if (me) flash(me);
    socket.emit('firefly:fire');
  }

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);


const couplingSlider = document.querySelector('#coupling-slider');
const couplingValue = document.querySelector('#coupling-value');

couplingSlider?.addEventListener('input', () => {
  couplingBoost = parseFloat(couplingSlider.value);
  couplingValue.textContent = couplingBoost.toFixed(2);
});
