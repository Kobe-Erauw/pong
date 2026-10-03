import {getDatabase, ref, set, get, onChildAdded, onChildChanged} from "firebase/database";
import {initializeApp} from "firebase/app";
import {HighScore, HighScoreData} from "./types.ts";
import {LeaderBoard} from "./LeaderBoard.ts";
import {CookieService} from "./CookieService.ts";

export class DBService {
    conf = {
        apiKey: "AIzaSyCveUvd1JNmVFlXtpM_wWdwE-VXOhTbix0",
        authDomain: "pong-9f123.firebaseapp.com",
        projectId: "pong-9f123",
        storageBucket: "pong-9f123.firebasestorage.app",
        messagingSenderId: "1072619985783",
        appId: "1:1072619985783:web:340fe329760a8276eadf72",
        databaseURL: "https://pong-9f123-default-rtdb.europe-west1.firebasedatabase.app/",
    };

    db;

    leaderBoard: LeaderBoard;
    username: string | null;

    constructor(leaderBoard: LeaderBoard) {
        const app = initializeApp(this.conf);
        this.db = getDatabase(app);
        this.leaderBoard = leaderBoard;
        this.username = null;
    }

    // Zoekt een bestaande gebruiker zonder op hoofdletters te letten (kobe vindt Kobe)
    async findUser(username: string): Promise<HighScore | null> {
        const snapshot = await get(ref(this.db, "highScores"));
        const matches: Array<HighScore> = [];
        snapshot.forEach((child) => {
            const name = child.key as string;
            if (name.toLowerCase() === username.toLowerCase()) {
                const data: HighScoreData = child.val();
                matches.push({name, score: data.score, date: data.date});
            }
        });
        // Bestaan er van vroeger meerdere varianten (kobe én Kobe): exact dezelfde schrijfwijze eerst,
        // anders die met de hoogste score
        return matches.find((match) => match.name === username)
            ?? matches.sort((a, b) => b.score - a.score)[0]
            ?? null;
    }

    insertHighScore(highScore: HighScore) {
        set(ref(this.db, "highScores/" + this.getUsername()), {
            score: highScore.score,
            date: new Date().toISOString(),
        }).then();
    }

    getUsername(): string {
        if (this.username) {
            return this.username;
        }
        const cookieService = new CookieService();
        const userName = cookieService.getUsernameCookie();
        if (!userName) {
            throw "Could not find user name";
        }
        return cookieService.getUsernameCookie() as string;
    }

    listenForChanges() {
        onChildAdded(ref(this.db, "highScores/"), (snapshot) => {
            const data: HighScoreData = snapshot.val();
            const name: string = snapshot.key as string;
            const highScore: HighScore = {name, score: data.score, date: data.date}
            console.log(highScore);
            this.leaderBoard.addScore(highScore);
        })
        onChildChanged(ref(this.db, "highScores/"), (snapshot) => {
            const data: HighScoreData = snapshot.val();
            const name: string = snapshot.key as string;
            const highScore: HighScore = {name, score: data.score, date: data.date}
            console.log(highScore);
            this.leaderBoard.changeScore(highScore);
        })
    }
}