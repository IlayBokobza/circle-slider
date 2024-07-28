export class Point {
    x: number;
    y: number;

    static zero = new Point(0, 0)

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    floor() {
        this.x = Math.floor(this.x)
        this.y = Math.floor(this.y)
        return this;
    }

    distance(p: Point) {
        return Math.sqrt((p.x - this.x) ** 2 + (p.y - this.y) ** 2)
    }

    round() {
        this.x = Math.floor(this.x)
        this.y = Math.round(this.y)
        return this;
    }

    ceil() {
        this.x = Math.ceil(this.x)
        this.y = Math.ceil(this.y)
        return this;
    }
}