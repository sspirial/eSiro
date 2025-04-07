import '@testing-library/jest-dom';
import { screen, render } from '@testing-library/dom';
import EsiroNav from '../nav';

describe('EsiroNav Component', () => {
    beforeAll(() => {
        customElements.define('esiro-nav', EsiroNav);
    });

    it('renders navigation buttons', () => {
        document.body.innerHTML = '<esiro-nav></esiro-nav>';
        const nav = document.querySelector('esiro-nav');
        expect(nav).toBeInTheDocument();

        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('handles section change on button click', () => {
        document.body.innerHTML = '<esiro-nav></esiro-nav>';
        const nav = document.querySelector('esiro-nav');
        const button = screen.getAllByRole('button')[0];

        // Simulate button click
        nav.handleNavClick = jest.fn();
        button.click();
        expect(nav.handleNavClick).toHaveBeenCalled();
    });
});