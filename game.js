class HoverGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.level = 1;
        this.targets = [];
        this.gameMode = 'practice';
        this.isGameRunning = false;
        this.sprites = {
            butterfly: { color: '#FF69B4', points: 1 },
            flower: { color: '#4ECDC4', points: 2 },
            star: { color: '#FFD700', points: 3 },
            heart: { color: '#FF6B6B', points: 4 },
            rainbow: { color: '#45B7D1', points: 5 }
        };
        this.highScores = JSON.parse(localStorage.getItem('hoverGameScores')) || {
            practice: [],
            challenge: []
        };
        
        // Initialize menu elements
        this.menu = document.getElementById('menu');
        this.gameContainer = document.getElementById('game');
        this.highScoresMenu = document.getElementById('highScoresMenu');
        
        // Define safe zones
        this.safeZones = {
            top: 100, // Height of the top UI bar
            bottom: 20,
            left: 20,
            right: 20
        };
        
        // Setup event listeners immediately
        this.setupEventListeners();
        this.setupMenu();
        
        // Load sprites
        this.loadSprites();

        // Block right-click context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    loadSprites() {
        this.spriteImages = {};
        const spriteNames = Object.keys(this.sprites);
        let loadedSprites = 0;

        spriteNames.forEach(name => {
            const img = new Image();
            img.src = `sprites/${name}.png`;
            img.onload = () => {
                loadedSprites++;
                if (loadedSprites === spriteNames.length) {
                    console.log('All sprites loaded successfully');
                }
            };
            img.onerror = () => {
                console.error(`Failed to load sprite: ${name}`);
                // Create a fallback colored circle if sprite fails to load
                const canvas = document.createElement('canvas');
                canvas.width = 100;
                canvas.height = 100;
                const ctx = canvas.getContext('2d');
                
                ctx.fillStyle = this.sprites[name].color;
                ctx.beginPath();
                ctx.arc(50, 50, 40, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'white';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(name, 50, 50);
                
                this.spriteImages[name] = canvas;
            };
            this.spriteImages[name] = img;
        });
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('mousemove', (e) => this.checkHover(e));
    }

    setupMenu() {
        // Practice Mode button
        const practiceButton = document.getElementById('practiceMode');
        if (practiceButton) {
            practiceButton.addEventListener('click', () => {
                console.log('Practice mode clicked');
                this.startGame('practice');
            });
        }

        // Challenge Mode button
        const challengeButton = document.getElementById('challengeMode');
        if (challengeButton) {
            challengeButton.addEventListener('click', () => {
                console.log('Challenge mode clicked');
                this.startGame('challenge');
            });
        }

        // High Scores button
        const highScoresButton = document.getElementById('highScores');
        if (highScoresButton) {
            highScoresButton.addEventListener('click', () => {
                console.log('High scores clicked');
                this.showHighScores();
            });
        }

        // Back to Menu button
        const backToMenuButton = document.getElementById('backToMenu');
        if (backToMenuButton) {
            backToMenuButton.addEventListener('click', () => {
                console.log('Back to menu clicked');
                this.showMenu();
            });
        }

        // Back from Scores button
        const backFromScoresButton = document.getElementById('backFromScores');
        if (backFromScoresButton) {
            backFromScoresButton.addEventListener('click', () => {
                console.log('Back from scores clicked');
                this.showMenu();
            });
        }

        // Fullscreen button
        const fullscreenButton = document.getElementById('fullscreenButton');
        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    showMenu() {
        console.log('Showing menu');
        if (this.menu) this.menu.style.display = 'flex';
        if (this.gameContainer) this.gameContainer.style.display = 'none';
        if (this.highScoresMenu) this.highScoresMenu.style.display = 'none';
        this.isGameRunning = false;

        // Exit fullscreen when returning to menu
        if (document.fullscreenElement) {
            this.toggleFullscreen();
        }
    }

    showHighScores() {
        console.log('Showing high scores');
        if (this.menu) this.menu.style.display = 'none';
        if (this.gameContainer) this.gameContainer.style.display = 'none';
        if (this.highScoresMenu) this.highScoresMenu.style.display = 'flex';
        
        const scoresList = document.getElementById('scoresList');
        if (scoresList) {
            scoresList.innerHTML = '';
            
            ['practice', 'challenge'].forEach(mode => {
                const modeTitle = document.createElement('h3');
                modeTitle.textContent = mode.charAt(0).toUpperCase() + mode.slice(1) + ' Mode';
                scoresList.appendChild(modeTitle);
                
                this.highScores[mode].slice(0, 5).forEach(score => {
                    const scoreEntry = document.createElement('div');
                    scoreEntry.className = 'score-entry';
                    scoreEntry.textContent = `${score.name}: ${score.score}`;
                    scoresList.appendChild(scoreEntry);
                });
            });
        }
    }

    startGame(mode) {
        console.log('Starting game in', mode, 'mode');
        this.gameMode = mode;
        this.score = 0;
        this.level = 1;
        this.targets = [];
        
        if (this.menu) this.menu.style.display = 'none';
        if (this.gameContainer) this.gameContainer.style.display = 'block';
        if (this.highScoresMenu) this.highScoresMenu.style.display = 'none';
        
        // Enter fullscreen when game starts
        this.toggleFullscreen();
        
        this.resizeCanvas();
        this.isGameRunning = true;
        this.updateUI();
        this.createNewTarget();
        this.gameLoop();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Update safe zones based on screen size
        this.safeZones = {
            top: Math.min(100, window.innerHeight * 0.15), // 15% of screen height or 100px, whichever is smaller
            bottom: 20,
            left: 20,
            right: 20
        };
    }

    createNewTarget() {
        const spriteNames = Object.keys(this.sprites);
        const spriteName = spriteNames[Math.floor(Math.random() * spriteNames.length)];
        const sprite = this.sprites[spriteName];
        
        const baseSize = 80;
        // Only decrease size up to level 18
        const size = this.gameMode === 'challenge' 
            ? baseSize * (1 - Math.min(this.level - 1, 17) * 0.05) // Cap size reduction at level 18
            : baseSize;
            
        // Calculate safe area for sprite placement
        const safeX = this.safeZones.left;
        const safeY = this.safeZones.top;
        const safeWidth = this.canvas.width - this.safeZones.left - this.safeZones.right;
        const safeHeight = this.canvas.height - this.safeZones.top - this.safeZones.bottom;
        
        // Place sprite within safe area
        const x = safeX + Math.random() * (safeWidth - size);
        const y = safeY + Math.random() * (safeHeight - size);
        
        // Add movement properties for levels 18 and above
        const speed = this.level >= 18 ? Math.min(2 + (this.level - 18) * 0.2, 5) : 0; // Increase speed with level, max 5
        const angle = Math.random() * Math.PI * 2; // Random initial direction
        
        this.targets.push({
            x,
            y,
            size,
            sprite: spriteName,
            points: sprite.points,
            hovered: false,
            speed,
            angle,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed
        });
    }

    drawSprite(target) {
        const img = this.spriteImages[target.sprite];
        if (img) {
            this.ctx.drawImage(img, target.x, target.y, target.size, target.size);
        }
    }

    checkHover(e) {
        if (!this.isGameRunning) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.targets.forEach(target => {
            if (!target.hovered) {
                const centerX = target.x + target.size/2;
                const centerY = target.y + target.size/2;
                const distance = Math.sqrt(
                    Math.pow(mouseX - centerX, 2) + 
                    Math.pow(mouseY - centerY, 2)
                );

                if (distance < target.size/2) {
                    target.hovered = true;
                    this.score += target.points;
                    
                    if (this.gameMode === 'challenge') {
                        if (this.score >= this.level * 10) {
                            this.level++;
                        }
                    }
                    
                    this.updateUI();
                    this.createNewTarget();
                }
            }
        });
    }

    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('levelValue').textContent = this.level;
    }

    gameLoop() {
        if (!this.isGameRunning) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.targets.forEach(target => {
            if (!target.hovered) {
                // Update position for moving sprites
                if (target.speed > 0) {
                    target.x += target.dx;
                    target.y += target.dy;
                    
                    // Bounce off walls
                    if (target.x <= this.safeZones.left || target.x + target.size >= this.canvas.width - this.safeZones.right) {
                        target.dx *= -1;
                    }
                    if (target.y <= this.safeZones.top || target.y + target.size >= this.canvas.height - this.safeZones.bottom) {
                        target.dy *= -1;
                    }
                }
                
                this.drawSprite(target);
            }
        });

        requestAnimationFrame(() => this.gameLoop());
    }

    saveScore() {
        const name = prompt('Enter your name for the high score!');
        if (name) {
            this.highScores[this.gameMode].push({
                name,
                score: this.score,
                level: this.level
            });
            
            this.highScores[this.gameMode].sort((a, b) => b.score - a.score);
            this.highScores[this.gameMode] = this.highScores[this.gameMode].slice(0, 5);
            
            localStorage.setItem('hoverGameScores', JSON.stringify(this.highScores));
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    console.log('Window loaded, initializing game');
    new HoverGame();
}); 