import {HighScore} from "./types.ts";

export class LeaderBoard {
    highScores: Array<HighScore> = [];
    leaderboardElement: HTMLUListElement;

    constructor(ulElement: HTMLUListElement) {
        this.leaderboardElement = ulElement;
    }

    addScore(score: HighScore) {
        this.highScores.push(score);
        this.refresh();
    }

    changeScore(score: HighScore) {
        this.highScores.forEach((highScore: HighScore) => {
            if (score.name === highScore.name) {
                highScore.score = score.score;
                highScore.date = score.date;
            }
        })
        this.refresh();
    }

    refresh() {
        this.leaderboardElement.innerHTML = "";
        this.highScores.sort((a, b) => {
            return b.score - a.score;
        }).forEach((highScore: HighScore) => {
            this.addScoreToList(highScore);
        })
    }

    addScoreToList(score: HighScore) {
        this.leaderboardElement.appendChild(this.createLI(score))
    }

    createLI(highScore: HighScore) {
        const li = document.createElement("li");
        const date: string = highScore.date as string;
        const timeDif = Date.now() - new Date(date).getTime(); // Verschil in milliseconden

        let timeAgo: string;

        if (timeDif < 1000 * 60) {
            // Minder dan een minuut geleden
            timeAgo = "a few seconds ago";
        } else if (timeDif < 1000 * 60 * 60) {
            // Minder dan een uur geleden
            const minutesAgo = Math.floor(timeDif / (1000 * 60));
            timeAgo = `${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
        } else if (timeDif < 1000 * 60 * 60 * 24) {
            // Minder dan een dag geleden
            const hoursAgo = Math.floor(timeDif / (1000 * 60 * 60));
            timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
        } else {
            // Meer dan een dag geleden
            const daysAgo = Math.floor(timeDif / (1000 * 60 * 60 * 24));
            timeAgo = `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
        }

        li.innerHTML = `${highScore.name} : ${highScore.score} [${timeAgo}]`;
        li.id = highScore.name;

        return li;
    }

}