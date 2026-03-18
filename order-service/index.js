const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'order-service' });
});

app.get('/orders', (req, res) => {
    res.json({ orders: [{ id: 1, product: 'Laptop' }] });
});

app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
});

