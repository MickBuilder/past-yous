import { loadStripe } from '@stripe/stripe-js';

// IMPORTANT: Replace with your actual Stripe publishable key from your Stripe dashboard.
// This key is safe to be exposed in the frontend. It should start with "pk_test_..." for development.
const STRIPE_PUBLISHABLE_KEY = process.env.VITE_STRIPE_PUBLISHABLE_KEY;
const STRIPE_PRICE_ID = process.env.VITE_STRIPE_PRICE_ID;

// In a real-world application, you would ideally fetch a session ID from your backend
// for enhanced security. For this frontend-only example, we use client-only checkout.
export const redirectToCheckout = async () => {
  console.log('Stripe key check:', STRIPE_PUBLISHABLE_KEY ? 'Key present' : 'No key');
  console.log('Key starts with:', STRIPE_PUBLISHABLE_KEY?.substring(0, 10));

  if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.includes('REPLACE_ME')) {
    const errorMessage = 'Stripe publishable key is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env.local file';
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  if (!STRIPE_PRICE_ID || STRIPE_PRICE_ID.includes('REPLACE_ME')) {
    const errorMessage = 'Stripe price ID is not configured. Please set VITE_STRIPE_PRICE_ID in your .env.local file';
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  // Check if using test key in development
  if (STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_') && window.location.hostname === 'localhost') {
    console.warn('Using live Stripe key in development. Consider using pk_test_... key for development.');
  }

  try {
    const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);

    if (!stripe) {
      throw new Error('Stripe.js failed to load.');
    }

    console.log('Stripe loaded successfully, redirecting to checkout...');

    const result = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      successUrl: `${window.location.origin}?payment=success`,
      cancelUrl: `${window.location.origin}?payment=cancelled`,
    });

    if (result.error) {
      console.error('Stripe checkout error:', result.error);
      alert(`Payment error: ${result.error.message}`);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Stripe integration error:', error);
    alert(`Could not connect to payment. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};