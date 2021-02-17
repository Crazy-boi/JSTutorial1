//window.myNameSpace = window.myNameSpace || { };

// LOOK AT https://gist.github.com/winduptoy/a1aa09c3499e09edbd33 WHEN MORE ADVANCED

class Vector {
    constructor(x, y) {
        this.x = parseFloat(x) || 0;
        this.y = parseFloat(y) || 0;
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

    add(x, y) {
        this.x += x;
        this.y += y;
    }
    /*getAdd(v) {
        if (v instanceof Vector) {
            return new Vector(this.x + v.x, this.y + v.y);
        }
    }*/
    getAdd(x, y) {
        return new Vector(this.x + x, this.y + y);
    }

    sub(x, y) {
        this.x -= x;
        this.y -= y;
    }
    /*getSub(v) {
        if (v instanceof Vector) {
            return new Vector(this.x - v.x, this.y - v.y);
        }
    }*/
    getSub(x, y) {
        return new Vector(this.x - x, this.y - y);
    }

    mult(s) {
        this.x *= s;
        this.y *= s;
    }
    getMult(s) {
        return new Vector(this.x * s, this.y * s);
    }

    div(s) {
        this.x /= s;
        this.y /= s;
    }
    divXY(s1, s2) {
        this.x /= s1;
        this.y /= s2;
    }
    getDiv(s) {
        return new Vector(this.x / s, this.y / s);
    }

    normalize() {
        let l = this.length();
        this.x /= l;
        this.y /= l;
    }

    limit(l) {
        if (this.length() > l) {
            this.normalize();
            this.mult(l);
        }
    }

    dot(v) {
        if (v instanceof Vector)
            return this.x * v.x + this.y * v.y;
    }

    angleTo(v) {
        if (v instanceof Vector) {
            let a = Math.abs(v.angle() - this.angle());
            if (a > pi)
                a = 2*pi - a;
            return a;
        }
    }
}