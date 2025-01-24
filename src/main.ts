import {Pallet} from "./rectangle.ts";
import {CanvasSide, PalletDirection} from "./types.ts";
import {Ball} from "./Ball.ts";

const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = 800;
canvas.height = 500;


class Game {
    leftPallet: Pallet;
    ball: Ball;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    direction: PalletDirection = "none";
    prevTime: number;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.leftPallet = new Pallet(this.ctx);
        this.ball = new Ball(this.ctx);
        this.prevTime = performance.now();

        this.gameLoop = this.gameLoop.bind(this);
    }

    gameLoop(timestamp: number) {
        const timeElapsed = timestamp - this.prevTime;
        this.prevTime = timestamp;

        this.leftPallet.move(this.direction, timeElapsed);
        this.ball.move(timeElapsed);

        if (this.ballCollidesWithPallet(this.ball, this.leftPallet)) {
            this.ball.position.x = this.leftPallet.position.x + this.leftPallet.size.w;
            this.ball.speed.dx *= -1
        }

        const canvasSide = this.ballCollidesWithCanvas(this.ball);
        if (canvasSide) {
            if (canvasSide == "left") {
                this.ball.position.x = 0;
                this.ball.speed.dx *= -1;
            }
            if (canvasSide == "right") {
                this.ball.position.x = this.canvas.width - this.ball.size.w;
                this.ball.speed.dx *= -1;
            }
            if (canvasSide == "top") {
                this.ball.position.y = 0;
                this.ball.speed.dy *= -1;
            }
            if (canvasSide == "bottom") {
                this.ball.position.y = this.canvas.height - this.ball.size.h;
                this.ball.speed.dy *= -1;
            }
        }
        this.clearCanvas();
        this.leftPallet.draw();
        this.ball.draw();
        requestAnimationFrame(this.gameLoop);
    }

    ballCollidesWithCanvas(ball: Ball): CanvasSide {
        if (this.ball.position.x > canvas.width - ball.size.w) return "right";
        if (this.ball.position.x < 0) return "left";
        if (this.ball.position.y < 0) return "top";
        if (this.ball.position.y > canvas.height - this.ball.size.h) return "bottom";
        return null;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    listen() {
        addEventListener("keydown", (e) => {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                this.direction = "up";
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                this.direction = "down";
            }
        })

        addEventListener("keyup", (e) => {
            if (e.key === "ArrowUp" && this.direction === "up") {
                this.direction = "none";
            }
            if (e.key === "ArrowDown" && this.direction === "down") {
                this.direction = "none";
            }
        });
    }

    start() {
        this.listen();
        this.gameLoop(performance.now());
    }

    ballCollidesWithPallet(rec1: Ball, rec2: Pallet): boolean {
        return (rec1.position.x < rec2.position.x + rec2.size.w && rec1.position.x > rec1.position.x - rec2.size.w)
            && (rec1.position.y > rec2.position.y - rec1.size.h && rec1.position.y < rec2.position.y + rec2.size.h)
    }
}

const game: Game = new Game(canvas, ctx);
game.start();
