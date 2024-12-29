import {
    GameState,
    GameMode,
    GRAVITY,
    FLAP_SPEED,
    MAX_VELOCITY,
    FORWARD_SPEED,
    PONY_VARIANTS,
    PONY_NAMES,
    RAINBOW_COLORS,
    FART_COLORS,
    STAR_LAYERS,
    AURORA_POINTS,
    HEART_SPAWN_CHANCE,
    BLACK_HOLE_SPAWN_CHANCE
} from './constants.js';

import { ModernButton, CharacterCard, roundRect } from './ui.js';
import { Particle, GlitterParticle, TrailParticle, HeartParticle } from './particles.js';

// Canvas ve context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Oyun durumu değişkenleri
let currentState = GameState.MENU;
let currentGameMode = GameMode.PEACEFUL;
let selectedPonyVariant = 'pony';
let mainPonyImage = null;
let score = 0;
// Yüksek skoru sıfırla
localStorage.removeItem('highScore');
let highScore = 0;

// Mouse pozisyonu
let lastMouseX = 0;
let lastMouseY = 0;

// Renk geçişi için değişkenler
let currentColorIndex = 0;
let nextColorIndex = 1;
let colorTransition = 0;

// Parçacık sistemleri
const MAX_PARTICLES = 10;
const MAX_GLITTER_PARTICLES = 10;
const MAX_TRAIL_PARTICLES = 8;
const MAX_HEART_BUBBLES = 2;
const MAX_BLACK_HOLES = 1;
const MAX_SCORE_ANIMATIONS = 3;

const particles = [];
const glitterParticles = [];
const trailParticles = [];
const heartBubbles = [];
const blackHoles = [];
const scoreAnimations = [];

// UI bileşenleri
let menuButtons = [];
let characterCards = [];
let fartHitbox = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    isHovered: false
};

// Pony karakteri
const PONY_SIZE = Math.min(window.innerWidth, window.innerHeight) * 0.08;
const pony = {
    x: canvas.width * 0.2,
    y: canvas.height * 0.4,
    velocity: 0,
    width: PONY_SIZE * 1.2,
    height: PONY_SIZE,
    xSpeed: FORWARD_SPEED,
    ySpeed: 0
};

// Yıldız katmanları
const starLayers = STAR_LAYERS.map(layer => 
    Array(layer.count).fill().map(() => ({
        x: Math.random() * canvas.width * 2,
        y: Math.random() * canvas.height,
        size: layer.size * (0.8 + Math.random() * 0.4),
        brightness: layer.brightness * (0.8 + Math.random() * 0.4),
        twinkleSpeed: Math.random() * 0.05,
        twinklePhase: Math.random() * Math.PI * 2
    }))
);

// Aurora noktaları
const auroraPoints = Array(AURORA_POINTS).fill().map((_, i) => ({
    x: (canvas.width * i) / (AURORA_POINTS - 1),
    y: canvas.height * 0.2,
    offset: Math.random() * Math.PI * 2,
    speed: 0.002 + Math.random() * 0.002
}));

// Gezegen ve yıldız sistemi
const planets = Array(3).fill().map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 15 + Math.random() * 25,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    speed: 0.1 + Math.random() * 0.2,
    hasRing: Math.random() > 0.5
}));

// Yıldızları tüm ekrana yay
function createBackgroundStars() {
    return Array(300).fill().map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 0.5 + Math.random() * 2,
        twinkle: Math.random(),
        brightness: 0.5 + Math.random() * 0.5,
        speed: 0.02 + Math.random() * 0.03
    }));
}

let backgroundStars = createBackgroundStars();

function drawBackgroundElements() {
    // Yıldızları çiz
    backgroundStars.forEach(star => {
        const twinkle = Math.sin(Date.now() * 0.003 + star.twinkle * 10) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Yıldızları her durumda hareket ettir
        star.x -= star.speed;
        if (star.x < 0) {
            star.x = canvas.width;
            star.y = Math.random() * canvas.height;
        }
    });

    // Gezegenleri çiz
    planets.forEach(planet => {
        ctx.save();
        const gradient = ctx.createRadialGradient(
            planet.x, planet.y, 0,
            planet.x, planet.y, planet.size
        );
        gradient.addColorStop(0, planet.color);
        gradient.addColorStop(0.7, planet.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
        ctx.fill();

        if (planet.hasRing) {
            ctx.strokeStyle = `${planet.color}44`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(planet.x, planet.y, planet.size * 1.5, planet.size * 0.5, Math.PI / 6, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        planet.x -= planet.speed;
        if (planet.x + planet.size < 0) {
            planet.x = canvas.width + planet.size;
            planet.y = Math.random() * canvas.height;
        }
    });
}

// Durdurma butonu
const pauseButton = {
    x: canvas.width - 60,
    y: 20,
    width: 40,
    height: 40,
    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        // İlk çizgi
        ctx.beginPath();
        ctx.moveTo(this.x + 12, this.y + 10);
        ctx.lineTo(this.x + 12, this.y + this.height - 10);
        ctx.stroke();
        
        // İkinci çizgi
        ctx.beginPath();
        ctx.moveTo(this.x + 28, this.y + 10);
        ctx.lineTo(this.x + 28, this.y + this.height - 10);
        ctx.stroke();
        
        ctx.restore();
    },
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
};

// Pony resimlerini yükle
const ponyImages = {};
let loadedImages = 0;
let failedImages = 0;
const totalImages = PONY_VARIANTS.length;

function checkAllImagesLoaded() {
    loadedImages++;
    if (loadedImages + failedImages === totalImages) {
        if (ponyImages[selectedPonyVariant]) {
            mainPonyImage = ponyImages[selectedPonyVariant];
        }
    }
}

PONY_VARIANTS.forEach(variant => {
    ponyImages[variant] = new Image();
    ponyImages[variant].onload = checkAllImagesLoaded;
    ponyImages[variant].onerror = () => {
        failedImages++;
        checkAllImagesLoaded();
    };
    ponyImages[variant].src = `${variant}.svg`;
});

// Canvas boyutlandırma
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    pauseButton.x = canvas.width - 60;
    backgroundStars = createBackgroundStars(); // Yıldızları yeniden oluştur
    initializeUI();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Mouse olaylarını dinle
canvas.addEventListener('mousemove', function(event) {
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

// Yardımcı fonksiyonlar
function lerpColor(color1, color2, t) {
    return {
        r: color1.r + (color2.r - color1.r) * t,
        g: color1.g + (color2.g - color1.g) * t,
        b: color1.b + (color2.b - color1.b) * t
    };
}

function isPointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
}

// UI başlatma
function initializeUI() {
    const buttonWidth = canvas.width * 0.25;
    const buttonHeight = canvas.height * 0.08;
    const startY = canvas.height * 0.4;
    const spacing = buttonHeight * 1.5;

    menuButtons = [
        new ModernButton(
            canvas.width/2 - buttonWidth/2,
            startY,
            buttonWidth,
            buttonHeight,
            'Barışçıl Mod',
            'Engelsiz, sadece puan toplama modu'
        ),
        new ModernButton(
            canvas.width/2 - buttonWidth/2,
            startY + spacing,
            buttonWidth,
            buttonHeight,
            'Zorlu Mod',
            'Siyah delikler ve diğer engellerle mücadele'
        ),
        new ModernButton(
            canvas.width/2 - buttonWidth/2,
            startY + spacing * 2,
            buttonWidth,
            buttonHeight,
            'Karakter Seç',
            'Farklı pony karakterlerinden birini seç'
        )
    ];

    const cardSize = PONY_SIZE * 1.5;
    const cardSpacing = cardSize * 1.3;
    const startX = canvas.width/2 - (PONY_VARIANTS.length * cardSpacing)/2;
    const cardY = canvas.height * 0.45;

    characterCards = PONY_VARIANTS.map((variant, index) => 
        new CharacterCard(
            startX + index * cardSpacing,
            cardY,
            cardSize,
            cardSize,
            variant,
            PONY_NAMES[variant],
            ponyImages[variant]
        )
    );
}

// Oyun durumunu sıfırla
function resetGameState() {
    pony.x = canvas.width * 0.2;
    pony.y = canvas.height * 0.4;
    pony.velocity = 0;
    pony.xSpeed = FORWARD_SPEED;
    pony.ySpeed = 0;
    particles.length = 0;
    heartBubbles.length = 0;
    blackHoles.length = 0;
    score = 0;
    scoreAnimations.length = 0;
}

// Click olaylarını dinle
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

    if (currentState === GameState.PLAYING || currentState === GameState.PAUSED) {
        if (pauseButton.containsPoint(mouseX, mouseY)) {
            currentState = currentState === GameState.PLAYING ? GameState.PAUSED : GameState.PLAYING;
            return;
        }
        
        if (currentState === GameState.PAUSED) {
            const menuButton = drawPauseScreen();
            if (isPointInRect(mouseX, mouseY, menuButton)) {
                currentState = GameState.MENU;
                resetGameState();
                return;
            }
            currentState = GameState.PLAYING;
            return;
        }
        
        if (currentState === GameState.PLAYING) {
            pony.velocity = FLAP_SPEED;
        }
    }
    else if (currentState === GameState.MENU) {
        const buttons = drawMenu();
        if (buttons.peacefulButton.containsPoint(mouseX, mouseY)) {
            currentGameMode = GameMode.PEACEFUL;
            currentState = GameState.PLAYING;
            resetGameState();
        } else if (buttons.challengeButton.containsPoint(mouseX, mouseY)) {
            currentGameMode = GameMode.CHALLENGE;
            currentState = GameState.PLAYING;
            resetGameState();
        } else if (buttons.characterButton.containsPoint(mouseX, mouseY)) {
            currentState = GameState.CHARACTER_SELECT;
        }
    }
    else if (currentState === GameState.CHARACTER_SELECT) {
        const elements = drawCharacterSelect();
        if (elements.backButton.containsPoint(mouseX, mouseY)) {
            currentState = GameState.MENU;
        } else {
            elements.characters.forEach(card => {
                if (card.containsPoint(mouseX, mouseY)) {
                    selectedPonyVariant = card.variant;
                    mainPonyImage = ponyImages[card.variant];
                    currentState = GameState.MENU;
                }
            });
        }
    }

    if (isPointInRect(mouseX, mouseY, fartHitbox) && glitterParticles.length < MAX_GLITTER_PARTICLES) {
        for (let i = 0; i < 15; i++) {
            glitterParticles.push(new GlitterParticle(mouseX, mouseY));
        }
    }
});

// Oyun döngüsü
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rect = canvas.getBoundingClientRect();
    const mouseX = (lastMouseX - rect.left) * (canvas.width / rect.width);
    const mouseY = (lastMouseY - rect.top) * (canvas.height / rect.height);

    if (currentState === GameState.MENU) {
        drawMenu();
    }
    else if (currentState === GameState.CHARACTER_SELECT) {
        drawCharacterSelect();
    }
    else if (currentState === GameState.PLAYING || currentState === GameState.PAUSED) {
        drawBackground();
        drawScore();
        pauseButton.draw(ctx);

        if (currentState === GameState.PLAYING) {
            updateParticles();
            updateTrailEffects();
            
            if (currentGameMode === GameMode.CHALLENGE) {
                if (Math.random() < BLACK_HOLE_SPAWN_CHANCE) {
                    blackHoles.push(new BlackHole());
                }

                for (let i = blackHoles.length - 1; i >= 0; i--) {
                    const blackHole = blackHoles[i];
                    if (blackHole && blackHole.update()) {
                        blackHoles.splice(i, 1);
                    } else if (blackHole) {
                        blackHole.draw(ctx);
                    }
                }
            }
            
            if (Math.random() < HEART_SPAWN_CHANCE) {
                heartBubbles.push(new HeartBubble());
            }

            for (let i = heartBubbles.length - 1; i >= 0; i--) {
                if (heartBubbles[i].update()) {
                    heartBubbles.splice(i, 1);
                } else {
                    heartBubbles[i].draw(ctx);
                }
            }
            
            updatePonyMovement();
        }
        
        drawPony();

        if (currentState === GameState.PAUSED) {
            drawPauseScreen();
        }
    }

    requestAnimationFrame(gameLoop);
}

// Oyunu başlat
gameLoop();

// Oyun fonksiyonları
function drawMenu() {
    drawBackground();
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (lastMouseX - rect.left) * (canvas.width / rect.width);
    const mouseY = (lastMouseY - rect.top) * (canvas.height / rect.height);

    // PONY FART başlığı
    const titleY = canvas.height * 0.2;
    const baseSize = Math.min(canvas.width, canvas.height) * 0.15;
    const shadowOffset = baseSize * 0.05;
    
    ctx.font = `bold ${baseSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const ponyText = 'PONY';
    const fartText = 'FART';
    
    const ponyWidth = ctx.measureText(ponyText).width;
    const fartWidth = ctx.measureText(fartText).width;
    const spaceWidth = ctx.measureText(' ').width;
    
    const startX = canvas.width/2 - (ponyWidth + spaceWidth + fartWidth)/2;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = shadowOffset;
    ctx.shadowOffsetY = shadowOffset;
    ctx.fillStyle = '#FF69B4';
    ctx.fillText(ponyText, startX + ponyWidth/2, titleY);
    
    const fartX = startX + ponyWidth + spaceWidth + fartWidth/2;
    
    fartHitbox = {
        x: fartX - fartWidth/2,
        y: titleY - baseSize/2,
        width: fartWidth,
        height: baseSize,
        isHovered: false
    };
    
    fartHitbox.isHovered = isPointInRect(mouseX, mouseY, fartHitbox);
    
    colorTransition += 0.005;
    if (colorTransition >= 1) {
        colorTransition = 0;
        currentColorIndex = nextColorIndex;
        nextColorIndex = (nextColorIndex + 1) % FART_COLORS.length;
    }

    const currentColor = FART_COLORS[currentColorIndex];
    const nextColor = FART_COLORS[nextColorIndex];
    const lerpedColor = lerpColor(currentColor, nextColor, colorTransition);

    if (fartHitbox.isHovered) {
        ctx.fillStyle = `rgb(${lerpedColor.r}, ${lerpedColor.g}, ${lerpedColor.b})`;
        ctx.shadowColor = `rgba(${lerpedColor.r}, ${lerpedColor.g}, ${lerpedColor.b}, 0.8)`;
        ctx.shadowBlur = 20;
    } else {
        ctx.fillStyle = `rgb(${lerpedColor.r}, ${lerpedColor.g}, ${lerpedColor.b})`;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
    }
    
    ctx.fillText(fartText, fartX, titleY);
    
    // Glitter parçacıklarını güncelle
    for (let i = glitterParticles.length - 1; i >= 0; i--) {
        if (glitterParticles[i].update()) {
            glitterParticles.splice(i, 1);
        } else {
            glitterParticles[i].draw(ctx);
        }
    }
    
    menuButtons.forEach((button, index) => {
        button.isSelected = (index === 0 && currentGameMode === GameMode.PEACEFUL) ||
                          (index === 1 && currentGameMode === GameMode.CHALLENGE);
        button.update(mouseX, mouseY);
        button.draw(ctx);
    });

    return {
        peacefulButton: menuButtons[0],
        challengeButton: menuButtons[1],
        characterButton: menuButtons[2]
    };
}

function drawCharacterSelect() {
    drawBackground();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('Karakterini Seç', canvas.width/2, canvas.height * 0.25);

    const rect = canvas.getBoundingClientRect();
    const mouseX = (lastMouseX - rect.left) * (canvas.width / rect.width);
    const mouseY = (lastMouseY - rect.top) * (canvas.height / rect.height);

    characterCards.forEach(card => {
        card.isSelected = card.variant === selectedPonyVariant;
        card.update(mouseX, mouseY);
        card.draw(ctx);
    });

    const backButton = new ModernButton(20, 20, 120, 40, 'Geri Dön', 'Ana menüye dön');
    backButton.update(mouseX, mouseY);
    backButton.draw(ctx);

    return {
        backButton,
        characters: characterCards
    };
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0B1026');
    gradient.addColorStop(0.5, '#1a1a3a');
    gradient.addColorStop(1, '#2C3E50');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBackgroundElements();
}

function drawScore() {
    // Barışçıl modda skor gösterme
    if (currentGameMode === GameMode.PEACEFUL) return;

    ctx.save();
    
    const scoreWidth = 180;
    const scoreHeight = 80;
    const scoreX = 20;
    const scoreY = 20;

    const gradient = ctx.createLinearGradient(scoreX, scoreY, scoreX, scoreY + scoreHeight);
    gradient.addColorStop(0, 'rgba(255, 105, 180, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 182, 193, 0.2)');
    
    ctx.fillStyle = gradient;
    roundRect(ctx, scoreX, scoreY, scoreWidth, scoreHeight, 15);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    roundRect(ctx, scoreX, scoreY, scoreWidth, scoreHeight, 15);
    ctx.stroke();
    
    ctx.fillStyle = '#FFB6C1';
    ctx.font = 'bold 28px "Comic Sans MS"';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    
    ctx.fillText(`${score}`, scoreX + 15, scoreY + 30);
    
    ctx.font = 'bold 20px "Comic Sans MS"';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`${highScore}`, scoreX + 15, scoreY + 60);
    
    ctx.font = '16px "Comic Sans MS"';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('PUAN', scoreX + 80, scoreY + 30);
    ctx.fillText('EN YÜKSEK', scoreX + 80, scoreY + 60);
    
    for (let i = scoreAnimations.length - 1; i >= 0; i--) {
        if (scoreAnimations[i].update()) {
            scoreAnimations.splice(i, 1);
        } else {
            scoreAnimations[i].draw(ctx);
        }
    }
    
    ctx.restore();
}

function drawPauseScreen() {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 48px "Comic Sans MS"';
    ctx.fillStyle = '#FF69B4';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText("Tuana'm seni çok seviyorum.", canvas.width/2, canvas.height/2);
    
    ctx.font = '24px "Comic Sans MS"';
    ctx.fillStyle = 'white';
    ctx.fillText('Devam etmek için tekrar ekrana tıklaman yeterli', canvas.width/2, canvas.height/2 + 50);

    const menuButtonWidth = 200;
    const menuButtonHeight = 50;
    const menuButtonX = canvas.width/2 - menuButtonWidth/2;
    const menuButtonY = canvas.height/2 + 100;

    const gradient = ctx.createLinearGradient(menuButtonX, menuButtonY, menuButtonX, menuButtonY + menuButtonHeight);
    gradient.addColorStop(0, '#FF69B4');
    gradient.addColorStop(1, '#FFB6C1');

    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    roundRect(ctx, menuButtonX, menuButtonY, menuButtonWidth, menuButtonHeight, 15);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px "Comic Sans MS"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.fillText('Ana Menüye Dön', menuButtonX + menuButtonWidth/2, menuButtonY + menuButtonHeight/2);

    ctx.restore();

    return {
        x: menuButtonX,
        y: menuButtonY,
        width: menuButtonWidth,
        height: menuButtonHeight
    };
}

function updateParticles() {
    if (pony.velocity < 0 && particles.length < MAX_PARTICLES) {
        for (let i = 0; i < 2; i++) {
            particles.push(new Particle(
                pony.x + pony.width * 0.3,
                pony.y + pony.height * 0.7 + (Math.random() - 0.5) * pony.height * 0.3
            ));
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].update()) {
            particles.splice(i, 1);
        } else {
            particles[i].draw(ctx);
        }
    }
}

function updateTrailEffects() {
    if (pony.velocity < 0 && trailParticles.length < MAX_TRAIL_PARTICLES) {
        if (Math.random() < 0.2) {
            trailParticles.push(new TrailParticle(
                pony.x + pony.width * 0.5,
                pony.y + pony.height * 0.5,
                RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)]
            ));
        }
    }
    
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        if (trailParticles[i].update()) {
            trailParticles.splice(i, 1);
        } else {
            trailParticles[i].draw(ctx);
        }
    }
}

function updatePonyMovement() {
    pony.velocity += GRAVITY;
    if (pony.velocity > MAX_VELOCITY) {
        pony.velocity = MAX_VELOCITY;
    }
    
    pony.ySpeed = pony.velocity;
    pony.x += pony.xSpeed;
    pony.y += pony.ySpeed;

    if (pony.x > canvas.width) {
        pony.x = -pony.width;
    }
    if (pony.y < -pony.height) {
        pony.y = canvas.height;
    }
    if (pony.y > canvas.height) {
        pony.y = -pony.height;
    }
}

function drawPony() {
    if (mainPonyImage && mainPonyImage.complete) {
        ctx.save();
        
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 20;
        
        const glowIntensity = Math.abs(pony.velocity) / MAX_VELOCITY;
        ctx.shadowBlur = 20 + glowIntensity * 10;
        
        const tilt = -pony.velocity * 0.1;
        ctx.translate(pony.x + pony.width/2, pony.y + pony.height/2);
        ctx.rotate(tilt);
        
        const bounceOffset = Math.sin(Date.now() / 200) * 2;
        ctx.translate(0, bounceOffset);
        
        ctx.drawImage(mainPonyImage, -pony.width/2, -pony.height/2, pony.width, pony.height);
        
        if (pony.velocity < 0) {
            const gradient = ctx.createRadialGradient(
                0, 0, 0,
                0, 0, pony.width/2
            );
            gradient.addColorStop(0, 'rgba(255, 105, 180, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 105, 180, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, pony.width/2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

class BlackHole {
    constructor() {
        this.size = PONY_SIZE * 0.2;
        this.x = canvas.width + this.size;
        this.y = Math.random() * (canvas.height - this.size * 2) + this.size;
        this.speed = FORWARD_SPEED * 0.8;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.03;
        this.gravityRadius = this.size * 12;
        this.gravityStrength = 15.0;
        this.maxParticles = 8;
        this.particles = [];
        this.particleTimer = 0;
        this.isCapturing = false;
        this.captureAngle = 0;
        this.captureRadius = 0;
        this.captureSpeed = 0.2;
    }

    update() {
        this.x -= this.speed;
        this.rotationAngle += this.rotationSpeed;

        const dx = this.x - (pony.x + pony.width/2);
        const dy = this.y - (pony.y + pony.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.gravityRadius) {
            if (!this.isCapturing) {
                this.isCapturing = true;
                this.captureAngle = Math.atan2(dy, dx);
                this.captureRadius = distance;
            }

            if (this.isCapturing) {
                // Spiral hareketi - çok daha yavaş çekim
                this.captureRadius *= 0.99;
                this.captureAngle += 0.08;
                
                const newX = this.x - Math.cos(this.captureAngle) * this.captureRadius;
                const newY = this.y - Math.sin(this.captureAngle) * this.captureRadius;
                
                pony.x = newX - pony.width/2;
                pony.y = newY - pony.height/2;
                
                if (this.captureRadius < this.size) {
                    currentState = GameState.MENU;
                    resetGameState();
                    return true;
                }
            }
        } else {
            this.isCapturing = false;
            pony.xSpeed = FORWARD_SPEED;
            pony.ySpeed = 0;
        }

        return this.x + this.size < 0;
    }

    draw(ctx) {
        ctx.save();
        
        // Çekim alanı görselini daha keskin yap
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.gravityRadius
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.7)'); // Daha keskin geçiş
        gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)'); // Daha keskin geçiş
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.gravityRadius, 0, Math.PI * 2);
        ctx.fill();

        // Kara delik merkezi
        const holeGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        holeGradient.addColorStop(0, '#000000');
        holeGradient.addColorStop(0.3, '#1a0f2e');
        holeGradient.addColorStop(0.7, '#000000');

        ctx.fillStyle = holeGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Spiral efekti (yakalandığında)
        if (this.isCapturing) {
            ctx.strokeStyle = 'rgba(26, 15, 46, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            let spiralAngle = this.captureAngle;
            let spiralRadius = this.captureRadius;
            for (let i = 0; i < 20; i++) {
                const x = this.x - Math.cos(spiralAngle) * spiralRadius;
                const y = this.y - Math.sin(spiralAngle) * spiralRadius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                spiralAngle += 0.1;
                spiralRadius *= 0.92;
            }
            ctx.stroke();
        }

        ctx.restore();
    }
}

class HeartBubble {
    constructor() {
        this.width = PONY_SIZE * 2;
        this.height = this.width;
        this.x = Math.random() * canvas.width;
        this.y = -this.height;
        this.speedY = 0.3;
        this.wobble = 0;
        this.wobbleSpeed = 0.02;
        this.amplitude = 0.3;
        this.collected = false;
        this.opacity = 1;
        this.showBigT = false;
        this.bigTTimer = 0;
        this.bigTOpacity = 1;
        this.rotation = 0;
        this.scale = 1;
        this.points = Math.floor(Math.random() * 2) + 1;
        this.explosionX = 0;
        this.explosionY = 0;
    }

    update() {
        if (this.showBigT) {
            this.bigTTimer++;
            if (this.bigTTimer > 60) {
                this.bigTOpacity -= 0.05;
                if (this.bigTOpacity <= 0) {
                    return true;
                }
            }
            return false;
        }

        if (this.collected) {
            this.opacity -= 0.03;
            this.scale += 0.1;
            if (this.opacity <= 0) {
                this.showBigT = true;
                // Patlama pozisyonunu kaydet
                this.explosionX = this.x + this.width/2;
                this.explosionY = this.y + this.height/2;
                return false;
            }
        }

        this.y += this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * this.amplitude;
        this.rotation = Math.sin(this.wobble) * 0.1;

        if (!this.collected && 
            pony.x < this.x + this.width &&
            pony.x + pony.width > this.x &&
            pony.y < this.y + this.height &&
            pony.y + pony.height > this.y) {
            this.collected = true;
            
            score += this.points;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
            }
            
            scoreAnimations.push(new ScoreAnimation(
                this.x + this.width/2,
                this.y - 20,
                this.points,
                this.points > 1 ? '#FFD700' : '#FFB6C1'
            ));
        }

        return this.y > canvas.height;
    }

    draw(ctx) {
        if (this.showBigT) {
            ctx.save();
            ctx.globalAlpha = this.bigTOpacity;
            
            const tSize = PONY_SIZE * 2;
            const gradient = ctx.createLinearGradient(
                this.explosionX, this.explosionY - tSize/2,
                this.explosionX, this.explosionY + tSize/2
            );
            gradient.addColorStop(0, '#FF69B4');
            gradient.addColorStop(0.5, '#FFB6C1');
            gradient.addColorStop(1, '#FF69B4');
            
            ctx.fillStyle = gradient;
            ctx.shadowColor = 'rgba(255, 105, 180, 0.8)';
            ctx.shadowBlur = 20;
            ctx.font = `bold ${tSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const time = Date.now() / 100;
            const glow = 10 + Math.sin(time) * 5;
            ctx.shadowBlur = glow;
            
            // T harfini tam patlama noktasında çiz
            ctx.fillText('T', this.explosionX, this.explosionY);
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        const size = (this.width/2) * this.scale;

        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, '#FF69B4');
        gradient.addColorStop(0.7, '#FF69B4');
        gradient.addColorStop(1, '#FFB6C1');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(0, size * 0.3);
        ctx.bezierCurveTo(
            -size * 0.5, -size * 0.3,
            -size, size * 0.3,
            0, size
        );
        ctx.bezierCurveTo(
            size, size * 0.3,
            size * 0.5, -size * 0.3,
            0, size * 0.3
        );
        
        ctx.shadowColor = '#FF69B4';
        ctx.shadowBlur = 15;
        
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

class ScoreAnimation {
    constructor(x, y, value, color = '#FFB6C1') {
        this.x = x;
        this.y = y;
        this.value = value;
        this.color = color;
        this.life = 1;
        this.startY = y;
    }

    update() {
        this.life -= 0.02;
        this.y -= 1;
        return this.life <= 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.fillText(`+${this.value}`, this.x, this.y);
        ctx.restore();
    }
}

// ESC tuşu kontrolü
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && currentState === GameState.PLAYING) {
        currentState = GameState.PAUSED;
    }
});
 