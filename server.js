// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const mongoose = require('mongoose');
// const dns = require('dns');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// dns.setServers(['8.8.8.8', '8.8.4.4']);

// const app = express();
// const port = process.env.PORT || 5000;

// /* ===============================
//    ✅ CORS CONFIG
// ================================ */
// const allowedOrigins = [
//   "https://garments-tracker-system-client.onrender.com",
//   "https://garments-tracker-system-client.vercel.app",
//   "http://localhost:5173",
//   "http://localhost:5000",
// ];

// if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true); // server-to-server
//       if (allowedOrigins.includes(origin)) callback(null, true);
//       else callback(new Error('Not allowed by CORS'));
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   })
// );

// /* ===============================
//    ✅ MIDDLEWARES
// ================================ */
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// /* ===============================
//    ✅ ROUTES
// ================================ */
// app.use('/api/jwt', require('./routes/jwt'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/products', require('./routes/products'));
// app.use('/api/orders', require('./routes/orders'));

// /* ===============================
//    ✅ DASHBOARD STATS ROUTE
// ================================ */
// const Product = require('./models/Product');
// const Order = require('./models/Order');

// app.get('/api/dashboard/stats', async (req, res) => {
//   try {
//     const totalProducts = await Product.countDocuments();
//     const totalOrders = await Order.countDocuments();

//     res.json({
//       success: true,
//       totalProducts,
//       totalOrders,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// /* ===============================
//    ✅ PAYMENTS (STRIPE)
// ================================ */
// const paymentsRouter = express.Router();

// paymentsRouter.post('/create-checkout-session', async (req, res) => {
//   try {
//     const orderData = req.body;

//     const quantity = Number(orderData.quantity);
//     const pricePerUnit = Number(orderData.pricePerUnit);

//     if (!quantity || quantity < 1)
//       return res.status(400).json({ message: 'Invalid quantity' });
//     if (!pricePerUnit || pricePerUnit <= 0)
//       return res.status(400).json({ message: 'Invalid price' });

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'payment',
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: { name: orderData.productTitle },
//             unit_amount: Math.round(pricePerUnit * 100),
//           },
//           quantity,
//         },
//       ],
//       success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-cancel`,
//       metadata: {
//         productId: orderData.productId,
//         quantity,
//         email: orderData.email,
//       },
//     });

//     res.json({ sessionId: session.id });
//   } catch (error) {
//     console.error('❌ Stripe Error:', error);
//     res.status(500).json({ message: error.message || 'Stripe session failed' });
//   }
// });

// app.use('/api/payments', paymentsRouter);

// /* ===============================
//    ✅ ROOT & FALLBACK
// ================================ */
// app.get('/', (req, res) => res.send('🚀 Garments Tracker Server is Running!'));

// app.use('*', (req, res) =>
//   res.status(404).json({ message: 'Route not found' })
// );

// /* ===============================
//    ✅ GLOBAL ERROR HANDLER
// ================================ */
// app.use((err, req, res, next) => {
//   console.error('❌ Error:', err.message);
//   res.status(500).json({ success: false, message: err.message || 'Something went wrong!' });
// });

// /* ===============================
//    ✅ SERVER START
// ================================ */
// const startServer = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('✅ MongoDB Connected');
//     app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
//   } catch (err) {
//     console.error('❌ MongoDB Connection Failed:', err.message);
//     process.exit(1);
//   }
// };

// process.on('SIGINT', async () => {
//   console.log('\n🛑 Shutting down server...');
//   await mongoose.connection.close();
//   process.exit(0);
// });

// startServer();



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
   ✅ CORS CONFIG - UPDATED
================================ */
const allowedOrigins = [
  "https://garments-tracker-system-client.onrender.com",
  "https://garments-tracker-system-client.vercel.app",
  "https://strong-profiterole-06da0e.netlify.app", // Added Netlify frontend
  /^https:\/\/.*\.netlify\.app$/, // Allow all Netlify subdomains
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5000",
  "http://localhost:3000",
];

// Add CLIENT_URL from environment if exists
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// CORS middleware with more permissive configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      // Check if the origin is in the allowed list or matches a regex pattern
      const isAllowed = allowedOrigins.some(pattern => {
        if (typeof pattern === 'string') {
          return pattern === origin;
        }
        if (pattern instanceof RegExp) {
          return pattern.test(origin);
        }
        return false;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('CORS blocked for origin:', origin);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours for preflight cache
  })
);

// Handle preflight requests explicitly
app.options('*', cors());

/* ===============================
   ✅ MIDDLEWARES
================================ */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

/* ===============================
   ✅ ROUTES
================================ */
app.use('/api/jwt', require('./routes/jwt'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

/* ===============================
   ✅ DASHBOARD STATS ROUTE
================================ */
const Product = require('./models/Product');
const Order = require('./models/Order');

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Add CORS headers explicitly
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Get recent products and orders
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('productId', 'name image');

    res.json({
      success: true,
      totalProducts,
      totalOrders,
      recentProducts,
      recentOrders,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
});

/* ===============================
   ✅ PAYMENTS (STRIPE)
================================ */
const paymentsRouter = express.Router();

paymentsRouter.post('/create-checkout-session', async (req, res) => {
  try {
    const orderData = req.body;

    const quantity = Number(orderData.quantity);
    const pricePerUnit = Number(orderData.pricePerUnit);

    if (!quantity || quantity < 1)
      return res.status(400).json({ message: 'Invalid quantity' });
    if (!pricePerUnit || pricePerUnit <= 0)
      return res.status(400).json({ message: 'Invalid price' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { 
              name: orderData.productTitle,
              description: orderData.productDescription || 'Garment Product'
            },
            unit_amount: Math.round(pricePerUnit * 100),
          },
          quantity,
        },
      ],
      success_url: `${process.env.CLIENT_URL || 'https://strong-profiterole-06da0e.netlify.app'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'https://strong-profiterole-06da0e.netlify.app'}/payment-cancel`,
      metadata: {
        productId: orderData.productId,
        quantity,
        email: orderData.email,
        userId: orderData.userId || '',
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'GB', 'CA', 'AU', 'BD'],
      },
    });

    res.json({ 
      success: true, 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('❌ Stripe Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Stripe session failed' 
    });
  }
});

// Webhook endpoint for Stripe
paymentsRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment succeeded for session:', session.id);
      // Update your database here
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

app.use('/api/payments', paymentsRouter);

/* ===============================
   ✅ HEALTH CHECK ROUTE
================================ */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'Garments Tracker API',
    version: '1.0.0',
    cors: {
      allowedOrigins: allowedOrigins.filter(o => typeof o === 'string'),
      supportsCredentials: true
    }
  });
});

/* ===============================
   ✅ ROOT & FALLBACK
================================ */
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Garments Tracker Server is Running!',
    endpoints: {
      api: '/api',
      dashboard: '/api/dashboard/stats',
      products: '/api/products',
      health: '/api/health'
    },
    documentation: 'Check the API docs for more information'
  });
});

app.use('*', (req, res) =>
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    requestedPath: req.originalUrl 
  })
);

/* ===============================
   ✅ GLOBAL ERROR HANDLER
================================ */
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Handle CORS errors specifically
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: err.message,
      allowedOrigins: allowedOrigins.filter(o => typeof o === 'string')
    });
  }
  
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

/* ===============================
   ✅ DATABASE CONNECTION
================================ */
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
};

/* ===============================
   ✅ SERVER START
================================ */
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Allowed Origins:`);
      allowedOrigins.forEach(origin => {
        if (typeof origin === 'string') {
          console.log(`   - ${origin}`);
        } else if (origin instanceof RegExp) {
          console.log(`   - ${origin.toString()}`);
        }
      });
      console.log(`📊 API Health: http://localhost:${port}/api/health`);
      console.log(`🏠 Home: http://localhost:${port}/`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
};

/* ===============================
   ✅ GRACEFUL SHUTDOWN
================================ */
const shutdown = async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err.message);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

/* ===============================
   ✅ START THE SERVER
================================ */
startServer();