import {Rectangle} from "./rectangle.ts";
import {PalletDirection, Position, Size} from "./types.ts";

export class Pallet extends Rectangle {
    speed: number = 300; // px/second

    constructor(ctx: CanvasRenderingContext2D) {
        const size: Size = {w: 10, h: 100};
        const position: Position = {x: 0, y: (ctx.canvas.height - size.h) / 2}
        super(position, size, ctx, "#A5D6A7");
    }

    move(direction: PalletDirection, timeExpired: number) {
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
}