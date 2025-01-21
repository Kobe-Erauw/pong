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
    speed: number = 300; // px/second

    constructor(ctx: CanvasRenderingContext2D) {
        const size: Size = {w: 10, h: 80};
        const position: Position = {x: 0, y: (ctx.canvas.height - size.h) / 2}
        super(position, size, ctx);
    }

    move(direction: Direction, timeExpired: number) {
        timeExpired = timeExpired / 1000;// seconds
        if (direction === "up") {
            this.position.y -= this.speed * timeExpired;
            if (this.position.y < 0) {
                this.position.y = 0;
            }
        }
        if (direction === "down") {
            this.position.y += this.speed * timeExpired;
            if (this.position.y > this.ctx.canvas.height - this.size.h) {
                this.position.y = this.ctx.canvas.height - this.size.h;
            }
        }
    }

    draw() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.position.x, this.position.y, this.size.w, this.size.h);
    }
}