import {Position, Size} from "./types.ts";

export class Rectangle {
    position: Position;
    size: Size;
    ctx: CanvasRenderingContext2D;
    color: string;

    constructor(position: Position, size: Size, ctx: CanvasRenderingContext2D, color: string = "black") {
        this.position = position;
        this.size = size;
        this.ctx = ctx;
        this.color = color
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.position.x, this.position.y, this.size.w, this.size.h);
    }
}
