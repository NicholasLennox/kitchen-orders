import type { IncomingMessage } from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'

const wss: WebSocketServer = new WebSocketServer({ port: 4000 })

type OrderNumber = number

let nextOrderNumber = 100;
let ordersQueue: OrderNumber[] = []
let kitchen: WebSocket | undefined = undefined
let customersMap = new Map<OrderNumber, WebSocket>()

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    // Handling connection
    if (req.url === undefined) return

    let url = new URL(req.url, 'http://localhost')
    let role = url.searchParams.get('role')

    if (role === 'kitchen') {
        kitchen = ws //The connect socket is the kitchen if it connected with role=kitchen
        let response = {
            type: 'orders_update',
            ordersQueue: ordersQueue
        }
        kitchen.send(JSON.stringify(response))
    }

    console.log(`New ${role} connected, there are ${wss.clients.size} total`);

    // Adding event listeners
    ws.on('message', (data) => {
        const parsedData = JSON.parse(data.toString())
        // Based on the type, we do different things

        // order_placed -> generate new order number, send that to the customer
        switch (parsedData.type) {
            case 'order_placed': // Customers should only be able to do this
                ordersQueue.push(nextOrderNumber)

                customersMap.set(nextOrderNumber, ws)
                

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
            case 'order_complete': // We know this comes from the kitchen
                // Extract the first element, that is is the completed order
                let completedOrder: OrderNumber | undefined = ordersQueue.shift()
                if(!completedOrder) return
                console.log(`Completetd order: ${completedOrder}`);
                console.log(ordersQueue);
                
                // Send the corresponding client a message to say it is complete
                let customer: WebSocket | undefined = customersMap.get(completedOrder)
                if(!customer) return 
                customer.send(JSON.stringify({
                    type: 'order_complete'
                }))

                // Send the kitchen the updated queue
                if (kitchen !== undefined) {
                    let response = {
                        type: 'orders_update',
                        ordersQueue: ordersQueue
                    }
                    kitchen.send(JSON.stringify(response))
                }
                break
            default:
                break
        }
    })

    ws.on('close', () => {
        console.log('Client disconnected');
        customersMap.forEach((v,k) => {
            if(v === ws) {
                console.log(`Found client`);
                console.log(`Order number: ${k}`)
                ordersQueue = ordersQueue.filter( o => o !== k)
                console.log(ordersQueue);
                if (kitchen !== undefined) {
                    let response = {
                        type: 'orders_update',
                        ordersQueue: ordersQueue
                    }
                    kitchen.send(JSON.stringify(response))
                }
            }
        })
    })
})

console.log('Server listening on ws://localhost:4000');
