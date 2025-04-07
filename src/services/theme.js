export class ThemeService {
    static #currentTheme = 'light';

    static getCurrentTheme() {
        return this.#currentTheme;
    }

    static toggleTheme() {
        this.#currentTheme = this.#currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.#currentTheme);
        localStorage.setItem('theme', this.#currentTheme);
        return this.#currentTheme;
    }

    static initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.#currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// Initialize theme when the service is imported
ThemeService.initializeTheme();
