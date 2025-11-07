/**
 * @file Centraliza e exporta o estado dinâmico do jogo, como as posições de entidades, temporizadores e flags de controlo.
 * @module js/state
 */

/** @type {Array<Object>} */
export let particles = [];
/** @type {Array<Object>} */
export let enemies = [];
/** @type {Array<Object>} */
export let projectiles = [];
/** @type {Array<Object>} */
export let explosions = [];

/** @type {number} - Índice para otimização do loop de partículas. */
export let lastUpdateIndex = 0;
/** @type {number} - Timestamp do último frame para cálculo do deltaTime. */
export let lastTime = 0;
/** @type {number} - Frames por segundo. */
export let fps = 60;
/** @type {number} - Timestamp da última verificação de FPS. */
export let fpsLastChecked = 0;
/** @type {number} - Contagem de frames. */
export let frameCount = 0;
/** @type {boolean} - Se o loop do jogo está a correr. */
export let gameLoopRunning = false;
/** @type {number} - Raio atual da animação da aura do jogador. */
export let auraPulseRadius = 0;
/** @type {number} - Acumulador de tempo para a física do jogo. */
export let accumulator = 0;

// =============================================
// FUNÇÕES SETTER
// Permitem que outros módulos modifiquem o estado de forma controlada.
// =============================================

/**
 * Define o array de partículas.
 * @param {Array<Object>} newParticles - O novo array de partículas.
 */
export function setParticles(newParticles) {
    if (Array.isArray(newParticles)) {
        particles = newParticles;
    }
}

/**
 * Define o array de inimigos.
 * @param {Array<Object>} newEnemies - O novo array de inimigos.
 */
export function setEnemies(newEnemies) {
    if (Array.isArray(newEnemies)) {
        enemies = newEnemies;
    }
}

/**
 * Define o array de projéteis.
 * @param {Array<Object>} newProjectiles - O novo array de projéteis.
 */
export function setProjectiles(newProjectiles) {
    if (Array.isArray(newProjectiles)) {
        projectiles = newProjectiles;
    }
}

/**
 * Define o array de explosões.
 * @param {Array<Object>} newExplosions - O novo array de explosões.
 */
export function setExplosions(newExplosions) {
    if (Array.isArray(newExplosions)) {
        explosions = newExplosions;
    }
}

/**
 * Define se o loop do jogo está a correr.
 * @param {boolean} value - O novo valor.
 */
export function setGameLoopRunning(value) {
    gameLoopRunning = value;
}

/**
 * Define o timestamp do último frame.
 * @param {number} time - O novo timestamp.
 */
export function setLastTime(time) {
    lastTime = time;
}

/**
 * Define os valores de FPS.
 * @param {number} newFps - O novo valor de FPS.
 * @param {number} lastChecked - O timestamp da última verificação.
 * @param {number} newFrameCount - A nova contagem de frames.
 */
export function setFps(newFps, lastChecked, newFrameCount) {
    fps = newFps;
    fpsLastChecked = lastChecked;
    frameCount = newFrameCount;
}

/**
 * Incrementa a contagem de frames.
 */
export function incrementFrameCount() {
    frameCount++;
}

/**
 * Define o índice da última partícula atualizada.
 * @param {number} index - O novo índice.
 */
export function setLastUpdateIndex(index) {
    lastUpdateIndex = index;
}

/**
 * Define o raio atual da animação da aura do jogador.
 * @param {number} radius - O novo raio.
 */
export function setAuraPulseRadius(radius) {
    auraPulseRadius = radius;
}

/**
 * Define o acumulador de tempo para a física do jogo.
 * @param {number} value - O novo valor.
 */
export function setAccumulator(value) {
    accumulator = value;
}

/**
 * Reseta todo o estado do jogo para os seus valores iniciais.
 */
export function resetState() {
    particles = [];
    enemies = [];
    projectiles = [];
    explosions = [];
    lastUpdateIndex = 0;
    lastTime = 0;
    fps = 60;
    fpsLastChecked = 0;
    frameCount = 0;
    gameLoopRunning = false;
    auraPulseRadius = 0;
    accumulator = 0;
}
