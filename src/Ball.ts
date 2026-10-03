import {Rectangle} from "./rectangle.ts";
import {Position, Size, Direction} from "./types.ts";
import {WORLD_HEIGHT, WORLD_WIDTH} from "./world.ts";


export class Ball extends Rectangle {
    speed: number;
    direction: Direction

    constructor(ctx: CanvasRenderingContext2D) {
        const size: Size = {w: 15, h: 15};
        const position: Position = {x: (WORLD_WIDTH - size.w) / 2, y: (WORLD_HEIGHT - size.h) / 2}
        super(position, size, ctx, "#FF7043");
        this.speed = 900;
        this.direction = {x: -1, y: 0};
        this.setDirectionFromDegrees(1);
    }

    move(timeExpired: number) {
        this.position.x += this.direction.x * this.speed * timeExpired / 1000;
        this.position.y += this.direction.y * this.speed * timeExpired / 1000;
    }

    setDirectionFromDegrees(angle: number) {
        const rad = angle * Math.PI / 180;
        this.direction.x = Math.cos(rad);
        this.direction.y = Math.sin(rad);
    }
}