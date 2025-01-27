export class CookieService {
    constructor() {

    }

    getUsernameCookie() {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
            const [key, value] = cookie.split('=');
            if (key === "username") {
                return decodeURIComponent(value);
            }
        }
        return null;
    }

    setUsernameCookie(username: string) {
        const date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000)); // Voeg aantal dagen toe
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `username=${encodeURIComponent(username)}; ${expires}; path=/`;
    }

}