export class AuthService {
    static isLoggedIn() {
        return localStorage.getItem('user') !== null;
    }

    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static login(email, password) {
        // Simulate a login request
        const user = { email, name: 'John Doe' };
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    }

    static logout() {
        localStorage.removeItem('user');
    }
}
