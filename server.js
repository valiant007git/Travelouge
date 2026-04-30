/**
 * Travelogue Backend Setup Instructions
 * 
 * 1. Ensure you have Node.js installed on your machine.
 * 2. Open your terminal in this directory (`travelogue website`).
 * 3. Run `npm install` to install all dependencies (express, cors, dotenv, nodemailer).
 * 4. Open the `.env` file and replace `your_email@gmail.com` and `your_app_password` 
 *    with your actual Gmail address and a generated Google App Password.
 * 5. Start the server by running `npm start` or `node server.js`.
 * 6. The server will run on http://localhost:3000 and serve your static frontend files.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files from the same directory
app.use(express.static(path.join(__dirname)));

// Helper function to handle JSON file writing safely
const appendToJsonFile = (filename, data) => {
    const filePath = path.join(__dirname, filename);
    let currentData = [];
    
    if (fs.existsSync(filePath)) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            currentData = JSON.parse(fileContent);
        } catch (error) {
            console.error(`Error reading ${filename}:`, error);
        }
    }
    
    // Add timestamp
    data.timestamp = new Date().toISOString();
    currentData.push(data);
    
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 4));
};

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// API Routes

// 1. POST /api/booking - Accept booking form data and save to bookings.json
app.post('/api/booking', async (req, res) => {
    const { name, email, destination, date, guests, package } = req.body;
    
    // Basic validation
    if (!name || !email || !destination) {
        return res.status(400).json({ error: 'Name, email, and destination are required' });
    }
    
    const bookingData = { name, email, destination, date, guests, package };
    appendToJsonFile('bookings.json', bookingData);
    
    // Send Confirmation Email
    const mailOptions = {
        from: `"Travelogue" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Booking Confirmation - Travelogue',
        html: `
            <h2>Thank you for choosing Travelogue, ${name}!</h2>
            <p>Your booking request for <strong>${destination}</strong> has been received.</p>
            <h3>Booking Details:</h3>
            <ul>
                <li><strong>Destination:</strong> ${destination}</li>
                <li><strong>Date:</strong> ${date || 'Not specified'}</li>
                <li><strong>Guests:</strong> ${guests || 'Not specified'}</li>
                <li><strong>Package:</strong> ${package || 'Standard'}</li>
            </ul>
            <p>Our team will contact you shortly to finalize your itinerary.</p>
            <p>Best Regards,<br>The Travelogue Team</p>
        `
    };

    try {
        if(process.env.GMAIL_USER !== 'your_email@gmail.com') {
             await transporter.sendMail(mailOptions);
        } else {
             console.log("Skipping email send. GMAIL_USER not configured in .env");
        }
        res.status(200).json({ message: 'Booking successful', data: bookingData });
    } catch (error) {
        console.error('Email sending failed:', error);
        // We still return 200 for the booking creation, but inform about email failure
        res.status(200).json({ message: 'Booking saved, but failed to send confirmation email', error: error.message });
    }
});

// 2. POST /api/contact - Accept contact form and save to contacts.json
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    
    const contactData = { name, email, message };
    appendToJsonFile('contacts.json', contactData);
    
    res.status(200).json({ message: 'Contact message received successfully' });
});

// 3. POST /api/subscribe - Accept newsletter email and save to subscribers.json
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
    }
    
    appendToJsonFile('subscribers.json', { email });
    
    res.status(200).json({ message: 'Successfully subscribed to newsletter' });
});

// 4. GET /api/bookings - Return all bookings (admin only, protected by secret key)
app.get('/api/bookings', (req, res) => {
    const authHeader = req.headers.authorization;
    const secretKey = process.env.ADMIN_SECRET_KEY;
    
    if (!authHeader || authHeader !== secretKey) {
        return res.status(403).json({ error: 'Unauthorized access. Invalid or missing secret key.' });
    }
    
    const filePath = path.join(__dirname, 'bookings.json');
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        res.status(200).json(JSON.parse(fileContent));
    } else {
        res.status(200).json([]);
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 Travelogue Server running on port ${PORT}`);
    console.log(`👉 View site at http://localhost:${PORT}`);
    console.log(`========================================`);
});
