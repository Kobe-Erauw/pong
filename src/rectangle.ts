import {Position, Size} from "./types.ts";

export class Rectangle {
    position: Position;
    size: Size;

    constructor(position: Position, size: Size) {
        this.position = position;
        this.size = size;
    }


}

export class Palet extends Rectangle {
    constructor() {
        const h = 80;
        super({});
    }
}