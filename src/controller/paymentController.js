import Payment from '../model/paymentModel.js'; // Import the payment model
import PaystackService from '../service/paystackService.js';

const paystack = new PaystackService();

// Initialize payment
export const initializePayment = async (req, res) => {
  try {
    const response = await paystack.initializePayment(req.body);
    res.status(201).json({ status: 'success', data: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// Verify payment and save to DB
// In paymentController.js
export const verifyPayment = async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ status: "fail", message: "Transaction reference is required." });
  }
  try {
  const verification = await paystack.verifyPayment(reference);
  const data = verification.data;

  const cleanedData = {
    reference: data.reference,
    amount: data.amount / 100,
    currency: data.currency,
    status: data.status,
    paid_at: data.paid_at,
    customer_email: data.customer.email,
    channel: data.channel,
    authorization: {
      last4: data.authorization.last4,
      bank: data.authorization.bank,
      card_type: data.authorization.card_type,
      reusable: data.authorization.reusable,
    },
  };

  const existing = await Payment.findOne({ reference });

  if (!existing) {
    try {
      await Payment.create(cleanedData);
      console.log("Payment saved.");
    } catch (saveErr) {
      console.error("Error saving to DB:", saveErr);
    }
  } else {
    console.log("Payment already exists.");
  }

  res.status(200).json({ status: "success", data: cleanedData });
} catch (error) {
  console.error(error);
  res.status(500).json({ status: "fail", message: error.message });
}

  /*
  try {
    const verification = await paystack.verifyPayment(reference);

    const data = verification.data;

    // Clean response
    const cleanedResponse = {
      status: "success",
      message: "Payment verified successfully",
      data: {
        reference: data.reference,
        amount: data.amount / 100, // Convert kobo to naira
        currency: data.currency,
        status: data.status,
        paid_at: data.paid_at,
        customer_email: data.customer.email,
        authorization: {
          last4: data.authorization.last4,
          bank: data.authorization.bank,
          card_type: data.authorization.card_type,
          reusable: data.authorization.reusable,
        },
        channel: data.channel,
      },
    };

    res.status(200).json(cleanedResponse);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: "fail", message: error.message });
  }*/
};

/*export const verifyPayment = async (req, res) => {
  const { reference } = req.query;
  if (!reference) {
    return res.status(400).json({ status: "fail", message: "Transaction reference is required." });
  }

  try {
    const verification = await paystack.verifyPayment(reference);
    res.status(200).json(verification);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: "fail", message: error.message });
  }
};



export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    const verification = await paymentService.verifyPayment(reference);
    const data = verification.data;

    if (data.status === 'success') {
      // Check if already stored
      const existing = await Payment.findOne({ reference: data.reference });
      if (!existing) {
        await Payment.create({
          user: req.user._id, // assuming you're using auth middleware to attach the user
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: data.customer.email,
          amount: data.amount / 100, // convert kobo to naira
          reference: data.reference,
          status: data.status,
          channel: data.channel,
          paidAt: data.paid_at
        });
      }
    }

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
};
*/
// Get payment history (optional)
export const getPayment = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: payments.length, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
};
