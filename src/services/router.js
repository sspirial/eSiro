export class RouterService {
    static init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
    }

    static navigate(path) {
        history.pushState({}, '', path);
        this.handleRoute();
    }

    static navigateTo(path) {
        history.pushState({}, '', path);
        this.handleRoute();
    }

    static handleRoute() {
        const path = window.location.pathname;
        const main = document.querySelector('main');
        
        switch(path) {
            case '/':
                main.innerHTML = '<esiro-home></esiro-home>';
                break;
            case '/personal-home':
                main.innerHTML = '<esiro-personal-home></esiro-personal-home>';
                break;
            case '/account':
                main.innerHTML = '<esiro-account></esiro-account>';
                break;
            default:
                main.innerHTML = '<esiro-home></esiro-home>';
        }
    }

    static async navigateToSection(section) {
        try {
            // Get the esiro-main element
            const esiroMain = document.querySelector('esiro-main');
            if (!esiroMain) {
                console.error('esiro-main element not found');
                return;
            }

            // Wait for shadow DOM to be initialized
            if (!esiroMain.shadowRoot) {
                console.error('Shadow DOM not initialized for esiro-main element');
                return;
            }

            // Get the main element within esiro-main's shadow DOM
            const main = esiroMain.shadowRoot.querySelector('main');
            if (!main) {
                console.error('Main element not found in esiro-main');
                return;
            }

            // Hide all sections
            const sections = main.querySelectorAll('section');
            sections.forEach(sec => sec.classList.add('hidden'));

            // Show the target section
            const targetSection = main.querySelector(`#${section}`);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                console.log(`Navigated to section: ${section}`);
            } else {
                console.error(`Section with id ${section} not found`);
            }
        } catch (error) {
            console.error('Error navigating to section:', error);
        }
    }
}
