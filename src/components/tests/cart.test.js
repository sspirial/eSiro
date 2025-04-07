import '@testing-library/jest-dom';
import { screen, render } from '@testing-library/dom';
import EsiroCart from '../cart';

describe('EsiroCart Component', () => {
    beforeAll(() => {
        customElements.define('esiro-cart', EsiroCart);
    });

    it('renders the cart component', () => {
        document.body.innerHTML = '<esiro-cart></esiro-cart>';
        const cart = document.querySelector('esiro-cart');
        expect(cart).toBeInTheDocument();
    });

    it('displays items in the cart', () => {
        document.body.innerHTML = '<esiro-cart></esiro-cart>';
        const cart = document.querySelector('esiro-cart');

        // Mock cart items
        cart.innerHTML = `
            <div class="cart-item">Item 1</div>
            <div class="cart-item">Item 2</div>
        `;

        const items = screen.getAllByText(/Item/);
        expect(items.length).toBe(2);
    });

    it('handles checkout button click', () => {
        document.body.innerHTML = '<esiro-cart></esiro-cart>';
        const cart = document.querySelector('esiro-cart');

        // Mock checkout button
        cart.innerHTML = '<button id="checkout">Checkout</button>';
        const checkoutButton = screen.getByText('Checkout');

        // Simulate button click
        cart.handleCheckout = jest.fn();
        checkoutButton.click();
        expect(cart.handleCheckout).toHaveBeenCalled();
    });
});