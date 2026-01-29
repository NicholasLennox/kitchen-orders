
const kitchen = new WebSocket('ws://localhost:4000?role=kitchen')

kitchen.addEventListener('message', (ev) => {
    console.log(JSON.parse(ev.data));
})