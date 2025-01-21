import {Pallet} from "./rectangle.ts";
import {Direction} from "./types.ts";

const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = 800;
canvas.height = 500;


class Game {
    leftPallet: Pallet;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    direction: Direction = "none";
    prevTime: number;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.leftPallet = new Pallet(this.ctx);
        this.prevTime = performance.now();

        this.gameLoop = this.gameLoop.bind(this);
    }

    gameLoop(timestamp: number) {
        const timeElapsed = timestamp - this.prevTime;
        this.prevTime = timestamp;

        this.leftPallet.move(this.direction, timeElapsed);
        this.clearCanvas();
        this.leftPallet.draw();
        requestAnimationFrame(this.gameLoop);
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
}

const game: Game = new Game(canvas, ctx);
game.start();






