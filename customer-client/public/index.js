// Create connection to wss
const customer = new WebSocket('ws://localhost:4000?role=customer')

// Gather the troops
const placeOrderBtn = document.getElementById('placeOrderBtn')

placeOrderBtn.addEventListener('click', () => {
    if(customer.readyState !== WebSocket.OPEN) return 

    // Messages from server to this client
    customer.addEventListener('message', (ev) => {
        console.log(JSON.parse(ev.data));
    })

    // Messages from this client to server
    customer.send(JSON.stringify({
        type: 'order_placed'
    }))

    placeOrderBtn.style.display = 'none'
})

