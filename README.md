# Tower Defense en JavaScript

Ce projet est un jeu Tower Defense créé avec JavaScript et le DOM, sans utiliser de canvas.

## Comment jouer

1. Ouvrez le fichier `index.html` dans un navigateur web
2. Construisez des tours en cliquant sur une tour dans le sélecteur puis en cliquant sur une position libre sur la carte
3. Lancez une vague d'ennemis en appuyant sur le bouton "Lancer la vague"
4. Protégez votre base en empêchant les ennemis d'atteindre la fin du chemin
5. Gagnez de l'or en tuant les ennemis et en complétant des vagues
6. Utilisez l'or pour construire plus de tours

## Types de tours

- **Tour Simple (10 or)** - Tour de base avec une bonne cadence de tir
- **Canon (25 or)** - Inflige des dégâts de zone, mais tire plus lentement
- **Tour de Glace (30 or)** - Ralentit les ennemis touchés

## Types d'ennemis

- **Basique** - Ennemi standard
- **Rapide** - Se déplace plus vite mais a moins de points de vie
- **Tank** - Se déplace lentement mais a beaucoup de points de vie

## Contrôles

- Cliquez sur une tour dans le menu du bas puis sur la carte pour la construire
- Utilisez le bouton "Vitesse x1/x2" pour accélérer le jeu
- Cliquez sur "Lancer la vague" pour démarrer une nouvelle vague d'ennemis

## Structure du projet

- `index.html` - Structure HTML du jeu
- `styles.css` - Styles CSS pour l'apparence du jeu
- `game.js` - Logique principale du jeu
- `map.js` - Gestion de la carte et du chemin
- `enemy.js` - Classe pour les ennemis
- `tower.js` - Classe pour les tours de défense
- `projectile.js` - Classe pour les projectiles
