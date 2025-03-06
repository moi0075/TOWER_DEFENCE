class GameMap {
    constructor() {
        this.mapWidth = 20; // 20 cellules de large
        this.mapHeight = 12; // 12 cellules de haut
        this.cellSize = 40;  // 40px par cellule 
        //attention si on modifie la taille de la cellule, il faut modifier la taille des tours et des ennemies
        // et la vitesse pour garder une certaine logique de gamplay
        this.mapElement = document.getElementById('game-map');
        // Grille du jeux
        this.grid = [];
        // Chemin des ennemies
        this.path = [];
        
        this.initializeMap();
        this.createPath();
        this.renderMap();
    }
    
    initializeMap() {
        // Initialiser la grille
        for (let y = 0; y < this.mapHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                this.grid[y][x] = 0; // 0 = terrain constructible
            }
        }
    }
    
    createPath() {
        // On trace le chemin plutot qu'une matrice comme cella on à un ordre
        // this.path = [
        //     { x: 0, y: 5 },   // Point de départ
        //     { x: 4, y: 5 },   
        //     { x: 4, y: 2 },   // Montée
        //     { x: 8, y: 2 },   
        //     { x: 8, y: 8 },   // Descente
        //     { x: 4, y: 8 },  
        //     { x: 4, y: 2 },  // Montée
        //     { x: 16, y: 2 },  
        //     { x: 16, y: 5 },  
        //     { x: 19, y: 5 }   // Point d'arrivée
        // ];

        this.path = [
            { x: 0, y: 5 },   // Point de départ

            { x: 19, y: 5 }   // Point d'arrivée
        ];
        
        // Marquer le chemin sur la grille
        for (let i = 0; i < this.path.length - 1; i++) {
            let current = this.path[i];
            let next = this.path[i + 1];
            
            // Remplir le chemin entre deux points
            if (current.x === next.x) {
                // Chemin vertical
                const start = Math.min(current.y, next.y);
                const end = Math.max(current.y, next.y);
                for (let y = start; y <= end; y++) {
                    this.grid[y][current.x] = 1; // 1 = chemin
                }
            } else {
                // Chemin horizontal
                const start = Math.min(current.x, next.x);
                const end = Math.max(current.x, next.x);
                for (let x = start; x <= end; x++) {
                    this.grid[current.y][x] = 1; // 1 = chemin
                }
            }
        }
        console.log(this.grid);   
    }
    
    renderMap() {
        // Dimensionner le terrain de jeu 
        this.mapElement.style.width = `${this.mapWidth * this.cellSize}px`;
        this.mapElement.style.height = `${this.mapHeight * this.cellSize}px`;

        // Créer la représentation visuelle de la carte
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                if (this.grid[y][x] === 1) {
                    cell.classList.add('path');
                }

                // Positionner la cellule
                cell.style.left = `${x * this.cellSize}px`;
                cell.style.top = `${y * this.cellSize}px`;
                // Redimensionner la cellule
                cell.style.width = `${this.cellSize}px`;
                cell.style.height = `${this.cellSize}px`;

                // cell.dataset.x = x;
                // cell.dataset.y = y;
                this.mapElement.appendChild(cell);
            }
        }
    }
    
    // Vérifie si une tour peut être construite à cette position
    canBuildTower(x, y) {
        // Vérifie si les coordonnées sont dans la grille
        if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
            return false;
        }
        
        // Vérifie si la cellule est libre (pas un chemin)
        return this.grid[y][x] === 0;
    }
}
