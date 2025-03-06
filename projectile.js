class Projectile {
    constructor(type, startPos, target, speed, damage, splashRadius, slowEffect) {
        this.type = type;
        this.position = { x: startPos.x, y: startPos.y };
        this.target = target;
        this.speed = speed;
        this.damage = damage;
        this.splashRadius = splashRadius;
        this.slowEffect = slowEffect;
        this.element = null;
        this.hit = false;
        
        this.createProjectileElement();
    }
    
    createProjectileElement() {
        this.element = document.createElement('div');
        this.element.className = `projectile projectile-${this.type}`;
        
        // Positionner l'élément
        this.element.style.left = `${this.position.x}px`;
        this.element.style.top = `${this.position.y}px`;
        this.element.style.zIndex = 999999999;
        
        // Ajouter au DOM
        document.getElementById('game-map').appendChild(this.element);
    }
    
    update(enemies) {
        if (this.hit || !this.target || !this.target.element || !this.element) return true;
        
        // Déplacer le projectile vers la cible
        const dx = this.target.currentPosition.x - this.position.x;
        const dy = this.target.currentPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si le projectile touche la cible mettre enemie size
        if (distance < 20) {
            this.hit = true;
            
            // Si c'est une tour avec dégâts de zone
            if (this.splashRadius) {
                for (let enemy of enemies) {
                    const splashDx = enemy.currentPosition.x - this.target.currentPosition.x;
                    const splashDy = enemy.currentPosition.y - this.target.currentPosition.y;
                    const splashDistance = Math.sqrt(splashDx * splashDx + splashDy * splashDy);
                    
                    if (splashDistance <= this.splashRadius) {
                        const killed = enemy.takeDamage(this.damage);
                        // La récompense est déjà traitée dans la méthode takeDamage de l'ennemi
                    }
                }
            } else {
                // Dégâts normaux
                const killed = this.target.takeDamage(this.damage);
                // La récompense est déjà traitée dans la méthode takeDamage de l'ennemi
                
                // Effet de ralentissement pour la tour de glace
                if (this.slowEffect) {
                    this.target.slowDown();
                }
            }
            
            this.remove();
            return true; // Le projectile doit être supprimé
        }
        
        // Déplacer le projectile
        const moveX = (dx / distance) * this.speed;
        const moveY = (dy / distance) * this.speed;
        
        this.position.x += moveX;
        this.position.y += moveY;
        
        // Mettre à jour la position dans le DOM
        this.element.style.left = `${this.position.x}px`;
        this.element.style.top = `${this.position.y}px`;
        
        return false; // Le projectile continue sa course
    }
    
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
