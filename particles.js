import { RAINBOW_COLORS } from './constants.js';

export class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 50;
        this.color = RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)];
        this.size = 4;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.size = (this.life / 50) * 4;
        return this.life <= 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / 50;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class GlitterParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8 - Math.random() * 5;
        this.gravity = 0.2;
    }

    update() {
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.rotationSpeed;
        this.life--;
        return this.life <= 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.life / 50;
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

export class TrailParticle extends Particle {
    constructor(x, y, color) {
        super(x, y);
        this.color = color;
        this.alpha = 0.5;
    }

    update() {
        this.alpha -= 0.02;
        this.size *= 0.95;
        return this.alpha <= 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class HeartParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.scale = Math.random() * 0.5 + 0.5;
        this.rotation = Math.random() * Math.PI * 2;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.life / 50;
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, '#ff69b4');
        gradient.addColorStop(1, 'rgba(255, 105, 180, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, this.size * 0.3);
        ctx.bezierCurveTo(
            this.size * 0.5, -this.size * 0.3,
            this.size, this.size * 0.3,
            0, this.size
        );
        ctx.bezierCurveTo(
            -this.size, this.size * 0.3,
            -this.size * 0.5, -this.size * 0.3,
            0, this.size * 0.3
        );
        ctx.fill();
        
        ctx.restore();
    }
} 