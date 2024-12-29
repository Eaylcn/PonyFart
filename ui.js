// UI bileşenleri
export class ModernButton {
    constructor(x, y, width, height, text, description = '') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.description = description;
        this.isHovered = false;
        this.isSelected = false;
        this.hoverProgress = 0;
        this.clickProgress = 0;
    }

    update(mouseX, mouseY) {
        const wasHovered = this.isHovered;
        this.isHovered = this.containsPoint(mouseX, mouseY);
        
        if (this.isHovered && !wasHovered) {
            this.hoverProgress = 0;
        }
        if (this.isHovered) {
            this.hoverProgress = Math.min(1, this.hoverProgress + 0.1);
        } else {
            this.hoverProgress = Math.max(0, this.hoverProgress - 0.1);
        }
        
        if (this.clickProgress > 0) {
            this.clickProgress = Math.max(0, this.clickProgress - 0.1);
        }
    }

    draw(ctx) {
        ctx.save();
        
        if (this.hoverProgress > 0 || this.isSelected) {
            ctx.shadowColor = '#ff69b4';
            ctx.shadowBlur = 20 * this.hoverProgress;
        }
        
        const gradient = ctx.createLinearGradient(
            this.x, this.y,
            this.x, this.y + this.height
        );
        
        if (this.isSelected) {
            gradient.addColorStop(0, '#ff69b4');
            gradient.addColorStop(1, '#ff8da1');
        } else {
            gradient.addColorStop(0, `rgba(255, 105, 180, ${0.7 + this.hoverProgress * 0.3})`);
            gradient.addColorStop(1, `rgba(255, 182, 193, ${0.7 + this.hoverProgress * 0.3})`);
        }
        
        ctx.fillStyle = gradient;
        roundRect(ctx, this.x, this.y, this.width, this.height, 15);
        ctx.fill();
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + this.hoverProgress * 0.4})`;
        ctx.lineWidth = 2;
        roundRect(ctx, this.x, this.y, this.width, this.height, 15);
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = `bold ${this.height * 0.4}px "Comic Sans MS"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.width/2, this.y + this.height/2);
        
        if (this.isHovered && this.description) {
            ctx.font = `${this.height * 0.25}px "Comic Sans MS"`;
            ctx.fillStyle = `rgba(255, 255, 255, ${this.hoverProgress})`;
            ctx.fillText(this.description, this.x + this.width/2, this.y + this.height + 20);
        }
        
        ctx.restore();
    }

    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
}

export class CharacterCard {
    constructor(x, y, width, height, variant, name, image) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.variant = variant;
        this.name = name;
        this.image = image;
        this.isHovered = false;
        this.isSelected = false;
        this.hoverProgress = 0;
        this.bounceOffset = 0;
    }

    update(mouseX, mouseY) {
        const wasHovered = this.isHovered;
        this.isHovered = this.containsPoint(mouseX, mouseY);
        
        if (this.isHovered && !wasHovered) {
            this.hoverProgress = 0;
        }
        if (this.isHovered) {
            this.hoverProgress = Math.min(1, this.hoverProgress + 0.1);
        } else {
            this.hoverProgress = Math.max(0, this.hoverProgress - 0.1);
        }
        
        this.bounceOffset = Math.sin(Date.now() / 500) * 3 * this.hoverProgress;
    }

    draw(ctx) {
        ctx.save();
        
        const cardY = this.y + this.bounceOffset;
        
        if (this.hoverProgress > 0 || this.isSelected) {
            ctx.shadowColor = '#ff69b4';
            ctx.shadowBlur = 20 * (this.hoverProgress + (this.isSelected ? 1 : 0));
        }
        
        const gradient = ctx.createLinearGradient(
            this.x, cardY,
            this.x, cardY + this.height
        );
        
        if (this.isSelected) {
            gradient.addColorStop(0, '#ff69b4');
            gradient.addColorStop(1, '#ff8da1');
        } else {
            gradient.addColorStop(0, `rgba(255, 105, 180, ${0.5 + this.hoverProgress * 0.3})`);
            gradient.addColorStop(1, `rgba(255, 182, 193, ${0.5 + this.hoverProgress * 0.3})`);
        }
        
        ctx.fillStyle = gradient;
        roundRect(ctx, this.x, cardY, this.width, this.height, 15);
        ctx.fill();
        
        if (this.image && this.image.complete) {
            const scale = 1 + this.hoverProgress * 0.1;
            const imgSize = Math.min(this.width, this.height) * 0.8;
            const imgX = this.x + (this.width - imgSize * scale) / 2;
            const imgY = cardY + (this.height - imgSize * scale) / 2;
            
            ctx.drawImage(this.image,
                imgX, imgY,
                imgSize * scale, imgSize * scale
            );
        }
        
        ctx.fillStyle = 'white';
        ctx.font = `bold ${this.height * 0.15}px "Comic Sans MS"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(this.name, this.x + this.width/2, cardY + this.height - 10);
        
        if (this.isSelected) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            roundRect(ctx, this.x, cardY, this.width, this.height, 15);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
}

// Yardımcı fonksiyonlar
export function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
} 