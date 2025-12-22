require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const dns = require('dns');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const port = process.env.PORT || 5000;

/* ===============================
   ✅ CORS CONFIG (FIXED)
================================ */

const allowedOrigins = [
  'http://localhost:5173',
  'https://fluffy-gaufre-33be2d.netlify.app', // ✅ Netlify frontend
];

// optional env support
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // allow Postman / server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/* ===============================
   ✅ MIDDLEWARES
================================ */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ===============================
   ✅ ROUTES
================================ */

// JWT
app.use('/jwt', require('./routes/jwt'));

// App routes
app.use('/users', require('./routes/users'));
app.use('/products', require('./routes/products'));
app.use('/orders', require('./routes/orders'));

/* ===============================
   ✅ PAYMENTS (STRIPE)
================================ */

const paymentsRouter = express.Router();

paymentsRouter.post('/create-checkout-session', async (req, res) => {
  try {
    const orderData = req.body;

    const quantity = Number(orderData.quantity);
    const pricePerUnit = Number(orderData.pricePerUnit);

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    if (!pricePerUnit || pricePerUnit <= 0) {
      return res.status(400).json({ message: 'Invalid price' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: orderData.productTitle,
            },
            unit_amount: Math.round(pricePerUnit * 100),
          },
          quantity,
        },
      ],
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-cancel`,
      metadata: {
        productId: orderData.productId,
        quantity,
        email: orderData.email,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('❌ Stripe Error:', error);
    res.status(500).json({ message: error.message || 'Stripe session failed' });
  }
});

app.use('/payments', paymentsRouter);

/* ===============================
   ✅ ROOT & FALLBACK
================================ */

app.get('/', (req, res) => {
  res.send('🚀 Garments Tracker Server is Running!');
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* ===============================
   ✅ GLOBAL ERROR HANDLER
================================ */

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!',
  });
});

/* ===============================
   ✅ SERVER START
================================ */

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  process.exit(0);
});

startServer();
