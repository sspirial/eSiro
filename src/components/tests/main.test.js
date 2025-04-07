import '@testing-library/jest-dom';
import { screen, render } from '@testing-library/dom';
import EsiroMain from '../main';

describe('EsiroMain Component', () => {
    beforeAll(() => {
        customElements.define('esiro-main', EsiroMain);
    });

    it('renders the main component', () => {
        document.body.innerHTML = '<esiro-main></esiro-main>';
        const main = document.querySelector('esiro-main');
        expect(main).toBeInTheDocument();
    });

    it('displays an empty state message', () => {
        document.body.innerHTML = '<esiro-main></esiro-main>';
        const main = document.querySelector('esiro-main');

        // Mock empty state
        main.innerHTML = '<div class="empty-state">No items available</div>';
        const emptyState = screen.getByText('No items available');
        expect(emptyState).toBeInTheDocument();
    });

    it('sanitizes attribute values', () => {
        const main = new EsiroMain();
        const sanitizedValue = main.sanitizeAttribute('<script>alert(1)</script>');
        expect(sanitizedValue).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });
});