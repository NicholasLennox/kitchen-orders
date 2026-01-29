import type { IncomingMessage } from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'

const wss: WebSocketServer = new WebSocketServer({ port: 4000 })

let nextOrderNumber = 100;
let ordersQueue = []
let kitchen: WebSocket | undefined = undefined

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    // Handling connection
    if (req.url === undefined) return

    let url = new URL(req.url, 'http://localhost')
    let role = url.searchParams.get('role')

    if (role === 'kitchen') {
        kitchen = ws //The connect socket is the kitchen if it connected with role=kitchen
    }

    console.log(`New ${role} connected, there are ${wss.clients.size} total`);

    // Adding event listeners
    ws.on('message', (data) => {
        const parsedData = JSON.parse(data.toString())
        // Based on the type, we do different things

        // order_placed -> generate new order number, send that to the customer
        switch (parsedData.type) {
            case 'order_placed':
                ordersQueue.push(nextOrderNumber)
                let response = {
                    type: 'order_placed_response',
                    orderNumber: nextOrderNumber
                }
                nextOrderNumber++

                // Send response to customer
                ws.send(JSON.stringify(response))

                // Send updated queue to kitchen
                if (kitchen !== undefined) {
                    let response = {
                        type: 'orders_update',
                        ordersQueue: ordersQueue
                    }
                    kitchen.send(JSON.stringify(response))
                }
                break
        }
    })
})