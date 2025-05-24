// import mongoose from 'mongoose';

// const paymentSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // Reference to User model
//     required: true
//   },
//   firstName: {
//     type: String,
//     required: true
//   },
//   lastName: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true
//   },
//   amount: {
//     type: Number,
//     required: true
//   },
//   reference: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   status: {
//     type: String,
//     required: true,
//     enum: ['success', 'failed', 'abandoned', 'pending'] // enforce valid statuses
//   },
//   channel: {
//     type: String,
//     default: 'card' // optional: card, bank, ussd, etc.
//   },
//   paidAt: {
//     type: Date
//   }
// }, { timestamps: true });

// const Payment = mongoose.model('Payment', paymentSchema);
// export default Payment;
// models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String },
  status: { type: String },
  paid_at: { type: Date },
  customer_email: { type: String },
  channel: { type: String },
  authorization: {
    last4: String,
    bank: String,
    card_type: String,
    reusable: Boolean,
  },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
