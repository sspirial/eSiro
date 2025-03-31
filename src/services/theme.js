export class ThemeService {
    static init() {
        const savedTheme = localStorage.getItem('theme') || 
                          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.setTheme(savedTheme);
    }

    static toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    }

    static setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.error(`Invalid theme: ${theme}`);
            return;
        }
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Dispatch event for components to react
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }
}
