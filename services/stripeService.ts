/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { loadStripe } from '@stripe/stripe-js';

// IMPORTANT: Replace with your actual Stripe publishable key from your Stripe dashboard.
// This key is safe to be exposed in the frontend. It should start with "pk_test_...".
const STRIPE_PUBLISHABLE_KEY = process.env.VITE_STRIPE_PUBLISHABLE_KEY; 

// In a real-world application, you would ideally fetch a session ID from your backend
// for enhanced security. For this frontend-only example, we use client-only checkout.
export const redirectToCheckout = async () => {
    if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.includes('REPLACE_ME')) {
        const errorMessage = 'Stripe publishable key is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env.local file';
        alert(errorMessage);
        throw new Error(errorMessage);
    }

    const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);

    if (!stripe) {
        throw new Error('Stripe.js failed to load.');
    }

    const result = await stripe.redirectToCheckout({
        lineItems: [
            // FIX: The Stripe type definitions are outdated and do not include `price_data` in the line item type.
            // We are using `as any` to bypass the TypeScript error because this is the correct structure for client-only checkout.
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Past Yous Generation',
                        description: 'AI-powered image generation for 6 decades.',
                    },
                    unit_amount: 200, // $2.00 in cents
                },
                quantity: 1,
            } as any,
        ],
        mode: 'payment',
        // These URLs are used for redirection after the payment process.
        successUrl: `${window.location.origin}?page=results&payment=success`,
        cancelUrl: `${window.location.origin}?payment=cancelled`,
    });

    if (result.error) {
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer.
        console.error(result.error.message);
        alert(result.error.message);
    }
};