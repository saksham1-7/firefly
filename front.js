const field = document.querySelector('.firefly-field');
const status = document.querySelector('.swarm-status');

const socket = io();

const fireflies = new Map();
let myId = null;

function addFirefly(id,phase,frequency) {

const dot = document.createElement('div');
dot.className = 'firefly';
dot.style.setProperty('--x', `${5 + Math.random() * 90}%`);
dot.style.setProperty('--y', `${5 + Math.random() * 90}%`);
dot.style.setProperty('--hue', Math.floor(40 + Math.random() * 30));
dot.style.setProperty('--size', '10px');
field.appendChild(dot);
fireflies.set(id, { phase, frequency, dot });

}

socket.on('connect', () => {
    myId = socket.id;
    addFirefly(myId, Math.random() * Math.PI * 2, 0.8 + Math.random() * 0.6);
})


let lastTime = performance.now();

function tick(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    for( const f of fireflies.values()) {
         f.phase += f.frequency * dt * Math.PI * 2;
    f.phase %= Math.PI * 2;
    const brightness = (1 + Math.sin(f.phase)) / 2;
    f.dot.style.opacity = 0.15 + brightness * 0.85;
    }

    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);