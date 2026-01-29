# WebSocket Kitchen Simulation

This project models a small real-time system with **multiple clients** and a **single WebSocket server**.

The goal is to understand how different clients communicate through events, and what problems appear as soon as responsibility is split across a network.

## The idea

We model the *last step* of a fast-food ordering flow.

A customer:
- places an order
- receives an order number
- waits until the order is ready

A kitchen:
- sees the queue of pending orders
- prepares them in order
- marks orders as completed

That’s it.

We intentionally skip menus, payments, logins, and persistence so we can focus on **coordination and real-time communication**.

## Roles in the system

### Customer client

- A customer opens the customer client in their browser.
- When the page loads, a WebSocket connection is opened to the server.
- When the customer clicks **Place Order**, they simply signal that an order has been placed.

The server:
- creates a new order
- assigns an order number
- sends that number back to the customer

The customer then waits until the server notifies them that the order is ready.

> If the customer refreshes or closes the page, their order is lost.  
> This highlights a core property of WebSockets: they give us events, not state recovery. We will not be adding the complexity to ensure reconnects and recovery.

### Kitchen client

The kitchen is a separate client with a different role.

- There is only one kitchen.
- It connects to the same WebSocket server.
- It sees the current queue of pending orders.

The kitchen:
- cannot choose which order to prepare
- must follow the queue
- can mark the next order as completed

When an order is completed:
- the server removes it from the queue
- the corresponding customer is notified

## Server responsibility

The server is the authority in the system.

It:
- tracks pending orders
- maintains the queue
- coordinates communication between clients

You can think of it as the service counter where orders are checked, updated, and handed out.

## How to run the project

This project consists of three separate applications:
- the customer client
- the kitchen client
- the WebSocket server

Each application has its own `package.json` and must be started separately.

### 1. Install dependencies

From the root of the repository, install dependencies for each project:

```bash
cd customer-client
npm install

cd ../kitchen-client
npm install

cd ../server
npm install
```

### 2. Start the server

The server must be running first.

```bash
cd server
npm start
```

(Our server is made with TypeScript, so it first builds the output then runs it from `dist`)

### 3. Start the clients

In separate terminals:

**Customer client**

```bash
cd customer-client
npm start
```

**Kitchen client**

```bash
cd kitchen-client
npm start
```

Once all three are running:

* open the customer client in your browser to place orders
* open the kitchen client to see and process the queue

## One-command startup (alternative)

We can start all applications from the **root** using a single command.
This does not merge the projects - it simply runs them **in parallel**.

### 1. Install a helper at the root

From the root of the repository:

```bash
npm init -y
npm install --save-dev concurrently
```

This creates a root-level `package.json` used only for orchestration.

### 2. Root `package.json`

Add a script like this:

```json
{
  "name": "websocket-kitchen",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm start --prefix server\" \"npm start --prefix customer-client\" \"npm start --prefix kitchen-client\""
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

What this does:

* `--prefix` tells npm *where* to run the command
* each project stays independent
* all three processes run at the same time

### 3. Run everything

From the root:

```bash
npm run dev
```

You now have:

* the WebSocket server running
* the customer client running
* the kitchen client running

Each application still runs independently — this command simply orchestrates them.

