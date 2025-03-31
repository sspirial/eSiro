export class AuthService {
    static isLoggedIn() {
        return localStorage.getItem('user') !== null;
    }

    static getUser() {
        return JSON.parse(localStorage.getItem('user'));
    }
}
