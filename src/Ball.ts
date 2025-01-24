import {Rectangle} from "./rectangle.ts";
import {Position, Size, Direction} from "./types.ts";


export class Ball extends Rectangle {
    speed: number;
    direction: Direction

    constructor(ctx: CanvasRenderingContext2D) {
        const size: Size = {w: 10, h: 10};
        const position: Position = {x: (ctx.canvas.width - size.w) / 2, y: (ctx.canvas.height - size.h) / 2}
        super(position, size, ctx);
        this.speed = 1000;
        this.direction = {x: -1, y: 0};
    }

    move(timeExpired: number) {
        this.position.x += this.direction.x * this.speed * timeExpired / 1000;
        this.position.y += this.direction.y * this.speed * timeExpired / 1000;
    }

    setDirectionFromYComponent(y: number) {
        this.direction.x = Math.sqrt(1 - Math.pow(y, 2));
        this.direction.y = y;
    }

    setDirectionFromDegrees(angle: number) {
        const rad = angle * Math.PI / 180;
        this.direction.x = Math.cos(rad);
        this.direction.y = Math.sin(rad);
    }
}