import {Direction, Position, Size} from "./types.ts";

export class Rectangle {
    position: Position;
    size: Size;
    ctx: CanvasRenderingContext2D;

    constructor(position: Position, size: Size, ctx: CanvasRenderingContext2D) {
        this.position = position;
        this.size = size;
        this.ctx = ctx;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "black";
        ctx.fillRect(this.position.x, this.position.y, this.size.w, this.size.h);
    }


}

export class Pallet extends Rectangle {
    speed: number = 2;

    constructor(ctx: CanvasRenderingContext2D) {
        const size: Size = {w: 10, h: 80};
        const position: Position = {x: 0, y: (500 - size.h) / 2}
        super(position, size, ctx);
    }

    move(direction: Direction) {
        if (direction === "up") {
            this.position.y -= this.speed;
        }
        if (direction === "down") {
            this.position.y += this.speed;
        }
    }

    draw() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.position.x, this.position.y, this.size.w, this.size.h);
    }
}