export default class CollisionSystem {
    constructor(obstacles = []) {
        // Les obstacles sont des rectangles au format :
        // { x, y, width, height }
        //
        // Convention :
        // x et y représentent le coin haut-gauche du rectangle.
        this.obstacles = obstacles;
    }

    setObstacles(obstacles) {
        this.obstacles = obstacles;
    }

    resolveMovement(hitbox, deltaX, deltaY) {
        // On résout le déplacement axe par axe.
        // Cela permet au joueur de glisser le long d’un mur
        // au lieu d’être bloqué complètement en diagonale.

        let resolvedHitbox = { ...hitbox };

        const nextHitboxX = {
            ...resolvedHitbox,
            x: resolvedHitbox.x + deltaX
        };

        if (!this.collidesWithAnyObstacle(nextHitboxX)) {
            resolvedHitbox = nextHitboxX;
        }

        const nextHitboxY = {
            ...resolvedHitbox,
            y: resolvedHitbox.y + deltaY
        };

        if (!this.collidesWithAnyObstacle(nextHitboxY)) {
            resolvedHitbox = nextHitboxY;
        }

        return resolvedHitbox;
    }

    collidesWithAnyObstacle(hitbox) {
        return this.obstacles.some(obstacle => {
            return this.rectanglesOverlap(hitbox, obstacle);
        });
    }

    rectanglesOverlap(rectA, rectB) {
        return (
            rectA.x < rectB.x + rectB.width &&
            rectA.x + rectA.width > rectB.x &&
            rectA.y < rectB.y + rectB.height &&
            rectA.y + rectA.height > rectB.y
        );
    }
}