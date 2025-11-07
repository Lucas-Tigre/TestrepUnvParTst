/**
 * @file Módulo para a gestão de partículas, incluindo a sua criação, atualização, renderização e interações.
 * @module js/particle
 */

import { config } from './config.js';
import { playSound } from './utils.js';

/**
 * Um "pool" (piscina) de objetos para reutilizar partículas em vez de criar e destruir constantemente.
 * @type {Array<Object>}
 */
const particlePool = [];

/**
 * Pega uma partícula do pool ou cria uma nova se o pool estiver vazio.
 * @param {import('./config.js').Player} player - O objeto do jogador, para evitar gerar partículas muito perto dele.
 * @param {number} [x] - Posição x inicial opcional.
 * @param {number} [y] - Posição y inicial opcional.
 * @returns {Object} Uma instância de partícula.
 */
export function getParticle(player, x, y) {
    const spawnPadding = 200;
    let posX, posY;
    do {
        posX = x !== undefined ? x : Math.random() * window.innerWidth;
        posY = y !== undefined ? y : Math.random() * window.innerHeight;
    } while (
        player &&
        Math.abs(posX - player.x) < spawnPadding &&
        Math.abs(posY - player.y) < spawnPadding
    );

    if (particlePool.length > 0) {
        const p = particlePool.pop();
        p.x = posX;
        p.y = posY;
        p.size = Math.random() * 4 + 2;
        p.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        p.speedX = (Math.random() - 0.5) * 3;
        p.speedY = (Math.random() - 0.5) * 3;
        p.trail = [];
        return p;
    }
    return createParticle(posX, posY);
}

/**
 * Cria uma partícula especial de cura em uma posição específica.
 * @param {number} x - A posição x onde a partícula será criada.
 * @param {number} y - A posição y onde a partícula será criada.
 * @returns {Object} O objeto da partícula de cura.
 */
export function createHealParticle(x, y) {
    return {
        x, y,
        size: 8,
        color: 'lightgreen',
        xpValue: 0,
        special: 'heal',
        healAmount: 10,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        trail: []
    };
}

/**
 * Cria um novo objeto de partícula com propriedades aleatórias.
 * @param {number} x - A posição x da partícula.
 * @param {number} y - A posição y da partícula.
 * @returns {Object} O novo objeto de partícula.
 */
export function createParticle(x, y) {
    let particleType;
    if (Math.random() < 0.02) {
        particleType = { color: 'gold', size: 10, xp: 50, special: 'powerup' };
    } else {
        const types = [
            { color: `hsl(${Math.random() * 60 + 180}, 80%, 60%)`, size: 3, xp: 2 },
            { color: `hsl(${Math.random() * 60 + 60}, 80%, 60%)`, size: 5, xp: 5 },
            { color: `hsl(${Math.random() * 60 + 300}, 80%, 60%)`, size: 2, xp: 7, special: 'speed' },
        ];
        particleType = Math.random() > 0.8 ? types[Math.floor(Math.random() * types.length)] : types[0];
    }

    return {
        x, y,
        size: particleType.size,
        color: particleType.color,
        xpValue: particleType.xp,
        special: particleType.special,
        speedX: (Math.random() - 0.5) * (particleType.special === 'speed' ? 6 : 3),
        speedY: (Math.random() - 0.5) * (particleType.special === 'speed' ? 6 : 3),
        trail: []
    };
}

/**
 * Cria uma explosão de partículas hostis (ataque do chefe).
 * @param {number} x - Posição x da explosão.
 * @param {number} y - Posição y da explosão.
 * @param {Array<Object>} existingParticles - O array de partículas existente para adicionar as novas.
 * @returns {Array<Object>} O novo array de partículas.
 */
export function createParticleExplosion(x, y, existingParticles) {
    const newParticles = [...existingParticles];
    const count = 20;
    const speed = 5;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const particle = {
            x,
            y,
            speedX: Math.cos(angle) * speed * (Math.random() * 0.5 + 0.75),
            speedY: Math.sin(angle) * speed * (Math.random() * 0.5 + 0.75),
            size: 5,
            color: 'hsl(0, 100%, 70%)',
            isHostile: true,
            lifespan: 120,
            trail: []
        };
        newParticles.push(particle);
    }
    return newParticles;
}

/**
 * Gera novas partículas se a contagem atual estiver abaixo de um limite mínimo.
 * @param {Array<Object>} currentParticles - O array de partículas atual.
 * @param {import('./config.js').Player} player - O objeto do jogador.
 * @returns {Array<Object>} O novo array de partículas com as partículas recém-geradas.
 */
export function autoRespawnParticles(currentParticles, player) {
    let newParticles = [...currentParticles];
    if (newParticles.length < config.particleRespawn.minParticles) {
        for (let i = 0; i < config.particleRespawn.respawnAmount; i++) {
            const p = getParticle(player);
            p.size = 3;
            p.targetSize = p.size;
            newParticles.push(p);
        }
        playSound('respawn');
    }
    return newParticles;
}

/**
 * Atualiza o estado de todas as partículas (movimento, colisão, etc.).
 * @param {Array<Object>} currentParticles - O array de partículas a ser atualizado.
 * @param {import('./config.js').Player} player - O objeto do jogador.
 * @param {number} deltaTime - O tempo decorrido desde o último frame.
 * @param {number} lastUpdateIndex - O índice da última partícula atualizada (para otimização).
 * @returns {{
 *   newParticles: Array<Object>,
 *   absorbedXp: number,
 *   absorbedCount: number,
 *   newLastUpdateIndex: number,
 *   powerupCollected: boolean
 * }} Um objeto contendo o novo estado das partículas e informações sobre eventos.
 */
export function updateParticles(currentParticles, player, deltaTime, lastUpdateIndex) {
    let newParticles = [...currentParticles];
    let absorbedXp = 0;
    let absorbedCount = 0;
    let powerupCollected = false;
    const updatesThisFrame = Math.min(100, newParticles.length);
    let newLastUpdateIndex = lastUpdateIndex;

    for (let i = 0; i < updatesThisFrame; i++) {
        const idx = (newLastUpdateIndex + i) % newParticles.length;
        const p = newParticles[idx];
        if (!p) continue;

        if (p.isHostile) {
            p.x += p.speedX;
            p.y += p.speedY;
            p.lifespan--;

            const dx = player.x - p.x;
            const dy = player.y - p.y;
            if (Math.sqrt(dx * dx + dy * dy) < player.size + p.size) {
                player.health -= 5;
                playSound('hit');
                p.lifespan = 0;
            }

            if (p.lifespan <= 0) {
                newParticles.splice(idx, 1);
                i--;
            }
            continue;
        }

        if (p.size > (p.targetSize || 3)) p.size -= 0.1;

        const dx = player.x - p.x;
        const dy = player.y - p.y;
        const distSq = dx * dx + dy * dy;

        const effectiveRadius = player.isPoweredUp ? player.radius * 1.5 : player.radius;

        if (distSq < effectiveRadius * effectiveRadius) {
            const dist = Math.sqrt(distSq);
            const suctionRadius = effectiveRadius * 0.2;
            const isVeryClose = dist < suctionRadius;

            if (player.mode === 'attract') {
                p.speedX *= 0.9;
                p.speedY *= 0.9;
                const radialForce = 0.6;
                const tangentialForce = 0.3;
                const radial_nx = dx / dist;
                const radial_ny = dy / dist;
                const tangential_nx = -radial_ny;
                const tangential_ny = radial_nx;
                const forceMagnitude = (1 - dist / player.radius);
                p.speedX += (radial_nx * radialForce + tangential_nx * tangentialForce) * forceMagnitude * (deltaTime / 16.67);
                p.speedY += (radial_ny * radialForce + tangential_ny * tangentialForce) * forceMagnitude * (deltaTime / 16.67);

                if (isVeryClose && dist < player.size * 0.8) {
                    if (p.special === 'powerup') {
                        powerupCollected = true;
                    } else if (p.isHealing) {
                        const healing = p.healingAmount || 0;
                        if (!isNaN(healing)) {
                            player.health = Math.min(player.maxHealth, player.health + healing);
                            playSound('levelUp');
                        }
                    }
                    absorbedXp += p.xpValue || 1;
                    absorbedCount++;
                    playSound('absorb');
                    particlePool.push(newParticles.splice(idx, 1)[0]);
                    i--;
                    continue;
                }
            } else if (player.mode === 'repel') {
                const nx = dx / dist;
                const ny = dy / dist;
                p.speedX -= nx * 0.2 * (1 - dist / player.radius) * (deltaTime / 16.67);
                p.speedY -= ny * 0.2 * (1 - dist / player.radius) * (deltaTime / 16.67);
            }
        }

        p.x += p.speedX * (deltaTime / 16.67);
        p.y += p.speedY * (deltaTime / 16.67);

        if (p.x < 0 || p.x > window.innerWidth) p.speedX *= -0.8;
        if (p.y < 0 || p.y > window.innerHeight) p.speedY *= -0.8;

        p.trail.push({ x: p.x, y: p.y, size: p.size });
        if (p.trail.length > 5) p.trail.shift();
    }

    newLastUpdateIndex = (newLastUpdateIndex + updatesThisFrame) % (newParticles.length || 1);

    return { newParticles, absorbedXp, absorbedCount, newLastUpdateIndex, powerupCollected };
}

/**
 * Renderiza todas as partículas ativas e seus rastros no canvas.
 * @param {CanvasRenderingContext2D} ctx - O contexto de renderização do canvas.
 * @param {Array<Object>} particles - O array de partículas a serem renderizadas.
 */
export function renderParticles(ctx, particles) {
    particles.forEach(p => {
        p.trail.forEach((trail, i) => {
            const alpha = i / p.trail.length;
            ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, trail.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        });
        if (p.special === 'heal') {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);

            ctx.fillStyle = 'white';
            ctx.fillRect(p.x - p.size / 2, p.y - p.size * 1.5, p.size, p.size * 3);
            ctx.fillRect(p.x - p.size * 1.5, p.y - p.size / 2, p.size * 3, p.size);
        } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}
