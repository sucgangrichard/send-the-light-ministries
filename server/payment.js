const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();
router.use(cors());

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || 'sk_test_dqn46uircFsE8QENHF9xqnso';

// Create payment link
router.post('/create-payment-link', async (req, res) => {
    try {
        const { amount, description, remarks } = req.body;

        const response = await axios.post(
            'https://api.paymongo.com/v1/links',
            {
                data: {
                    attributes: {
                        amount: amount * 100, // Convert to cents
                        description,
                        remarks
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Payment link creation error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to create payment link' });
    }
});

// Verify payment
router.get('/verify-payment/:id', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.paymongo.com/v1/links/${req.params.id}`,
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Payment verification error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

module.exports = router; 