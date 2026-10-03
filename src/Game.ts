import {Pallet} from "./Pallet.ts";
import {Ball} from "./Ball.ts";
import {CanvasSide, PalletDirection} from "./types.ts";
import {DBService} from "./DBService.ts";
import {WORLD_HEIGHT, WORLD_WIDTH} from "./world.ts";

export class Game {
    leftPallet: Pallet;
    ball: Ball;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    direction: PalletDirection = "none";
    touchTargetY: number | null = null;
    rotated: boolean = false;
    view: DOMMatrix = new DOMMatrix();
    prevTime: number;
    scoreElement: HTMLSpanElement;
    highscoreElement: HTMLSpanElement;
    score: number;
    highScore: number;
    dbService: DBService;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scoreElement: HTMLSpanElement,
                highScoreElement: HTMLSpanElement, dbService: DBService, highScore: number) {
        this.canvas = canvas;
        this.dbService = dbService;
        this.ctx = ctx;
        this.leftPallet = new Pallet(this.ctx);
        this.ball = new Ball(this.ctx);
        this.prevTime = performance.now();
        this.scoreElement = scoreElement;
        this.highscoreElement = highScoreElement;
        this.gameLoop = this.gameLoop.bind(this);
        this.score = 0;
        this.highScore = highScore;
        this.setHighScore(highScore);
        this.resize();
        new ResizeObserver(() => this.resize()).observe(canvas.parentElement as HTMLElement);
    }

    // Past het canvas aan de beschikbare ruimte aan. Op een staand scherm wordt het speelveld
    // 90° gedraaid getekend (paddle onderaan) zodat het de hoogte van het scherm benut.
    resize() {
        const container = this.canvas.parentElement as HTMLElement;
        const style = getComputedStyle(container);
        const border = this.canvas.offsetWidth - this.canvas.clientWidth;
        const availW = container.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - border;
        let availH = container.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - border;
        for (const child of Array.from(container.children)) {
            if (child !== this.canvas) availH -= (child as HTMLElement).offsetHeight; // o.a. de score-balk
        }
        const scaleNormal = Math.min(availW / WORLD_WIDTH, availH / WORLD_HEIGHT, 1);
        const scaleRotated = Math.min(availW / WORLD_HEIGHT, availH / WORLD_WIDTH, 1);
        this.rotated = scaleRotated > scaleNormal;

        const fieldW = this.rotated ? WORLD_HEIGHT : WORLD_WIDTH;
        const fieldH = this.rotated ? WORLD_WIDTH : WORLD_HEIGHT;
        const scale = Math.max(scaleNormal, scaleRotated, 0);
        const cssW = Math.floor(fieldW * scale);
        const cssH = Math.floor(fieldH * scale);
        this.canvas.style.width = `${cssW}px`;
        this.canvas.style.height = `${cssH}px`;
        document.documentElement.style.setProperty("--court-width", `${cssW + border}px`);

        // Tekenen op de echte schermresolutie zodat het scherp blijft op retina-schermen
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = Math.round(cssW * dpr);
        this.canvas.height = Math.round(cssH * dpr);
        const sx = this.canvas.width / fieldW;
        const sy = this.canvas.height / fieldH;
        this.view = this.rotated
            ? new DOMMatrix([0, -sy, sx, 0, 0, this.canvas.height])
            : new DOMMatrix([sx, 0, 0, sy, 0, 0]);
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
        // Begrens de tijdstap zodat de bal niet wegspringt na een pauze (bv. app op de achtergrond)
        const timeElapsed = Math.min(timestamp - this.prevTime, 100);
        this.prevTime = timestamp;

        if (this.touchTargetY !== null) {
            this.leftPallet.moveTowards(this.touchTargetY, timeElapsed);
        } else {
            this.leftPallet.move(this.direction, timeElapsed);
        }
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
                this.ball.position.x = WORLD_WIDTH - this.ball.size.w;
                this.ball.direction.x *= -1;
            }
            if (canvasside == "top") {
                this.ball.position.y = 0;
                this.ball.direction.y *= -1;
            }
            if (canvasside == "bottom") {
                this.ball.position.y = WORLD_HEIGHT - this.ball.size.h;
                this.ball.direction.y *= -1;
            }
        }
    }

    ballcollideswithcanvas(ball: Ball): CanvasSide {
        if (this.ball.position.x > WORLD_WIDTH - ball.size.w) return "right";
        if (this.ball.position.x < 0) return "left";
        if (this.ball.position.y < 0) return "top";
        if (this.ball.position.y > WORLD_HEIGHT - this.ball.size.h) return "bottom";
        return null;
    }

    clearCanvas() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.setTransform(this.view);
    }

    // Zet een aanraking om naar een y-positie in het speelveld
    touchToWorldY(touch: Touch): number {
        const rect = this.canvas.getBoundingClientRect();
        if (this.rotated) {
            return (touch.clientX - rect.left - this.canvas.clientLeft) / this.canvas.clientWidth * WORLD_HEIGHT;
        }
        return (touch.clientY - rect.top - this.canvas.clientTop) / this.canvas.clientHeight * WORLD_HEIGHT;
    }

    listen() {
        // Voor toetsenbord-events
        addEventListener("keydown", (e) => {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                this.direction = "up";
                this.touchTargetY = null;
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                this.direction = "down";
                this.touchTargetY = null;
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

        // Voor touch-events: de paddle beweegt naar de plek waar je het speelveld aanraakt
        const onTouch = (e: TouchEvent) => {
            e.preventDefault(); // Niet scrollen of zoomen tijdens het spelen
            const touch = e.targetTouches[0];
            if (touch) {
                this.touchTargetY = this.touchToWorldY(touch);
            }
        };
        this.canvas.addEventListener("touchstart", onTouch, {passive: false});
        this.canvas.addEventListener("touchmove", onTouch, {passive: false});
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