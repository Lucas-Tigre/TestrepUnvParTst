/**
 * @file Módulo para a gestão de explosões, incluindo a sua atualização e renderização.
 * @module js/explosion
 */

/**
 * Atualiza o estado de todas as explosões ativas, diminuindo a sua duração.
 * @param {Array<Object>} explosions - O array de explosões para atualizar.
 * @returns {Array<Object>} Um novo array contendo apenas as explosões que ainda estão ativas.
 */
export function updateExplosions(explosions) {
    return explosions.filter(e => {
        e.duration--;
        return e.duration > 0;
    });
}

/**
 * Renderiza todas as explosões ativas no canvas.
 * @param {CanvasRenderingContext2D} ctx - O contexto de renderização do canvas.
 * @param {Array<Object>} explosions - O array de explosões para renderizar.
 */
export function renderExplosions(ctx, explosions) {
    explosions.forEach(e => {
        const progress = 1 - (e.duration / 30);
        const currentRadius = e.radius * progress;

        ctx.save();
        ctx.globalAlpha = 1 - progress;
        ctx.beginPath();
        ctx.fillStyle = e.color;
        ctx.arc(e.x, e.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}
