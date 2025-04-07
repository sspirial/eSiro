import '@testing-library/jest-dom';
import { screen, render } from '@testing-library/dom';
import EsiroStore from '../store';

describe('EsiroStore Component', () => {
    beforeAll(() => {
        customElements.define('esiro-store', EsiroStore);
    });

    it('renders the store component', () => {
        document.body.innerHTML = '<esiro-store name="Test Store" product-count="5"></esiro-store>';
        const store = document.querySelector('esiro-store');
        expect(store).toBeInTheDocument();

        const name = screen.getByText('Test Store');
        expect(name).toBeInTheDocument();

        const productCount = screen.getByText('5 Products');
        expect(productCount).toBeInTheDocument();
    });

    it('handles visit store button click', () => {
        document.body.innerHTML = '<esiro-store name="Test Store" product-count="5"></esiro-store>';
        const store = document.querySelector('esiro-store');

        // Mock visit store button
        const visitButton = store.querySelector('.visit-store');
        store.renderExpanded = jest.fn();
        visitButton.click();
        expect(store.renderExpanded).toHaveBeenCalled();
    });
});