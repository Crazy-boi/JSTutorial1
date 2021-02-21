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
    p: new AVector(canvas.width/2, canvas.height/2),
    click: false
}

canvas.addEventListener("mousedown", function (event) {
    if (event.button === 2)
        return;
    mouse.click = true;
    mouse.p.set(event.x - canvasPosition.left, event.y - canvasPosition.top);
});
canvas.addEventListener("mouseup", function () {
    mouse.click = false;
});

// player
class Player {
    constructor() {
        this.p = new AVector(canvas.width/2, canvas.height/2);
        this.radius = 80;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 15;
        this.spriteHeight = 10;
    }
    update() {
        const d = AVector.sub(mouse.p, this.p);
        if (d.length() > 1) {
            this.angle = d.angle();
        }
        this.p.add(d.div(25, 24));
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
const bubbles = [];

const bubblePop0 = document.createElement("audio"); bubblePop0.src = "res/pop_mid.ogg";
const bubblePop1 = document.createElement("audio"); bubblePop1.src = "res/pop_low1.ogg";
const bubblePop2 = document.createElement("audio"); bubblePop2.src = "res/pop_low2.ogg";
const bubblePop3 = document.createElement("audio"); bubblePop3.src = "res/pop_high1.ogg";

class Bubble {
    constructor() {
        this.radius = 50;
        this.p = new AVector(Math.random() * canvas.width, canvas.height + this.radius);
        this.speed = Math.random() * 5 + 1;
        this.counted = false;
        this.sound = Math.floor(Math.random() * 4);
    }
    update() {
        this.p.sub(0, this.speed);
    }
    draw() {
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, this.radius, 0, 2*pi);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
    }
}

function handleBubbles() {
    if (gameFrame % 100 === 0) {
        bubbles.push(new Bubble());
    }
    // drawing and splicing in the same loop makes bubbles blink (cause?)
    for (let i = 0; i < bubbles.length; i++) {
        bubbles[i].update();
        bubbles[i].draw();
    }
    for (let i = 0; i < bubbles.length; i++) {
        if (bubbles[i].p.y + bubbles[i].radius < 0) {
            bubbles.splice(i, 1);
        } else if (bubbles[i].p.dist(player.p) < bubbles[i].radius + player.radius) {
            if (!bubbles[i].counted) {
                console.log(bubbles[i].sound)
                if (bubbles[i].sound === 0)
                    bubblePop0.play();
                else if (bubbles[i].sound === 1)
                    bubblePop1.play();
                else if (bubbles[i].sound === 2)
                    bubblePop2.play();
                else if (bubbles[i].sound === 3)
                    bubblePop3.play();
                score++;
                bubbles[i].counted = true;
                bubbles.splice(i, 1);
            }
        }
    }
}

// animation loop
let lastCheck = Date.now();
let checks = 0, drawFPS = 0;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    handleBubbles();

    player.update();
    player.draw();

    ctx.fillStyle = "black";
    ctx.fillText("score: " + score, 10, 50);

    gameFrame++;

    //extra stuff
    checks++;
    if (checks > 20) {
        drawFPS = Math.round(checks/((Date.now() - lastCheck)/1000.0));
        lastCheck = Date.now();
        checks = 0;
    }
    ctx.fillStyle = "black";
    ctx.fillText(drawFPS + " fps; "+bubbles.length, 10, canvas.height-20);

    requestAnimationFrame(animate);
}
animate();

// gameloopId = setInterval(gameLoop, 10);  -   https://stackoverflow.com/questions/4787431/check-fps-in-js