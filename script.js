//window.myNameSpace = window.myNameSpace || { };
const pi = Math.PI;

// canvas setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 1280;
canvas.height = 720;

let score = 0, missed = 0;
let gameOver = false, gameOverAtMissed = 20;
let resetClick = 0;
const resetClicksNeeded = 5;

let gameFrame = 0;
ctx.font = "50px Georgia";

const gameSpeed0 = 0.5;
let gameSpeed = gameSpeed0;

// mouse interactivity
let canvasPosition = canvas.getBoundingClientRect();

const mouse = {
    p: new AVector(canvas.width/2, canvas.height/2),
    movePlayer: true
}

canvas.addEventListener("mousedown", function (event) {
    if (event.button === 2)
        return;
    if (gameOver) {
        if (resetClick < resetClicksNeeded-1) {
            resetClick++;
            return;
        } else resetClick = 0;
        gameOver = false;
        score = 0;
        missed = 0;
        gameSpeed = gameSpeed0;
        gameFrame = 0;
        mouse.p.set(canvas.width/2, canvas.height/2);
        player.p.set(canvas.width/2, canvas.height/2);
        player.angle = 0;
        bubbles = [];
        return;
    }
    mouse.movePlayer = true;
    mouse.p.set(event.x - canvasPosition.left, event.y - canvasPosition.top);
});

// player
const playerLeft = new Image(); playerLeft.src = "res/fish_swim_left.png";
const playerRight = new Image(); playerRight.src = "res/fish_swim_flipped.png";

class Player {
    constructor() {
        this.p = new AVector(canvas.width/2, canvas.height/2);
        this.radius = 50;
        this.angle = 0;
        this.speedDiv = 25;
        this.frameX = 0;
        this.frameY = 0;
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
            this.p.sub(d.div(this.speedDiv, this.speedDiv - 1));
        if (this.p.y < 150)
            this.p.add(0, (150 - this.p.y) / 100);

        if (gameFrame % Math.round(this.speedDiv / 2) === 0) {
            this.frameX++;
            this.frameY += this.frameX > 3 ? 1 : 0;
            this.frameX %= 4;
            this.frameY %= 3;
        }
    }
    draw() {
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
let bubbles = [];

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
        this.speed = Math.random() * 3 + 1 + gameSpeed;
        this.sound = Math.floor(Math.random() * bpFile.length);
        this.counted = false;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.popDelay = Math.floor(Math.random() * 6 + 4);
        this.spriteWidth = 512;
        this.spriteHeight = 512;
    }
    update() {
        this.p.sub(0, this.speed);
        if (this.counted) {
            if (gameFrame % this.popDelay === 0 && this.frame < 5) {
                this.frame++;
                this.frameX++;
                this.frameY += this.frameX > 2 ? 1 : 0;
                this.frameX %= 3;
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
            (bubbles[i].frame === 5 && gameFrame % bubbles[i].popDelay === 1)) {
            if (!bubbles[i].counted) {
                missed++;
                if (missed === gameOverAtMissed) {      // Game over
                    gameOver = true;
                    let s = document.cookie;
                    if (s == null || !s.includes("highscore") || s.split("=")[1] < score)
                        document.cookie = "highscore=" + score;
                    console.log(s)
                }
            }
            bubbles.splice(i, 1);
        } else if (!bubbles[i].counted && bubbles[i].p.dist(player.p) < bubbles[i].radius + player.radius) {
            bubblePop[bubbles[i].sound].play();
            score++;
            gameSpeed += 0.01;

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
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.002)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgb(72,189,210)";
        ctx.fillRect(300, 170, 600, 400);
        ctx.fillStyle = "white";
        ctx.fillText("Game Over", canvas.width/2 - 220, canvas.height/2 - 100);
        let highScore = document.cookie.split("=")[1];
        let msg = highScore > score ? "Highscore: "+highScore : "New Highscore!";
        ctx.fillText(msg, canvas.width/2 - 220, canvas.height/2);
        ctx.fillText("[click "+(resetClicksNeeded-resetClick)+" times]", canvas.width/2 - 220, canvas.height/2 + 130);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        handleBackground();

        handleBubbles();

        player.update();
        player.draw();

        ctx.fillStyle = "white";
        ctx.fillText("score: " + score, 25, canvas.height - 90);
        ctx.fillText("missed: " + missed + "/" + gameOverAtMissed, 25, canvas.height - 30);

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
    }

    requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", function() {
    canvasPosition = canvas.getBoundingClientRect();
});

// gameloopId = setInterval(gameLoop, 10);  -   https://stackoverflow.com/questions/4787431/check-fps-in-js