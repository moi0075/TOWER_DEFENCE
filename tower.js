// Configuration des tours
const towerTypes = {
    basic: {
        name : "Tour Simple (10)",
        damage: 20,
        range: 120,
        fireRate: 800,
        projectileSpeed: 8,
        cost: 10,
        spritePath:"assets/towers/randomTowerV3.png",
        aspectRatio: 94/88,  // Hauteur/Largeur - à ajuster selon vos images // Pourrait étre améliorer mais pour le moment le plus simple sans avoir à charger l'image
        adjustProjectileStartPosition : {x: 0, y: -10} // Ajuste la position initiale des tire pour correspondre à l'image

    },
    cannon: {
        name : "Canon (25)",
        damage: 40,
        range: 100,
        fireRate: 1500,
        projectileSpeed: 6,
        splashRadius: 50,
        cost: 25,
        spritePath:"assets/towers/randomTowerV2.png",
        aspectRatio: 110/70,  // Hauteur/Largeur - à ajuster selon vos images
        adjustProjectileStartPosition : {x: 0, y: -40} 

    },
    ice: {
        name : "Tour de Glace (10)",
        damage: 10,
        range: 200,
        fireRate: 1000,
        projectileSpeed: 7,
        slowEffect: true,
        cost: 10,
        spritePath:"assets/towers/randomTowerV2.png",
        aspectRatio: 110/70,  // Hauteur/Largeur - à ajuster selon vos images
        adjustProjectileStartPosition : {x: 0, y: -40} 
    }
};

class Tower {
    constructor(type, x, y, gameMap) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.gameMap = gameMap;
        this.element = null;
        this.rangeElement = null;
        this.target = null;
        this.lastShot = 0;
        
        this.setProperties();
        this.createTowerElement();
    }

    // Création du shop
    static initializeTowerSelection(){
        // Récupérer le conteneur de sélection des tours
        const towerSelectionContainer = document.querySelector('.tower-selection');
        towerSelectionContainer.innerHTML = '';
            
        // Parcour towerTypes et ajoute dans le html les tower
        for (const [type, tower] of Object.entries(towerTypes)) {
            // Créer l'élément d'option de tour
            const towerOption = document.createElement('div');
            towerOption.className = 'tower-option';
            towerOption.dataset.tower = type;
            towerOption.dataset.cost = tower.cost;
            
            // Créer l'élément visuel de la tour
            const towerVisual = document.createElement('div');
            towerVisual.className = `tower tower-${type}`;
            // Ajouter l'image
            console.log(towerVisual)
            towerVisual.style.backgroundImage = `url(${tower.spritePath})`;

            // Créer l'élément d'information
            const towerInfo = document.createElement('div');
            towerInfo.className = 'tower-info';
            towerInfo.textContent = tower.name;
            
            // Assembler la structure
            towerOption.appendChild(towerVisual);
            towerOption.appendChild(towerInfo);
            
            // Ajouter au conteneur
            towerSelectionContainer.appendChild(towerOption);
        }
        
        console.log("Création TowerSelection terminée");
    }

    setProperties() {
        const props = towerTypes[this.type];
        Object.assign(this, props); // Fait un this. pour chaque propriéte de la tower
    }
    
    createTowerElement() {
        // Position en pixels (x,y position en cellulles)
        const pixelX = this.x * this.gameMap.cellSize;
        const pixelY = this.y * this.gameMap.cellSize;

        // Créer l'élément de la tour
        this.element = document.createElement('div');
        this.element.className = `tower tower-${this.type}`;
        this.element.style.position = 'absolute';
        this.element.style.left = `${pixelX}px`;
        this.element.style.top = `${pixelY }px`;
        this.element.style.top = `${pixelY -(this.gameMap.cellSize*this.aspectRatio)+this.gameMap.cellSize}px`;
        this.element.style.zIndex = this.y; // Plus les tours sont en bas de la map plus elle sont en avant

        // Ajuster la taille de l'élément (width = cellSize, height =  hauteur image / (largeur image / cellSize) )
        this.element.style.width = `${this.gameMap.cellSize}px`;
        this.element.style.height = `${this.gameMap.cellSize*this.aspectRatio}px`; // Ce fait en auto

        // Définir l'image de fond depuis la propriété spritePath
        this.element.style.backgroundImage = `url(${this.spritePath})`;

        // Créer un élément pour montrer la portée (initialement caché)
        this.rangeElement = document.createElement('div'); 
        this.rangeElement.className = 'tower-range';
        this.rangeElement.style.position = 'absolute';
        this.rangeElement.style.width = `${this.range * 2}px`;
        this.rangeElement.style.height = `${this.range * 2}px`;
        this.rangeElement.style.borderRadius = '50%';
        this.rangeElement.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        this.rangeElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        this.rangeElement.style.left = `${pixelX + this.gameMap.cellSize / 2 - this.range}px`;
        this.rangeElement.style.top = `${pixelY + this.gameMap.cellSize / 2 - this.range}px`;
        this.rangeElement.style.display = 'none';
        
        // Ajouter les éléments au DOM
        document.getElementById('game-map').appendChild(this.element);
        document.getElementById('game-map').appendChild(this.rangeElement);
        
        // Ajouter des événements pour afficher/cacher la portée
        this.element.addEventListener('mouseenter', () => {
            this.rangeElement.style.display = 'block';
        });
        
        this.element.addEventListener('mouseleave', () => {
            this.rangeElement.style.display = 'none';
        });
    }
    
    // Renvoie l'ennemie en range d'attack et le avancer sur le path
    findTarget(enemies) {
        // Position centrale de la tour
        const towerCenterX = this.x * this.gameMap.cellSize + this.gameMap.cellSize / 2;
        const towerCenterY = this.y * this.gameMap.cellSize + this.gameMap.cellSize / 2;
        
        // Rechercher l'ennemi le plus avancé dans la portée
        let furthestEnemy = null;
        let maxPathIndex = -1;
        
        for (let enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.currentPosition.x - towerCenterX, 2) + 
                Math.pow(enemy.currentPosition.y - towerCenterY, 2)
            );
            
            if (distance <= this.range && enemy.pathIndex > maxPathIndex) {
                maxPathIndex = enemy.pathIndex;
                furthestEnemy = enemy;
            }
        }
        // console.log(furthestEnemy)
        return furthestEnemy;
    }
    
    shoot(currentTime, projectiles) {
        if (!this.target) return;
        
        // Vérifier si assez de temps s'est écoulé depuis le dernier tir
        if (currentTime - this.lastShot < this.fireRate) return;
        
        // Position centrale de la cellule de la tour + un ajustement par rapport à l'image
        const towerCenterX = this.x * this.gameMap.cellSize + this.gameMap.cellSize / 2 + this.adjustProjectileStartPosition.x;
        const towerCenterY = this.y * this.gameMap.cellSize + this.gameMap.cellSize / 2 + this.adjustProjectileStartPosition.y;
        
        // Créer un projectile
        const projectile = new Projectile(
            this.type,
            { x: towerCenterX, y: towerCenterY },
            this.target,
            this.projectileSpeed,
            this.damage,
            this.splashRadius,
            this.slowEffect
        );
        
        projectiles.push(projectile);
        this.lastShot = currentTime;
    }
    
    update(currentTime, enemies, projectiles) {
        this.target = this.findTarget(enemies);
        if (this.target) {
            this.shoot(currentTime, projectiles);
        }
    }
    
    // remove() {
    //     console.log("remove")
    //     if (this.element && this.element.parentNode) {
    //         this.element.parentNode.removeChild(this.element);
    //     }
    //     if (this.rangeElement && this.rangeElement.parentNode) {
    //         this.rangeElement.parentNode.removeChild(this.rangeElement);
    //     }
    // }
}
