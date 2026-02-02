export interface OrdersQueueUpdateEvent {
    type: 'orders_update'
    ordersQueue: OrderNumber[]
}

export interface OrderCompleteEvent {
    type: 'order_complete'
}

export interface OrderPlacedEvent {
    type: 'order_placed_response'
    orderNumber: OrderNumber
}

export type OrderNumber = number