//window.myNameSpace = window.myNameSpace || { };
const pi = Math.PI;

// canvas setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 1280;
canvas.height = 720;

let score = 0;
let gameFrame = 0;
ctx.font = "50px Georgia";

let gameSpeed = 0.5;

// mouse interactivity
let canvasPosition = canvas.getBoundingClientRect();

const mouse = {
    p: new AVector(canvas.width/2, canvas.height/2),
    movePlayer: true
}

canvas.addEventListener("mousedown", function (event) {
    if (event.button === 2)
        return;
    mouse.movePlayer = true;
    mouse.p.set(event.x - canvasPosition.left, event.y - canvasPosition.top);
});
canvas.addEventListener("mouseup", function () {
});

// player
const playerLeft = new Image(); playerLeft.src = "res/fish_swim_left.png";
const playerRight = new Image(); playerRight.src = "res/fish_swim_flipped.png";

class Player {
    constructor() {
        this.p = new AVector(canvas.width/2, canvas.height/2);
        this.radius = 50;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 498;
        this.spriteHeight = 327;
    }
    update() {
        const d = AVector.sub(this.p, mouse.p);
        if (d.length() > 1)
            this.angle = d.angle();
        if (this.p.y < 80)
            mouse.movePlayer = false;
        if (mouse.movePlayer)
            this.p.sub(d.div(25, 24));
        if (this.p.y < 150)
            this.p.add(0, (150 - this.p.y) / 100);
    }
    draw() {
        /*ctx.lineWidth = 1.7;
        ctx.strokeStyle = "orange";
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, this.radius, 0, 2*pi);
        //ctx.closePath();
        ctx.stroke();*/
        ctx.save();
        ctx.translate(this.p.x, this.p.y);
        ctx.rotate(this.angle);
        if (this.p.x >= mouse.p.x) {
            ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight,
                -this.spriteWidth / 8, -this.spriteHeight / 7.8, this.spriteWidth / 4, this.spriteHeight / 3.8);
        } else {
            ctx.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight,
                -this.spriteWidth / 8, -this.spriteHeight / 7.8, this.spriteWidth / 4, this.spriteHeight / 3.8);
        }
        ctx.restore();
    }
}
const player = new Player();

// bubbles
const bubbles = [];

const bubbleImage = new Image(); bubbleImage.src = "res/bubble_pop.png";

let bubblePop = [];
const bpFile = ["res/pop_mid.ogg","res/pop_low1.ogg","res/pop_low2.ogg","res/pop_high1.ogg"]
for (let i = 0; i < bpFile.length; i++) {
    bubblePop.push(document.createElement("audio"));
    bubblePop[i].src = bpFile[i];
}

class Bubble {
    constructor() {
        this.radius = 50;
        this.p = new AVector(Math.random() * canvas.width, canvas.height + this.radius);
        this.speed = Math.random() * 5 + 1;
        this.sound = Math.floor(Math.random() * bpFile.length);
        this.counted = false;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.popDelay = 5;
        this.popCounter = 0;
        this.spriteWidth = 512;
        this.spriteHeight = 512;
    }
    update() {
        this.p.sub(0, this.speed);
        if (this.counted) {
            console.log(this.popCounter, this.frame, this.frameX, this.frameY)
            this.popCounter++;
            if (this.popCounter === this.popDelay && this.frame < 5) {
                this.popCounter = 0;
                this.frame++;
                this.frameX++;
                if (this.frameX === 3) {
                    this.frameX = 0;
                    this.frameY++;
                }
            }
        }
    }
    draw() {
        /*ctx.fillStyle = "blue";
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, this.radius, 0, 2*pi);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();*/
        ctx.drawImage(bubbleImage, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight,
            this.p.x - this.radius * 1.4, this.p.y - this.radius * 1.4, this.radius * 2.8, this.radius * 2.8);
    }
}

function handleBubbles() {
    if (gameFrame % 100 === 0) {
        bubbles.push(new Bubble());
    }
    for (let i = 0; i < bubbles.length; i++) {
        bubbles[i].update();
        bubbles[i].draw();
        if (bubbles[i].p.y + bubbles[i].radius < 0 ||
            (bubbles[i].frame === 5 && bubbles[i].popCounter === bubbles[i].popDelay)) {
            bubbles.splice(i, 1);
        } else if (!bubbles[i].counted && bubbles[i].p.dist(player.p) < bubbles[i].radius + player.radius) {
            //bubblePop[bubbles[i].sound].play();
            score++;
            bubbles[i].counted = true;
            bubbles[i].frame = 1;
            bubbles[i].frameX = 1;
        } else continue;
        i--;
    }
}

// repeating backgrounds
class BG {
    constructor(file, y=0, x_start=0) {
        this.img = new Image();
        this.img.src = file;
        this.x = x_start;
        this.y = y;
        this.w = canvas.width;
        this.h = canvas.height;
    }
    update(factor=1) {
        this.x -= gameSpeed * factor;
        if (this.x < -this.w)
            this.x += this.w;
    }
    draw() {
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        if (this.x !== 0)
            ctx.drawImage(this.img, this.x + this.w, this.y, this.w, this.h);
    }
}
const background = new BG("res/background.png");
const waves = new BG("res/waves.png");
const cloud1 = new BG("res/cloud1.png");
const cloud2 = new BG("res/cloud2.png");

function handleBackground() {
    background.draw();
    cloud1.update(0.6);
    cloud1.draw();
    cloud2.update(0.8);
    cloud2.draw();
    waves.update();
    waves.draw();
}

// animation loop
let lastCheck = Date.now();
let checks = 0, drawFPS = 0;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    handleBackground();

    handleBubbles();

    player.update();
    player.draw();

    ctx.fillStyle = "white";
    ctx.fillText("score: " + score, 25, canvas.height - 30);

    gameFrame++;

    //extra stuff
    /*checks++;
    if (checks > 20) {
        drawFPS = Math.round(checks/((Date.now() - lastCheck)/1000.0));
        lastCheck = Date.now();
        checks = 0;
    }
    ctx.fillStyle = "black";
    ctx.fillText(drawFPS + " fps; "+Math.round(player.angle/2/pi*360), 10, canvas.height-20);
    */

    requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", function() {
    canvasPosition = canvas.getBoundingClientRect();
});

// gameloopId = setInterval(gameLoop, 10);  -   https://stackoverflow.com/questions/4787431/check-fps-in-js