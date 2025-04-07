import { AuthService } from './auth.js';

export class RouterService {
    static init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
    }

    static navigate(path) {
        history.pushState({}, '', path);
        this.handleRoute();
    }

    static async handleRoute() {
        const path = window.location.pathname;
        const user = await AuthService.getUser();
        const main = document.querySelector('main');
        const network = document.querySelector('esiro-network');

        // Handle role-based routing
        if (user) {
            if (user.role === 'vendor' && path === '/eSiro/') {
                this.navigate('/eSiro/vendor');
                return;
            }
        }

        // Handle section-based routing
        switch (path) {
            case '/eSiro/account':
                if (main) {
                    main.innerHTML = '<esiro-account></esiro-account>';
                }
                break;
            case '/eSiro/vendor':
                if (main) {
                    main.innerHTML = '<esiro-vendor-dashboard></esiro-vendor-dashboard>';
                }
                break;
            default:
                // For other routes, use the network component's showSection
                if (network) {
                    const section = path.split('/').pop() || 'stores';
                    network.showSection(section);
                }
        }
    }
}
