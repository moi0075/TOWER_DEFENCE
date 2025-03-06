class Game {
    constructor() {
        this.gameMap = new GameMap();
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.lives = 20;
        this.money = 100;
        this.currentWave = 1;
        this.waveInProgress = false;
        this.selectedTower = null;
        this.gameSpeed = 1;
        this.gameOver = false;
        this.lastUpdate = 0;
        
        Tower.initializeTowerSelection();
        this.initEventListeners();
        this.updateStats();
    }
    
    initEventListeners() {
        // Événement pour sélectionner une tour
        const towerOptions = document.querySelectorAll('.tower-option');
        towerOptions.forEach(option => {
            option.addEventListener('click', () => {
                const towerType = option.dataset.tower;
                const towerCost = parseInt(option.dataset.cost);
                
                // Vérifier si le joueur a assez d'argent
                if (this.money >= towerCost) {
                    this.selectedTower = { type: towerType, cost: towerCost };
                    
                    // Changer le curseur
                    document.getElementById('game-map').style.cursor = 'pointer';
                    
                    // Désélectionner les autres tours
                    towerOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                }
            });
        });
        
        // Événement pour placer une tour sur la carte
        document.getElementById('game-map').addEventListener('click', (e) => {
            if (!this.selectedTower) return;
            
            // Trouver la cellule cliquée
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / this.gameMap.cellSize);
            const y = Math.floor((e.clientY - rect.top) / this.gameMap.cellSize);
            
            // Vérifier si on peut construire une tour à cet endroit
            if (this.gameMap.canBuildTower(x, y)) {
                this.buildTower(this.selectedTower.type, x, y);
                
                // Réinitialiser la sélection
                this.selectedTower = null;
                document.getElementById('game-map').style.cursor = 'default';
                document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
            }
        });
        
        // Bouton pour démarrer la vague
        document.getElementById('start-wave').addEventListener('click', () => {
            if (!this.waveInProgress) {
                this.startWave();
            }
        });
        
        // Bouton pour changer la vitesse du jeu
        document.getElementById('speed-toggle').addEventListener('click', () => {
            if (this.gameSpeed === 1) {
                this.gameSpeed = 2;
                document.getElementById('speed-toggle').textContent = 'Vitesse x2';
            } else {
                this.gameSpeed = 1;
                document.getElementById('speed-toggle').textContent = 'Vitesse x1';
            }
        });
        
        // Bouton pour recommencer
        document.getElementById('restart').addEventListener('click', () => {
            this.restart();
        });
    }
    
    buildTower(type, x, y) {
        const tower = new Tower(type, x, y, this.gameMap);
        this.towers.push(tower);
        
        // Déduire le coût
        this.money -= this.selectedTower.cost;
        this.updateStats();
    }
    
    startWave() {
        this.waveInProgress = true;
        document.getElementById('start-wave').disabled = true;
        
        // Déterminer le nombre et les types d'ennemis en fonction de la vague
        const enemyCount = 10 + Math.floor(this.currentWave * 1.5);
        let enemyTypes = ['basic'];
        
        // Ajouter des types d'ennemis plus difficiles en fonction de la progression
        if (this.currentWave >= 3) {
            enemyTypes.push('fast');
        }
        if (this.currentWave >= 5) {
            enemyTypes.push('tank');
        }
        
        // Générer les ennemis progressivement
        let enemiesSpawned = 0;
        
        const spawnInterval = setInterval(() => {
            if (enemiesSpawned < enemyCount) {
                const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                const enemy = new Enemy(randomType, this.gameMap.path, this.gameMap);
                this.enemies.push(enemy);
                enemiesSpawned++;
            } else {
                clearInterval(spawnInterval);
            }
        }, 1000); // Spawn toutes les secondes
        
        // Vérifier si la vague est terminée
        const checkWaveEnd = setInterval(() => {
            if (enemiesSpawned === enemyCount && this.enemies.length === 0) {
                clearInterval(checkWaveEnd);
                this.endWave();
            }
        }, 1000);
    }
    
    endWave() {
        this.waveInProgress = false;
        document.getElementById('start-wave').disabled = false;
        
        // Récompense pour avoir survécu à la vague
        this.money += 20 + this.currentWave * 5;
        
        // Préparer la prochaine vague
        this.currentWave++;
        this.updateStats();
    }
    
    updateStats() {
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('money').textContent = this.money;
        document.getElementById('wave').textContent = this.currentWave;
    }
    
    update(currentTime) {
        if (this.gameOver) return;
        
        // Mettre à jour les tours
        this.towers.forEach(tower => {
            tower.update(currentTime, this.enemies, this.projectiles);
        });
        
        // Mettre à jour les ennemis
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const stillOnPath = enemy.move();
            
            // Si l'ennemi a atteint la fin du chemin
            if (!stillOnPath) {
                enemy.remove();
                this.enemies.splice(i, 1);
                this.lives--;
                this.updateStats();
                
                // Vérifier si le joueur a perdu
                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.showGameOver();
                }
            }
            
            // Si l'ennemi est mort (santé à 0)
            else if (enemy.health <= 0) {
                enemy.remove();
                this.enemies.splice(i, 1);
            }
        }
        
        // Mettre à jour les projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            const shouldRemove = projectile.update(this.enemies);
            
            if (shouldRemove) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Planifier la prochaine mise à jour
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    gameLoop(timestamp) {
        // Calculer le delta time
        const deltaTime = timestamp - this.lastUpdate;
        
        // Mettre à jour le jeu en fonction de la vitesse
        if (deltaTime > (1000 / 60) / this.gameSpeed) {
            this.update(timestamp);
            this.lastUpdate = timestamp;
        } else {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    showGameOver() {
        document.getElementById('final-wave').textContent = this.currentWave;
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    restart() {
        // Supprimer tous les éléments du jeu
        this.enemies.forEach(enemy => enemy.remove());
        this.towers.forEach(tower => tower.remove());
        this.projectiles.forEach(projectile => projectile.remove());
        
        // Réinitialiser les variables
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.lives = 20;
        this.money = 100;
        this.currentWave = 1;
        this.waveInProgress = false;
        this.selectedTower = null;
        this.gameSpeed = 1;
        this.gameOver = false;
        
        // Cacher l'écran de game over
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('speed-toggle').textContent = 'Vitesse x1';
        document.getElementById('start-wave').disabled = false;
        
        // Mettre à jour les statistiques
        this.updateStats();
    }
    
    start() {
        // Démarrer la boucle de jeu
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Initialiser le jeu lorsque la page est chargée
window.addEventListener('load', () => {
    window.game = new Game();
    game.start();
});
