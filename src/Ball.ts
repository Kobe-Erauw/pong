import {Rectangle} from "./rectangle.ts";
import {Position, Size, Speed} from "./types.ts";


export class Ball extends Rectangle {
    speed: Speed;

    constructor(ctx: CanvasRenderingContext2D) {
        const size: Size = {w: 10, h: 10};
        const position: Position = {x: (ctx.canvas.width - size.w) / 2, y: (ctx.canvas.height - size.h) / 2}
        super(position, size, ctx);
        this.speed = {dx: -80, dy: 0};
    }

    move(timeExpired: number) {
        this.position.x += this.speed.dx * timeExpired / 1000;
        this.position.y += this.speed.dy * timeExpired / 1000
    }
}