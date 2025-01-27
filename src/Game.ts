import {Pallet} from "./Pallet.ts";
import {Ball} from "./Ball.ts";
import {CanvasSide, PalletDirection} from "./types.ts";
import {DBService} from "./DBService.ts";

export class Game {
    leftPallet: Pallet;
    ball: Ball;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    direction: PalletDirection = "none";
    prevTime: number;
    scoreElement: HTMLSpanElement;
    highscoreElement: HTMLSpanElement;
    score: number;
    highScore: number;
    dbService: DBService;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scoreElement: HTMLSpanElement, highScoreElement: HTMLSpanElement, dbService: DBService) {
        this.canvas = canvas;
        this.dbService = dbService;
        canvas.width = 800;
        canvas.height = 500;
        this.ctx = ctx;
        this.leftPallet = new Pallet(this.ctx);
        this.ball = new Ball(this.ctx);
        this.prevTime = performance.now();
        this.scoreElement = scoreElement;
        this.highscoreElement = highScoreElement;
        this.gameLoop = this.gameLoop.bind(this);
        this.score = 0;
        this.highScore = 0;
    }

    getAngleFromPallet(pallet: Pallet) {
        const maxAngle = 30;
        const yMiddleBall: number = this.ball.position.y + this.ball.size.h / 2;
        const yMiddlePallet: number = pallet.position.y + pallet.size.h / 2;

        const relativePosBall = yMiddlePallet - yMiddleBall;
        const factor = maxAngle / (pallet.size.h / 2);
        return relativePosBall * factor * -1;
    }

    gameLoop(timestamp: number) {
        const timeElapsed = timestamp - this.prevTime;
        this.prevTime = timestamp;

        this.leftPallet.move(this.direction, timeElapsed);
        this.ball.move(timeElapsed);

        this.checkCollisions();

        this.clearCanvas();
        this.leftPallet.draw();
        this.ball.draw();
        requestAnimationFrame(this.gameLoop);
    }

    checkCollisions() {
        if (this.ballCollidesWithPallet(this.ball, this.leftPallet)) {
            this.ball.position.x = this.leftPallet.position.x + this.leftPallet.size.w;
            this.ball.direction.x *= -1;
            this.ball.setDirectionFromDegrees(this.getAngleFromPallet(this.leftPallet));
            this.addPointToScore();
        }

        const canvasside = this.ballcollideswithcanvas(this.ball);
        if (canvasside) {
            if (canvasside == "left") {
                this.ball.position.x = 0;
                this.ball.direction.x *= -1;
                if (this.score > this.highScore) {
                    this.setHighScore(this.score);
                }
                this.resetScore();
            }
            if (canvasside == "right") {
                this.ball.position.x = this.canvas.width - this.ball.size.w;
                this.ball.direction.x *= -1;
            }
            if (canvasside == "top") {
                this.ball.position.y = 0;
                this.ball.direction.y *= -1;
            }
            if (canvasside == "bottom") {
                this.ball.position.y = this.canvas.height - this.ball.size.h;
                this.ball.direction.y *= -1;
            }
        }
    }

    ballcollideswithcanvas(ball: Ball): CanvasSide {
        if (this.ball.position.x > this.canvas.width - ball.size.w) return "right";
        if (this.ball.position.x < 0) return "left";
        if (this.ball.position.y < 0) return "top";
        if (this.ball.position.y > this.canvas.height - this.ball.size.h) return "bottom";
        return null;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    listen() {
        // Voor toetsenbord-events
        addEventListener("keydown", (e) => {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                this.direction = "up";
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                this.direction = "down";
            }
        });

        addEventListener("keyup", (e) => {
            if (e.key === "ArrowUp" && this.direction === "up") {
                this.direction = "none";
            }
            if (e.key === "ArrowDown" && this.direction === "down") {
                this.direction = "none";
            }
        });

        // Voor touch-events
        document.addEventListener("touchstart", (e) => {
            const touch = e.touches[0]; // Eerste aanraking
            const screenWidth = window.innerWidth; // Breedte van het scherm
            const touchX = touch.clientX; // X-positie van de aanraking

            // Controleer of de aanraking aan de linker- of rechterkant van het scherm is
            if (touchX < screenWidth / 2) {
                this.direction = "up"; // Linkerhelft → paddle omhoog
            } else {
                this.direction = "down"; // Rechterhelft → paddle omlaag
            }
        });

        document.addEventListener("touchend", () => {
            // Bij loslaten van de aanraking stoppen met bewegen
            this.direction = "none";
        });

        // Sta scrollen toe (touchmove mag scroll niet blokkeren)
        document.addEventListener("touchmove", (e) => {
            // Blokkeer touch-move alleen als nodig
            if (e.target === this.canvas) {
                e.preventDefault(); // Alleen voorkomen binnen canvas-element
            }
        }, {passive: true}); // Zorg dat scrollen elders mogelijk blijft
    }


    start() {
        this.listen();
        this.gameLoop(performance.now());
    }

    ballCollidesWithPallet(rec1: Ball, rec2: Pallet): boolean {
        return (rec1.position.x < rec2.position.x + rec2.size.w && rec1.position.x > rec1.position.x - rec2.size.w)
            && (rec1.position.y > rec2.position.y - rec1.size.h && rec1.position.y < rec2.position.y + rec2.size.h)
    }

    updateScoreUI() {
        this.scoreElement.textContent = this.score.toString();
    }

    resetScore() {
        this.score = 0;
        this.updateScoreUI();
        this.canvas.style.boxShadow = "0 0 20px red";
        this.canvas.style.borderColor = "red";
        this.ball.speed = 900;
    }

    private addPointToScore() {
        this.score += 1;
        this.ball.speed += 10;
        this.updateScoreUI();
        this.canvas.style.boxShadow = "0 0 20px #00ff00";
        this.canvas.style.borderColor = "#00ff00"
    }

    private setHighScore(score: number) {
        this.highScore = score;
        this.highscoreElement.textContent = this.highScore.toString();
        this.dbService.insertHighScore({name: "test3", score: this.highScore, date: null})
    }
}