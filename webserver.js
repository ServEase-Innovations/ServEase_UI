const WebSocket = require('ws');
const { Client } = require('pg');

const PORT = 8081;
const wss = new WebSocket.Server({ port: PORT });

// Store connected service providers
const connectedServiceProviders = new Map();

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'LOGIN' && data.role === 'SERVICE_PROVIDER') {
                const serviceproviderId = data.serviceproviderId.toString();

                if (!connectedServiceProviders.has(serviceproviderId)) {
                    connectedServiceProviders.set(serviceproviderId, new Set());
                }
                connectedServiceProviders.get(serviceproviderId).add(ws);

                console.log(`Service Provider Connected: ${serviceproviderId}`);
                console.log('Currently connected:', Array.from(connectedServiceProviders.keys()));
            }
        } catch (error) {
            console.error('Invalid message format:', error);
        }
    });

    ws.on('close', () => {
        for (const [serviceproviderId, clients] of connectedServiceProviders.entries()) {
            if (clients.has(ws)) {
                clients.delete(ws);
                if (clients.size === 0) {
                    connectedServiceProviders.delete(serviceproviderId);
                }
                break;
            }
        }
        console.log('WebSocket client disconnected');
    });
});

// ✅ PostgreSQL Database Connection
const pgClient = new Client({
    connectionString: 'postgresql://servease.c1ccc8a0u3nt.ap-south-1.rds.amazonaws.com:5432/provider?user=postgres&password=servease',
});

pgClient.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('PostgreSQL connection error:', err));

pgClient.query('LISTEN engagement_insert');

pgClient.on('notification', (msg) => {
    console.log('Notification received:', msg.payload);

    const payload = JSON.parse(msg.payload);
    const serviceproviderId = payload.serviceproviderid.toString();

    if (connectedServiceProviders.has(serviceproviderId)) {
        connectedServiceProviders.get(serviceproviderId).forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'NOTIFICATION',
                    message: 'New data added',
                }));
            }
        });
    } else {
        console.log(`No connected client for ServiceProviderID: ${serviceproviderId}`);
    }
});