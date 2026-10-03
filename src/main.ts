import {Game} from "./Game.ts";
import {DBService} from "./DBService.ts";
import {LeaderBoard} from "./LeaderBoard.ts";
import {CookieService} from "./CookieService.ts";
import {containsBlockedTerm, validateUsername} from "./usernameFilter.ts";

const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
const scoreElement: HTMLSpanElement = document.querySelector("#score") as HTMLSpanElement;
const highScoreElement: HTMLSpanElement = document.querySelector("#high-score") as HTMLSpanElement;
const leaderboardElement: HTMLUListElement = document.querySelector("#leaderboard-list") as HTMLUListElement;
const usernamePopup = document.querySelector('.usernamePopup') as HTMLDivElement;
const usernameForm = document.querySelector('#usernameForm') as HTMLFormElement;
const usernameError = document.querySelector('#username-error') as HTMLParagraphElement;
const leaderboardOverlay = document.querySelector('.leaderboard-overlay') as HTMLDivElement;
const leaderboardButton = document.querySelector('#leaderboard-button') as HTMLButtonElement;
const leaderboardClose = document.querySelector('#leaderboard-close') as HTMLButtonElement;

const leaderBoard = new LeaderBoard(leaderboardElement);
const dbService = new DBService(leaderBoard);
const cookieService: CookieService = new CookieService();

let game: Game | null = null;
usernamePopup.classList.remove('visible');
usernamePopup.classList.add('hidden');

// Controleer of de username bestaat (een opgeslagen naam met een slur moet opnieuw gekozen worden)
const username = cookieService.getUsernameCookie();
if (!username || containsBlockedTerm(username)) {
    showUsernamePopup();
} else {
    login(username);
}

// Logt in met een bestaande gebruiker (zonder op hoofdletters te letten) of maakt een nieuwe aan
function login(username: string) {
    return dbService.findUser(username).then(existingUser => {
        const name = existingUser ? existingUser.name : username; // Bestaande schrijfwijze behouden
        cookieService.setUsernameCookie(name);
        if (existingUser) {
            console.log("de user bestaat al in de db")
            StartGame(name, existingUser.score);
        } else {
            console.log("nieuwe user in db gezet")
            dbService.insertHighScore({name, score: 0, date: null});
            StartGame(name, 0);
        }
    });
}


// Op touch-toestellen is het leaderboard een overlay; het spel pauzeert zolang het open is
leaderboardButton.addEventListener('click', () => setLeaderboardOpen(true));
leaderboardClose.addEventListener('click', () => setLeaderboardOpen(false));
leaderboardOverlay.addEventListener('click', (event) => {
    if (event.target === leaderboardOverlay) {
        setLeaderboardOpen(false); // Tik naast het leaderboard sluit het
    }
});

function setLeaderboardOpen(open: boolean) {
    leaderboardOverlay.classList.toggle('visible', open);
    if (game) {
        game.paused = open;
    }
}

// Functie om de game te starten
function StartGame(username: string, highScore: number) {
    game = new Game(canvas, ctx, scoreElement, highScoreElement, dbService, highScore);
    game.start();
    dbService.listenForChanges();

    console.log(`Game gestart voor gebruiker: ${username}`);
}

// Functie om de popup weer te geven en username op te slaan
function showUsernamePopup() {
    usernamePopup.classList.remove('hidden');
    usernamePopup.classList.add('visible');

    usernameForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Voorkom standaard formuliergedrag

        const usernameInput = document.querySelector('#username') as HTMLInputElement;
        const username = usernameInput.value.trim().replace(/\s+/g, " ");

        const error = validateUsername(username);
        usernameError.textContent = error ?? "";
        if (error) {
            return;
        }

        login(username).then(() => {
            usernamePopup.classList.remove('visible');
            usernamePopup.classList.add('hidden');
        });
    });
}
