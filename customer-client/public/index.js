// Create connection to wss
const customer = new WebSocket('ws://localhost:4000?role=customer')

// Gather the troops
const placeOrderBtn = document.getElementById('placeOrderBtn')
const orderNumPara = document.getElementById('orderNumPara')
const placeOrderContainer = document.getElementById('placeOrderContainer')
const orderCompletePara = document.getElementById('orderCompletePara')

// Two-way binding

placeOrderBtn.addEventListener('click', () => {
    if (customer.readyState !== WebSocket.OPEN) return

    // Messages from server to this client
    customer.addEventListener('message', (ev) => {
        let parsed = JSON.parse(ev.data)
        switch (parsed.type) {
            case 'order_placed_response':
                orderNumPara.innerText = `Your order number is: ${parsed.orderNumber}`
                placeOrderContainer.style.display = 'none'
                break
            case 'order_complete':
                orderCompletePara.innerText = 'Your order is complete, please come hentaaa'
                break
            default:
                break
        }

    })

    // Messages from this client to server
    customer.send(JSON.stringify({
        type: 'order_placed'
    }))

    placeOrderBtn.style.display = 'none'
})

