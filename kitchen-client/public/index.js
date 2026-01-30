
const kitchen = new WebSocket('ws://localhost:4000?role=kitchen')

// Gather the troops
const pendingOrdersPara = document.getElementById('pendingOrdersPara')
const nextOrderPara = document.getElementById('nextOrderPara')
const completeOrderBtn = document.getElementById('completeOrderBtn')

kitchen.addEventListener('message', (ev) => {
    let parsed = JSON.parse(ev.data)
    let nextOrder = parsed.ordersQueue.shift()
    if (!nextOrder) {
        nextOrderPara.innerText = 'No pending orders'
    } else {
        nextOrderPara.innerText = nextOrder
    }
    pendingOrdersPara.innerText = parsed.ordersQueue
})

completeOrderBtn.addEventListener('click', () => {
    // Tell the server we have completed the next order
    kitchen.send(JSON.stringify({
        type: 'order_complete'
    }))
})