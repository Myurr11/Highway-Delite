"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
const express_validator_1 = require("express-validator");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Database connection
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// GET /api/experiences - Get all experiences with optional search
app.get('/api/experiences', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM experiences WHERE active = true';
        const params = [];
        if (search && typeof search === 'string') {
            query += ' AND (title ILIKE $1 OR location ILIKE $1)';
            params.push(`%${search}%`);
        }
        query += ' ORDER BY created_at DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching experiences:', error);
        res.status(500).json({ error: 'Failed to fetch experiences' });
    }
});
// GET /api/experiences/:id - Get single experience
app.get('/api/experiences/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM experiences WHERE id = $1 AND active = true', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Experience not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching experience:', error);
        res.status(500).json({ error: 'Failed to fetch experience' });
    }
});
// GET /api/availability/:experienceId - Get slot availability for a date
app.get('/api/availability/:experienceId', async (req, res) => {
    try {
        const { experienceId } = req.params;
        const { date } = req.query;
        if (!date || typeof date !== 'string') {
            return res.status(400).json({ error: 'Date parameter is required' });
        }
        const result = await pool.query(`SELECT 
        id,
        time,
        total_capacity,
        booked_count,
        (total_capacity - booked_count) as available,
        CASE WHEN (total_capacity - booked_count) <= 0 THEN true ELSE false END as sold_out
       FROM slots
       WHERE experience_id = $1 AND date = $2
       ORDER BY time`, [experienceId, date]);
        // Format time for frontend
        const slots = result.rows.map(slot => ({
            id: slot.id,
            time: slot.time,
            available: slot.available,
            soldOut: slot.sold_out
        }));
        res.json(slots);
    }
    catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
});
// POST /api/promo/validate - Validate promo code
app.post('/api/promo/validate', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Promo code is required' });
        }
        const result = await pool.query('SELECT * FROM promo_codes WHERE code = $1 AND active = true', [code.toUpperCase()]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid promo code' });
        }
        const promo = result.rows[0];
        res.json({
            discount: parseFloat(promo.discount_value),
            type: promo.discount_type
        });
    }
    catch (error) {
        console.error('Error validating promo:', error);
        res.status(500).json({ error: 'Failed to validate promo code' });
    }
});
// POST /api/bookings - Create a new booking
app.post('/api/bookings', [
    (0, express_validator_1.body)('experienceId').notEmpty().withMessage('Experience ID is required'),
    (0, express_validator_1.body)('slotId').notEmpty().withMessage('Slot ID is required'),
    (0, express_validator_1.body)('fullName').notEmpty().withMessage('Full name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('finalTotal').isNumeric().withMessage('Total amount is required')
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { experienceId, slotId, fullName, email, quantity, finalTotal, promoCode } = req.body;
        // Lock the slot row for update
        const slotCheck = await client.query('SELECT * FROM slots WHERE id = $1 FOR UPDATE', [slotId]);
        if (slotCheck.rows.length === 0) {
            throw new Error('Slot not found');
        }
        const slot = slotCheck.rows[0];
        const available = slot.total_capacity - slot.booked_count;
        if (available < quantity) {
            throw new Error('Not enough slots available');
        }
        // Generate unique reference ID
        const refId = 'HUF' + Math.random().toString(36).substr(2, 5).toUpperCase();
        // Create booking
        await client.query(`INSERT INTO bookings 
         (ref_id, experience_id, slot_id, customer_name, customer_email, quantity, total_amount, promo_code, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [refId, experienceId, slotId, fullName, email, quantity, finalTotal, promoCode || null, 'confirmed']);
        // Update slot booked count
        await client.query('UPDATE slots SET booked_count = booked_count + $1 WHERE id = $2', [quantity, slotId]);
        await client.query('COMMIT');
        res.status(201).json({
            success: true,
            refId: refId
        });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating booking:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create booking'
        });
    }
    finally {
        client.release();
    }
});
// GET /api/bookings/:refId - Get booking by reference ID
app.get('/api/bookings/:refId', async (req, res) => {
    try {
        const { refId } = req.params;
        const result = await pool.query(`SELECT 
        b.*,
        e.title as experience_title,
        e.location,
        s.date,
        s.time
       FROM bookings b
       JOIN experiences e ON b.experience_id = e.id
       JOIN slots s ON b.slot_id = s.id
       WHERE b.ref_id = $1`, [refId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📁 Database: highway`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});
