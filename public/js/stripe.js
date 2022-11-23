const stripe = Stripe(
  'pk_test_51M6nsQSDOobx5Z6rHgqPiLuidjpToZrZmAfdJOwiI27L2yy26DKRZXJ3hxmYcCpLoEzUfg3QK3ltWNCqb3Ll4lfk00drwlA3lS'
);
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTheTour = async (tourId) => {
  try {
    const session = await axios(`http://127.0.0.1:3000/api/v1/booking/get-checkout/${tourId}`);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (e) {
    showAlert('error', e);
  }
};
