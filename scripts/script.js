const canvas = document.getElementById('party-popper');
const ctx = canvas.getContext('2d');
const btn = document.getElementById('trigger');
const parentElement = canvas.parentElement;

let animationRunning = false;
let particles = [];
let bombs = [];
let fps = 60;
let randomThreshold = 0.04;
let lastTimestamp = 0;

const resizeCanvas = () => {
    const { clientWidth, clientHeight } = parentElement;
    canvas.width = clientWidth;
    canvas.height = clientHeight;
};

const Dbug = (message) => {
    console.log(message);
}

class ConfettiBombParticleType1 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.shape = Math.random() > 0.5 ? "square" : "circle";
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 8 - 4;
        this.speedY = Math.random() * 6 - 6;
        this.gravity = 0.1;
        this.opacity = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.2 - 0.05;
    }

    update(deltaTime) {
        let timeDelay = deltaTime * fps;
        this.x += this.speedX * timeDelay;
        this.y += this.speedY * timeDelay;
        this.speedY += this.gravity * timeDelay;
        this.opacity -= (Math.random() * 0.002 + 0.008) * timeDelay;
        this.rotation += this.rotationSpeed * timeDelay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(this.opacity, 0);
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        if (this.shape === "square") {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.restore();
    }
}

class ConfettiBombParticleType2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = `hsl(${Math.random() * 40 + 60}, 100%, 50%)`;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 4;
        this.gravity = 0.03;
        this.opacity = 1;
    }

    update(deltaTime) {
        let timeDelay = deltaTime * fps;
        this.x += this.speedX * timeDelay;
        this.y += this.speedY * timeDelay;
        this.speedY += this.gravity * timeDelay;
        this.opacity -= (Math.random() * 0.01 + 0.02) * timeDelay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(this.opacity, 0);
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
}

class ConfettiBombParticleType3 {
    constructor(x, y, angle, color, shell) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 0;
        this.color = color;
        this.size = 0.5;
        this.opacity = 1;
        this.shell = shell;
    }

    update(deltaTime) {
        let timeDelay = deltaTime * fps;
        const distance = this.speed * (this.shell + 1) * timeDelay;
        this.x += Math.cos(this.angle) * this.speed * timeDelay;
        this.y += Math.sin(this.angle) * this.speed * timeDelay;
        this.size += (this.shell / 50) * timeDelay;
        this.speed += (this.shell / 100) * timeDelay;
        this.opacity -= (0.008 + (this.shell / 1000)) * timeDelay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(this.opacity, 0);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
}

class ConfettiBombParticleType4 {
    constructor(x, y, angle, speed, color, shell) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = Math.random() * 3;
        this.color = color;
        this.opacity = 1;
        this.radius = 2;
        this.shell = shell;
    }

    update(deltaTime) {
        let timeDelay = deltaTime * fps;
        this.x += this.speed * Math.cos(this.angle) * timeDelay;
        this.y += this.speed * Math.sin(this.angle) * timeDelay;
        this.speed += this.shell / 200 * timeDelay;

        this.opacity -= 0.01 * timeDelay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
}

const sounds = [
    'sound/explosion-1.mp3',
    'sound/explosion-2.mp3',
    'sound/explosion-3.mp3',
    'sound/explosion-4.mp3',
    'sound/explosion-5.mp3',
    'sound/explosion-6.mp3',
    'sound/explosion-7.mp3'
];

function playBurstSound(soundTrackPath) {
    const audio = new Audio(soundTrackPath);
    audio.volume = 1; // Set volume (0.0 to 1.0)
    audio.play();
    audio.addEventListener("ended", () => {
        audio.remove();
    });
}

class ConfettiBomb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.upSpeed = Math.random() * 8 + 4;
        this.upTilt = Math.random() * 4 - 2;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.size = Math.random() * 4 + 4;
        this.opacity = 1;
        this.gravity = 0.1;
        // this.hasBurst = false;
    }

    update(deltaTime) {
        let timeGap = deltaTime * fps; //for 60 fps
        this.x += this.upTilt * timeGap;
        this.y -= this.upSpeed * timeGap;
        this.upSpeed -= this.gravity * timeGap;
        this.opacity -= (Math.random() * 0.02 + 0.01) * timeGap;

        // if (this.upSpeed <= 0 && !this.hasBurst) {
        //     playRandomBurstSound();
        //     this.hasBurst = true;
        // }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(this.opacity, 0);
        ctx.fillStyle = this.color;
        [0, 1, 2].forEach(i => {
            ctx.beginPath();
            ctx.arc(this.x - i * this.upTilt, this.y + this.upSpeed * i * this.size / 2, this.size - i * this.size / 4, 0, 2 * Math.PI);
            ctx.fill();
        });
        ctx.restore();
    }
}

const createConfettiParticles = (x, y) => {

    let type = Math.floor(Math.random() * 4 + 1);

    if (type == 1) {
        for (let i = 0; i < 100; i++) {
            particles.push(new ConfettiBombParticleType1(x, y));
        }
        playBurstSound(sounds[3]);
        // console.log("type-1");
    } else if (type == 2) {
        for (let i = 0; i < 100; i++) {
            particles.push(new ConfettiBombParticleType2(x, y));
        }
        playBurstSound(sounds[2]);
        // console.log("type-2");
    } else if (type == 3) {
        // console.log("type-3");
        const shellCount = Math.floor(Math.random() * 3 + 4);
        const particleCount = Math.floor(Math.random() * 5 + 15);
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        for (let shell = 1; shell <= shellCount; shell++) {
            for (let i = 0; i < particleCount; i++) {
                const angle = (2 * Math.PI / particleCount) * i;
                particles.push(new ConfettiBombParticleType3(x, y, angle, color, shell));
            }
        }
        playBurstSound(sounds[Math.floor(Math.random() * 2)]);
    } else if (type == 4) {
        // console.log("type-4");
        const shellCount = Math.random() * 1 + 2;
        for (let shell = 1; shell <= shellCount; shell++) {
            const particleCount = Math.random() * 20 + 30;
            const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            for (let i = 0; i < particleCount; i++) {

                const angle = (2 * Math.PI / particleCount) * i;
                const speed = Math.random() * 3;
                particles.push(new ConfettiBombParticleType4(x, y, angle, speed, color, shell));
            }
        }
        playBurstSound(sounds[Math.floor(Math.random() * 3 + 4)]);
    }
};

const createConfettiBombs = (x, y) => {
    bombs.push(new ConfettiBomb(x, y));
};

const animate = (timestamp) => {
    // console.log('timestamp', timestamp);


    if (!animationRunning) return;
    let deltaTime = 0;

    if (lastTimestamp) {
        deltaTime = (timestamp - lastTimestamp) / 1000; // Time since last frame in seconds
    }
    // Dbug(deltaTime);

    lastTimestamp = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.opacity > 0.01);

    if (Math.random() < randomThreshold) {
        createConfettiBombs(Math.random() * (canvas.width - 200) + 100, canvas.height - 20);
    }

    bombs.forEach(b => {
        b.update(deltaTime);
        b.draw(ctx);
        if (b.upSpeed <= 0) createConfettiParticles(b.x, b.y);
    });

    particles.forEach(p => {
        p.update(deltaTime);
        p.draw(ctx);
    });

    bombs = bombs.filter(b => b.upSpeed > 0);
    requestAnimationFrame(animate);
};

btn.addEventListener('click', () => {
    animationRunning = !animationRunning;
    btn.textContent = animationRunning ? "Stop" : "Start";
    lastTimestamp = 0;
    if (animationRunning) {
        animate();
    }
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();