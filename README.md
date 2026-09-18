Fireflies
available at : https://firefly-33wz.onrender.com/


A small multiplayer browser experiment inspired by firefly synchronization and pulse-coupled oscillators / kuramoto oscillators

Each connected browser tab represents a firefly. At first, every firefly has its own randomly initialized rhythm. When one firefly flashes, the event is relayed through a Socket.IO server to the other connected fireflies. Their local rhythms are gradually nudged by those incoming flashes, creating the possibility of a swarm-wide synchronized rhythm.

>Demo

unlike other firefly demos , this is designed to be multiplayer , so you would either have to have multiple foreground tabs(background wont work) or pray that this goes viral and always has active users.

i know my luck so you would have to do :

Open the app in one tab.

Open the same URL in two or more additional tabs.

Watch the fireflies start with different rhythms.

Adjust the coupling control to change how strongly incoming flashes affect a firefly (0.3 - 0.5 is the sweet spot)

Press scatter to give every connected firefly a new random phase and period without changing its position.

>How it works

Each browser keeps its own private oscillator state:

myCharge — the current position in that firefly's cycle.

myPeriod — the firefly's natural period.

couplingBoost — how strongly another firefly's flash can advance the cycle.

The server only manages the connected clients and relays events.

Client

On every animation tick, a firefly advances its charge according to its natural period:

charge += dt / period

When the charge reaches one, the firefly:

Resets its charge.

Flashes visually.

Sends firefly:fire to the server.

When another firefly flashes, the server sends a firefly:fired event to the other clients. The receiving firefly can advance its own charge according to the coupling rule.

The current implementation also normalizes the coupling by the number of other connected fireflies:

const effectiveBoost =
  couplingBoost / Math.max(fireflies.size - 1, 1);

and only applies the boost when the receiving firefly is sufficiently far through its current cycle.


The server intentionally does not maintain the charge, period, or phase of each firefly.

It stores the information required to represent connected fireflies visually, such as their positions, and relays synchronization events between clients.

This keeps each oscillator's natural rhythm local to its browser while still allowing the swarm to interact over the network.

>Scatter

The scatter button resets the synchronization state without moving the fireflies.

When a scatter event is received, each browser independently generates:

a new random charge

a new random natural period

The server broadcasts the reset event to every connected client, including the browser that pressed the button.

This makes it possible to repeatedly observe the transition from:

different rhythms → interaction → synchronization

without changing the spatial arrangement of the swarm.

>Running locally

Requirements

Node.js

npm

Install dependencies

npm install

Start the server

node script.js

The server runs on:

http://localhost:3000

Open that address in multiple browser tabs to create a small swarm.

If your server entry file is named differently, replace script.js with that filename.
