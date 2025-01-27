import {Game} from "./Game.ts";
import {DBService} from "./DBService.ts";
import {LeaderBoard} from "./LeaderBoard.ts";
import {CookieService} from "./CookieService.ts";

const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
const scoreElement: HTMLSpanElement = document.querySelector("#score") as HTMLSpanElement;
const highScoreElement: HTMLSpanElement = document.querySelector("#high-score") as HTMLSpanElement;
const leaderboardElement: HTMLUListElement = document.querySelector("#leaderboard-list") as HTMLUListElement;
const usernamePopup = document.querySelector('.usernamePopup') as HTMLDivElement;
const usernameForm = document.querySelector('#usernameForm') as HTMLFormElement;

const leaderBoard = new LeaderBoard(leaderboardElement);
const dbService = new DBService(leaderBoard);
const cookieService: CookieService = new CookieService();

let highScore = 0;
usernamePopup.classList.remove('visible');
usernamePopup.classList.add('hidden');

// Controleer of de username bestaat
const username = cookieService.getUsernameCookie();
if (!username) {
    showUsernamePopup();
} else {
    dbService.getScoreFromUsername(username).then(scoreSnap => {
        if (scoreSnap) {
            console.log(scoreSnap.val())
            highScore = scoreSnap.val().score as number;
            StartGame(username, highScore);
        }
    });
}


// Functie om de game te starten
function StartGame(username: string, highScore: number) {
    const game = new Game(canvas, ctx, scoreElement, highScoreElement, dbService, highScore);
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
        const username = usernameInput.value.trim();

        dbService.getScoreFromUsername(username).then(scoreSnap => {
            cookieService.setUsernameCookie(username);
            if (scoreSnap.val()) {
                console.log("de user bestaat al in de db")
                highScore = scoreSnap.val().score as number;
                StartGame(username, highScore);
            } else {
                console.log("nieuwe user in db gezet")
                dbService.insertHighScore({name: username, score: 0, date: null});
                StartGame(username, 0);
            }
            usernamePopup.classList.remove('visible');
            usernamePopup.classList.add('hidden');
        });
    });
}
