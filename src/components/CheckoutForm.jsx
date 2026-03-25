import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

export const CheckoutForm = ({ onPaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

       
        const { data } = await axios.post('http://localhost:5000/api/payments/create-payment-intent');
          
      
        const result = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: { card: elements.getElement(CardElement) }
        });

        if (result.error) {
            alert(result.error.message);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                alert("¡Pago exitoso!");
                onPaymentSuccess(); 
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{padding: '20px', border: '1px solid #ccc'}}>
            <CardElement />
            <button type="submit" disabled={!stripe}>Pagar $20.00</button>
        </form>
    );
};