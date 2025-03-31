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
}
