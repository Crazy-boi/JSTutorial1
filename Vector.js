//window.myNameSpace = window.myNameSpace || { };

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    angle() {
        let a = Math.atan(this.y / this.x);
        if (this.x < 0)
            a += pi;
        if (a < 0)
            a = Math.PI*2 + a;
        return a;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    add(v) {
        if (v instanceof Vector) {

        }
    }
    add(x, y) {
        this.x += x;
        this.y += y;
    }
}