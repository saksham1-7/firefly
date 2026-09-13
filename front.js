const field = document.querySelector('.firefly-field');
const status = document.querySelector('.swarm-status');

const socket = io();

const fireflies = new Map();
let myId = null;
let couplingStrength = 0.15
function addFirefly(id,phase,frequency,x,y,isMine = false) {

const dot = document.createElement('div');
dot.className = 'firefly';
if (isMine) {
    dot.classList.add('my-firefly');
}
dot.style.setProperty('--x', `${x}%`);
dot.style.setProperty('--y', `${y}%`);
dot.style.setProperty('--hue', Math.floor(40 + Math.random() * 30));
dot.style.setProperty('--size', '10px');
field.appendChild(dot);
fireflies.set(id, { phase, frequency, dot });

}

socket.on('connect', () => {
    myId = socket.id;
   console.log('My ID:', myId);
    

});

socket.on('swarm:sync',(snap)=> {

    const me = fireflies.get(myId);

    if (me) {
        const others = Object.entries(snap).filter(([id]) => id != myId);
        if (others.length > 0) {
           const correction = others.reduce(
        (sum, [, data]) => sum + Math.sin(data.phase - me.phase), 0
      ) / others.length;
      me.phase += couplingStrength * correction;
        }
    }

    for (const [id,data] of Object.entries(snap))
{     
    if(!fireflies.has(id)) {

        addFirefly(id,data.phase,data.frequency,data.x,data.y,id === myId);
    }
    else {
        const f = fireflies.get(id);
        if (id !== myId)
        {f.frequency = data.frequency;
        f.phase = data.phase;}
    }}
status.textContent = `${fireflies.size} firefl${fireflies.size === 1 ? 'y' : 'ies'} here.`;
})

socket.on('userDisconnected' , (id) => {
    const f = fireflies.get(id);

    if (!f) return;
    f.dot.remove();
    fireflies.delete(id);

});
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

setInterval(() => {
    const me = fireflies.get(myId);
    if (me) 
        socket.emit('firefly:phase',me.phase);
}, 100);

const couplingSlider = document.querySelector('#coupling-slider');
const couplingValue = document.querySelector('#coupling-value');

couplingSlider.addEventListener('input', () => {
  couplingStrength = parseFloat(couplingSlider.value);
  couplingValue.textContent = couplingStrength.toFixed(2);
});