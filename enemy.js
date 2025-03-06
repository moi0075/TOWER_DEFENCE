class Enemy {
    constructor(type, path, gameMap) {
        this.type = type;
        this.path = path;
        this.gameMap = gameMap;
        this.pathIndex = 0;
        this.currentPosition = { 
            x: path[0].x * gameMap.cellSize + (gameMap.cellSize / 2),
            y: path[0].y * gameMap.cellSize + (gameMap.cellSize / 2)
        };
        console.log(path)
        this.nextPosition = this.getNextPathPosition();
        this.element = null;
        this.healthBarElement = null;
        this.slowed = false;
        
        this.setProperties();
        this.createEnemyElement();
        this.updatePosition();
    }
    
    setProperties() {
        switch (this.type) {
            case 'basic':
                this.maxHealth = 100;
                this.health = 100;
                this.speed = 5;
                this.value = 5;
                break;
            case 'fast':
                this.maxHealth = 75;
                this.health = 75;
                this.speed = 1.7;
                this.value = 8;
                break;
            case 'tank':
                this.maxHealth = 200;
                this.health = 200;
                this.speed = 0.6;
                this.value = 12;
                break;
            default:
                this.maxHealth = 100;
                this.health = 100;
                this.speed = 1;
                this.value = 5;
        }
        
        // Obtenir la référence au jeu via la variable globale
        const gameInstance = window.game;
        
        // Ajustement de la difficulté basé sur le numéro de la vague
        if (gameInstance && gameInstance.currentWave) {
            const waveDifficulty = gameInstance.currentWave / 3;
            this.maxHealth = Math.floor(this.maxHealth * (1 + waveDifficulty * 0.2));
        }
        this.health = this.maxHealth;
    }
    
    createEnemyElement() {
        // Créer l'élément DOM de l'ennemi
        this.element = document.createElement('div');
        this.element.className = `enemy enemy-${this.type}`;
        
        // Créer la barre de vie
        this.healthBarElement = document.createElement('div');
        this.healthBarElement.className = 'health-bar';
        this.healthBarElement.style.width = '100%';
        
        this.element.appendChild(this.healthBarElement);
        
        // Ajouter au DOM
        document.getElementById('game-map').appendChild(this.element);
    }
    
    getNextPathPosition() {
        if (this.pathIndex < this.path.length - 1) {
            const nextPoint = this.path[this.pathIndex + 1];
            return {
                x: nextPoint.x * this.gameMap.cellSize + (this.gameMap.cellSize / 2),
                y: nextPoint.y * this.gameMap.cellSize + (this.gameMap.cellSize / 2)
            };
        }
        return null;
    }
    
    move() {
        if (!this.nextPosition) return false;
        
        // Calculer la direction et la distance
        const dx = this.nextPosition.x - this.currentPosition.x;
        const dy = this.nextPosition.y - this.currentPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si l'ennemi est proche du prochain point, passer au point suivant
        if (distance < this.speed) {
            this.pathIndex++;
            this.nextPosition = this.getNextPathPosition();
            
            // Si l'ennemi a atteint la fin du chemin
            if (!this.nextPosition) {
                return false;  // L'ennemi a atteint la fin
            }
        } else {
            // Calculer le mouvement
            let moveSpeed = this.slowed ? this.speed * 0.5 : this.speed;
            const moveX = (dx / distance) * moveSpeed;
            const moveY = (dy / distance) * moveSpeed;
            
            // Déplacer l'ennemi
            this.currentPosition.x += moveX;
            this.currentPosition.y += moveY;
        }
        
        this.updatePosition();
        return true;  // L'ennemi est toujours sur le chemin
    }
    
    updatePosition() {
        if (this.element) {
            this.element.style.left = `${this.currentPosition.x}px`;
            this.element.style.top = `${this.currentPosition.y}px`;
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
        
        // Mettre à jour la barre de vie
        const healthPercentage = Math.max(0, (this.health / this.maxHealth) * 100);
        this.healthBarElement.style.width = `${healthPercentage}%`;
        
        // Changer la couleur en fonction de la santé
        if (healthPercentage < 30) {
            this.healthBarElement.style.backgroundColor = 'red';
        } else if (healthPercentage < 60) {
            this.healthBarElement.style.backgroundColor = 'orange';
        }
        
        // Si l'ennemi est mort et qu'il y a une référence au jeu
        if (this.health <= 0 && window.game) {
            window.game.money += this.value;
            window.game.updateStats();
        }
        
        return this.health <= 0;  // Retourne true si l'ennemi est mort
    }
    
    slowDown() {
        this.slowed = true;
        setTimeout(() => {
            this.slowed = false;
        }, 2000); // L'effet de ralentissement dure 2 secondes
    }
    
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
