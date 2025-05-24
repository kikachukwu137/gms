import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { globalErrorHandler } from './middleware/globalErrorHandler.js';
import userRouter from './route/user.route.js'
import paymentRoutes from './route/paymentRoutes.js';
 
// import {paystackRoutes,paystackWebhook} from './route/paystack.routes.js'
// import paystackRoutes from './route/paystack.routes.js';
// Get __dirname in ES Module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Set view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());









// Handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid JSON in request body'
    });
  }


  next(err);
});
// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/payments', paymentRoutes);
// app.use("/api/paystack", paystackRoutes);
// app.use("/api/paystack/webhook", express.raw({ type: 'application/json' }));

// Base route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to GMS Travels API' });
});

// Catch-all for undefined routes
// Uncomment if you implement a custom AppError
// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
// });


// Global error handler
app.use(globalErrorHandler);
export default app;
