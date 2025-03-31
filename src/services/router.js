export class RouterService {
    static init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
    }

    static navigate(path) {
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

    static navigateToSection(section) {
        const esiroNetwork = document.querySelector('esiro-network');
        if (!esiroNetwork?.shadowRoot) return;
        
        const esiroMain = esiroNetwork.shadowRoot.querySelector('esiro-main');
        if (!esiroMain?.shadowRoot) return;
        
        const mainContent = esiroMain.shadowRoot.querySelector('main');
        if (!mainContent) return;
        
        this.handleRoute(section, mainContent);
    }

    static handleRoute(section, mainContent) {
        if (!mainContent) return;
        
        try {
            // Hide all sections first
            const sections = mainContent.querySelectorAll('section');
            if (sections) {
                sections.forEach(s => s.classList.add('hidden'));
            }

            // Show target section
            const targetSection = mainContent.querySelector(`#${section}`);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error in handleRoute:', error);
        }
    }
}
