import {Position, Size} from "./types.ts";

export class Rectangle {
    position: Position;
    size: Size;
    ctx: CanvasRenderingContext2D;

    constructor(position: Position, size: Size, ctx: CanvasRenderingContext2D) {
        this.position = position;
        this.size = size;
        this.ctx = ctx;
    }

    draw(color: string = "black") {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(this.position.x, this.position.y, this.size.w, this.size.h);
    }
}
