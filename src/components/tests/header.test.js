import '@testing-library/jest-dom';
import { screen, render } from '@testing-library/dom';
import EsiroHeader from '../header';

describe('EsiroHeader Component', () => {
    beforeAll(() => {
        customElements.define('esiro-header', EsiroHeader);
    });

    it('renders the header with logo and actions', () => {
        document.body.innerHTML = '<esiro-header></esiro-header>';
        const header = document.querySelector('esiro-header');
        expect(header).toBeInTheDocument();

        const logo = screen.getByLabelText('eSiro Home');
        expect(logo).toBeInTheDocument();

        const themeToggle = screen.getByLabelText('Toggle dark/light theme');
        expect(themeToggle).toBeInTheDocument();

        const cartButton = screen.getByLabelText('Shopping cart');
        expect(cartButton).toBeInTheDocument();
    });

    it('updates theme icon on toggle', () => {
        document.body.innerHTML = '<esiro-header></esiro-header>';
        const header = document.querySelector('esiro-header');
        const themeToggle = screen.getByLabelText('Toggle dark/light theme');

        // Simulate theme toggle
        header.updateThemeIcon = jest.fn();
        themeToggle.click();
        expect(header.updateThemeIcon).toHaveBeenCalled();
    });
});