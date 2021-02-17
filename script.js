//window.myNameSpace = window.myNameSpace || { };

const pi = Math.PI;

// canvas setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 625;

let score = 0;
let gameFrame = 0;
ctx.font = "50px Georgia";

// mouse interactivity
let canvasPosition = canvas.getBoundingClientRect();

const mouse = {
    p: new Vector(canvas.width/2, canvas.height/2),
    click: false
}

canvas.addEventListener("mousedown", function (event) {
    mouse.click = true;
    mouse.p.x = event.x - canvasPosition.left;
    mouse.p.y = event.y - canvasPosition.top;
});
canvas.addEventListener("mouseup", function () {
    mouse.click = false;
});

// player
class Player {
    constructor() {
        this.p = new Vector(canvas.width/2, canvas.height/2);
        this.radius = 80;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 15;
        this.spriteHeight = 10;
    }
    update() {
        const d = mouse.p.getSub(this.p.x, this.p.y);
        if (d.length() > 1) {
            this.angle = d.angle();
        }
        d.divXY(25, 24);
        this.p.add(d.x, d.y);
    }
    draw() {
        if (mouse.click) {
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(this.p.x, this.p.y);
            ctx.lineTo(mouse.p.x, mouse.p.y);
            ctx.stroke();
        }
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, this.radius, this.angle + pi/8, this.angle + pi*15/8);
        ctx.lineTo(this.p.x, this.p.y);
        ctx.closePath();
        ctx.fill();
    }
}
const player = new Player();

// bubbles

// animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.draw();
    requestAnimationFrame(animate);
}
animate();