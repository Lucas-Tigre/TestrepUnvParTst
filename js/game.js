/**
 * @file O orquestrador principal do jogo, responsável pelo loop, estado, renderização e interações do utilizador.
 * @module js/game
 */

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// > IMPORTAÇÕES DOS MÓDULOS
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
import { config } from './config.js';
import * as state from './state.js';
import * as ui from './ui.js';
import * as particle from './particle.js';
import * as enemy from './enemy.js';
import * as projectile from './projectile.js';
import * as explosion from './explosion.js';
import { checkLevelUp as checkLevelUpLogic, showUnlockMessage, playSound, initSoundSystem, unlockAudio } from './utils.js';
import { playMusic, stopMusic, preloadMusic } from './audio.js';
import { submitScore } from './supabaseService.js';

/**
 * Uma cópia profunda da configuração inicial das missões para garantir um reset consistente.
 * @type {import('./config.js').Quest[]}
 */
export const initialQuests = JSON.parse(JSON.stringify(config.quests));

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// > ELEMENTOS DO DOM E CACHE DE ASSETS
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
/**
 * Cache para armazenar imagens pré-carregadas e evitar pop-in.
 * @type {Object.<string, HTMLImageElement>}
 */
const imageCache = {};

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// > FUNÇÕES AUXILIARES
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
/**
 * Mostra ou esconde um elemento de menu e pausa o jogo.
 * @param {HTMLElement} menuElement - O elemento do menu a ser mostrado/escondido.
 * @param {boolean} show - `true` para mostrar o menu, `false` para esconder.
 */
function toggleMenu(menuElement, show) {
    const display = show ? 'block' : 'none';
    if (menuElement) {
        menuElement.style.display = display;
    }
    config.gamePaused = show;
}

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// > LÓGICA PRINCIPAL DO JOGO
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

/**
 * Ativa uma batalha de chefe, limpando inimigos normais e iniciando a música do chefe.
 * @param {number} level - O nível do jogador, para determinar qual chefe gerar.
 */
function triggerBossFight(level) {
    state.setEnemies([]);
    config.bossFightActive = true;
    showUnlockMessage(`UM CHEFE APARECEU!`);
    const bossType = level === 50 ? 'finalBoss' : 'boss';
    const musicTrack = level === 50 ? 'finalBossTheme' : 'bossBattle';
    playMusic(musicTrack);
    const boss = enemy.spawnEnemy(bossType, config, config.players[0]);
    if (boss) {
        state.setEnemies([boss]);
    }
}

/**
 * Verifica se alguma galáxia nova pode ser desbloqueada com base no estado atual do jogo.
 */
function checkGalaxyUnlocks() {
    if (config.level >= 5 && !config.galaxies.unlocked.includes('neon')) {
        config.galaxies.unlocked.push('neon');
        showUnlockMessage("Nova galáxia desbloqueada: Neon!");
    }
    if (config.enemiesDestroyed >= 50 && !config.galaxies.unlocked.includes('fire')) {
        config.galaxies.unlocked.push('fire');
        showUnlockMessage("Nova galáxia desbloqueada: Inferno!");
    }
}

/**
 * Verifica se alguma skin nova pode ser desbloqueada com base no progresso do jogador.
 */
function checkSkinUnlocks() {
    config.skins.available.forEach(skin => {
        if (!skin.unlocked) {
            let unlocked = false;
            if (skin.id === 'cosmic' && config.level >= 10) {
                unlocked = true;
            }
            if (skin.id === 'blackhole' && config.enemiesDestroyed >= 100) {
                unlocked = true;
            }
            // A condição para a skin 'ancient' (completar todas as missões) é mais complexa
            // e pode ser adicionada aqui posteriormente.

            if (unlocked) {
                skin.unlocked = true;
                showUnlockMessage(`Nova skin desbloqueada: ${skin.name}!`);
            }
        }
    });
}

/**
 * Verifica se o jogador tem XP suficiente para subir de nível e lida com a lógica de progressão.
 */
function checkLevelUp() {
    const levelUpResult = checkLevelUpLogic(
        config.level,
        config.xp,
        state.enemies.length,
        config.bossFightActive
    );

    config.level = levelUpResult.newLevel;
    config.xp = levelUpResult.newXp;

    if (levelUpResult.leveledUp) {
        config.skillPoints += levelUpResult.skillPointsGained;
        showUnlockMessage(levelUpResult.message);
        playSound('levelUp');
        checkGalaxyUnlocks(); // Verifica unlocks de galáxia ao subir de nível
        checkSkinUnlocks();   // Verifica unlocks de skin ao subir de nível
    }

    if (levelUpResult.bossToTrigger) {
        triggerBossFight(levelUpResult.bossToTrigger);
    }
}

/**
 * Atualiza o progresso de uma missão ativa com base numa ação do jogador.
 * @param {string} questId - O ID da missão a ser atualizada.
 * @param {number} [amount=1] - A quantidade a ser adicionada ao progresso da missão.
 */
function updateQuest(questId, amount = 1) {
    const quest = config.quests.active.find(q => q.id === questId);
    if (quest) {
        quest.current += amount;
        if (quest.current >= quest.target) {
            config.xp += quest.reward;
            config.quests.completed.push(quest.id);
            config.quests.active = config.quests.active.filter(q => q.id !== questId);
            showUnlockMessage(`Missão completa! +${quest.reward}XP`);
            checkLevelUp();
        }
        ui.updateQuestUI(config.quests.active);
    }
}

/**
 * Ativa a habilidade Big Bang, causando dano massivo a todos os inimigos.
 */
export function activateBigBang() {
    if (config.bigBangCharge < 100 || config.isBigBangAnimating) return;

    config.isBigBangAnimating = true;
    config.bigBangAnimationTimer = 3500; // 1.5s de tremor + 2s de dissipação
    config.bigBangEffectTriggered = false; // Garante que o estado seja resetado

    config.bigBangCharge = 0;
    playSound('explosion');
}

/**
 * Gerencia as ondas de inimigos, iniciando novas ondas e gerando inimigos.
 */
function updateWave() {
    if (config.bossFightActive) {
        if (state.enemies.length === 0) {
            config.bossFightActive = false;
            showUnlockMessage(`Chefe derrotado!`);
            playMusic('mainTheme');
        }
        return;
    }

    config.wave.timer++;

    if (state.enemies.length === 0 && config.wave.spawned >= config.wave.enemiesToSpawn) {
        config.wave.number++;
        config.wave.enemiesToSpawn = 5 + Math.floor(config.wave.number * 1.5);
        config.wave.spawned = 0;
        config.wave.timer = 0;
        showUnlockMessage(`Onda ${config.wave.number} começando!`);
        updateQuest('wave5', 1);
    } else if (config.wave.spawned < config.wave.enemiesToSpawn && config.wave.timer > 90) {
        const newEnemy = enemy.spawnRandomEnemy(config, config.players[0], canvas);
        if (newEnemy) {
            state.setEnemies([...state.enemies, newEnemy]);
        }
        config.wave.spawned++;
        config.wave.timer = 0;
    }
}

/**
 * Atualiza o painel de estatísticas na interface do utilizador.
 */
function updateStats() {
    const stats = {
        level: config.level,
        xp: config.xp,
        particlesAbsorbed: config.particlesAbsorbed,
        enemies: state.enemies.length,
        wave: config.wave.number
    };
    ui.updateStatsPanel(stats);
}

/**
 * Gerencia o tempo de duração do power-up do jogador.
 */
function handlePowerUpTimer() {
    const player = config.players[0];
    if (player.isPoweredUp && player.powerUpTimer > 0) {
        player.powerUpTimer--;
        if (player.powerUpTimer <= 0) {
            player.isPoweredUp = false;
        }
    }
}

/**
 * Gera um lote inicial de partículas de forma assíncrona para não travar o jogo.
 */
function spawnBatch() {
    const player = config.players[0];
    const particlesToSpawn = config.particleCount;
    const batchSize = 25;
    const currentParticles = [...state.particles];
    for (let i = 0; i < batchSize; i++) {
        if (currentParticles.length < particlesToSpawn) {
            currentParticles.push(particle.getParticle(player));
        } else {
            return;
        }
    }
    state.setParticles(currentParticles);
    if (currentParticles.length < particlesToSpawn) {
        requestAnimationFrame(spawnBatch);
    }
}

/**
 * Reinicia o jogo para o estado inicial, restaurando o progresso e as habilidades.
 */
export function restartGame() {
    document.getElementById('game-over-screen').style.display = 'none';
    const player = config.players[0];

    // CORREÇÃO: Garante que os valores de base são definidos se ainda não existirem
    if (player.baseMaxHealth === undefined) {
        player.baseMaxHealth = player.maxHealth;
        player.baseRadius = player.radius;
        player.baseAttractionDamage = player.attractionDamage;
        config.baseXpMultiplier = 1;
    }

    player.mode = 'attract';
    player.health = player.baseMaxHealth;
    player.isPoweredUp = false;
    player.powerUpTimer = 0;
    player.radius = player.baseRadius;
    player.attractionDamage = player.baseAttractionDamage;
    player.maxHealth = player.baseMaxHealth;
    config.xpMultiplier = config.baseXpMultiplier;

    config.gamePaused = false;
    config.bossFightActive = false;
    state.setParticles([]);
    requestAnimationFrame(spawnBatch);
    state.setEnemies([]);
    state.setProjectiles([]);
    state.setExplosions([]);

    for (const key in config.skills.tree) {
        config.skills.tree[key].currentLevel = 0;
    }

    Object.assign(config, {
        wave: { number: 1, enemiesToSpawn: 5, spawned: 0, timer: 0 },
        xp: 0,
        level: 1,
        particlesAbsorbed: 0,
        enemiesDestroyed: 0,
        skillPoints: 0
    });
    config.quests = JSON.parse(JSON.stringify(initialQuests));

    playMusic('mainTheme');
    if (!state.gameLoopRunning) {
        state.setGameLoopRunning(true);
        requestAnimationFrame(gameLoop);
    }
}

/**
 * Aplica o upgrade de uma habilidade se o jogador tiver pontos suficientes.
 * @param {string} key - A chave da habilidade a ser atualizada.
 */
function upgradeSkill(key) {
    const skill = config.skills.tree[key];
    const player = config.players[0];

    if (!skill) {
        console.error(`Tentativa de upgrade para habilidade inexistente: ${key}`);
        return;
    }

    if (skill.requires) {
        for (const req of skill.requires) {
            const [reqKey, reqLevel] = req.split(':');
            if (config.skills.tree[reqKey]?.currentLevel < parseInt(reqLevel, 10)) {
                showUnlockMessage(`Requisito não cumprido: ${config.skills.tree[reqKey].name} Nível ${reqLevel}`);
                return;
            }
        }
    }

    if (config.skillPoints < skill.cost) {
        showUnlockMessage("Pontos de habilidade insuficientes!");
        return;
    }
    if (skill.currentLevel >= skill.maxLevel) {
        showUnlockMessage("Nível máximo já alcançado!");
        return;
    }

    config.skillPoints -= skill.cost;
    skill.currentLevel++;
    playSound('levelUp');

    switch (key) {
        case 'healthBoost':
            const healthIncrease = player.baseMaxHealth * 0.10;
            player.maxHealth += healthIncrease;
            player.health += healthIncrease;
            break;
        case 'attractRadius':
            player.radius = player.baseRadius * (1 + 0.20 * skill.currentLevel);
            break;
        case 'vortexPower':
            player.attractionDamage = player.baseAttractionDamage * (1 + 0.30 * skill.currentLevel);
            break;
        case 'particleMastery':
            config.xpMultiplier = config.baseXpMultiplier * (1 + 0.20 * skill.currentLevel);
            break;
    }
}

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// > RENDERIZAÇÃO
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
/**
 * Renderiza todos os elementos do jogo no canvas.
 */
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const player = config.players[0];

    // Efeito de tremor da tela durante a animação do Big Bang
    if (config.isBigBangAnimating && config.bigBangAnimationTimer > 2000) {
        ctx.save();
        const shakeX = (Math.random() - 0.5) * 20;
        const shakeY = (Math.random() - 0.5) * 20;
        ctx.translate(shakeX, shakeY);
    }

    particle.renderParticles(ctx, state.particles);
    enemy.drawEnemies(ctx, state.enemies);
    projectile.renderProjectiles(ctx, state.projectiles);
    explosion.renderExplosions(ctx, state.explosions);

    if (player.mode === 'attract') {
        const effectiveRadius = player.isPoweredUp ? player.radius * 1.5 : player.radius;
        const auraColor = player.isPoweredUp ? '255, 215, 0' : '142, 45, 226';
        const opacity = 1 - (state.auraPulseRadius / effectiveRadius);
        ctx.strokeStyle = `rgba(${auraColor}, ${opacity})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, state.auraPulseRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `${player.faceSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.face, player.x, player.y);

    // Restaura o contexto do canvas após o tremor
    if (config.isBigBangAnimating && config.bigBangAnimationTimer > 2000) {
        ctx.restore();
    }

    // Efeito de clarão branco com dissipação (fade-out)
    if (config.isBigBangAnimating && config.bigBangAnimationTimer <= 2000) {
        // Calcula a opacidade. Começa em 1 (sólido) e vai até 0 (transparente).
        const opacity = config.bigBangAnimationTimer / 2000;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// > LOOP PRINCIPAL E FÍSICA DO JOGO
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
/**
 * Atualiza a física e a lógica do jogo a cada passo de tempo fixo.
 * @param {number} deltaTime - O tempo decorrido desde a última atualização.
 */
function updatePhysics(deltaTime) {
    if (config.gamePaused) return;
    const player = config.players[0];

    if (config.isBigBangAnimating) {
        config.bigBangAnimationTimer -= deltaTime;

        // Ativa o efeito de destruição quando o tremor acaba (em 2000ms)
        if (config.bigBangAnimationTimer <= 2000 && !config.bigBangEffectTriggered) {
            const enemies = state.enemies;
            const remainingEnemies = enemies.filter(enemy => {
                const type = config.enemySystem.types[enemy.typeKey] || {};
                if (type.isBoss) { // Dano massivo em bosses
                    enemy.health -= enemy.maxHealth * 0.3;
                    return enemy.health > 0;
                }
                return false; // Remove inimigos normais
            });
            state.setEnemies(remainingEnemies);
            config.bigBangEffectTriggered = true;
        }

        if (config.bigBangAnimationTimer <= 0) {
            config.isBigBangAnimating = false;
            config.bigBangEffectTriggered = false; // Reseta para a próxima vez
        }
    }

    handlePowerUpTimer();

    if (player.invincibleTimer > 0) {
        player.invincibleTimer--;
    }

    const effectiveRadius = player.isPoweredUp ? player.radius * 1.5 : player.radius;
    let newAuraRadius = state.auraPulseRadius + 2;
    if (newAuraRadius > effectiveRadius) newAuraRadius = 0;
    state.setAuraPulseRadius(newAuraRadius);

    const particleUpdate = particle.updateParticles(state.particles, player, deltaTime, state.lastUpdateIndex);
    state.setParticles(particleUpdate.newParticles);
    state.setLastUpdateIndex(particleUpdate.newLastUpdateIndex);

    if (particleUpdate.powerupCollected) {
        player.isPoweredUp = true;
        player.powerUpTimer = 300;
        playSound('levelUp');
    }

    if (particleUpdate.absorbedXp > 0) {
        const finalXp = Math.round(particleUpdate.absorbedXp * (config.xpMultiplier || 1) * config.globalXpMultiplier);
        config.xp += finalXp;
        if (particleUpdate.absorbedCount > 0) {
            config.particlesAbsorbed += particleUpdate.absorbedCount;
        }
        updateQuest('absorb100', finalXp);
        checkLevelUp();
    }

    config.gameTime++;
    if (config.gameTime % config.particleRespawn.checkInterval === 0) {
        state.setParticles(particle.autoRespawnParticles(state.particles, player));
    }

    const projectileUpdate = projectile.updateProjectiles(state.projectiles);
    state.setProjectiles(projectileUpdate.remainingProjectiles);
    if (projectileUpdate.newExplosions.length > 0) {
        state.setExplosions([...state.explosions, ...projectileUpdate.newExplosions]);
        playSound('enemyDefeat');
    }

    state.setExplosions(explosion.updateExplosions(state.explosions));

    if (state.enemies.length > 0) {
        const enemyUpdate = enemy.updateEnemies(state.enemies, player, config, canvas, false);

        state.setEnemies(enemyUpdate.updatedEnemies);

        if (enemyUpdate.newProjectiles?.length > 0) {
            state.setProjectiles([...state.projectiles, ...enemyUpdate.newProjectiles]);
        }

        if (enemyUpdate.newExplosions?.length > 0) {
            state.setExplosions([...state.explosions, ...enemyUpdate.newExplosions]);
        }

        if (enemyUpdate.damageToPlayer > 0 && player.invincibleTimer <= 0) {
            player.health -= enemyUpdate.damageToPlayer;
            playSound('hit');
            player.invincibleTimer = config.players[0].invincibilityCooldown;
        }

        if (enemyUpdate.xpGained > 0) {
            const finalXp = Math.round(enemyUpdate.xpGained * (config.xpMultiplier || 1) * config.globalXpMultiplier);
            config.xp += finalXp;
            checkLevelUp();
        }

        if (enemyUpdate.bigBangChargeGained > 0) {
            config.bigBangCharge = Math.min(100, config.bigBangCharge + enemyUpdate.bigBangChargeGained);
        }

        if (enemyUpdate.healingParticles?.length > 0) {
            state.setParticles([...state.particles, ...enemyUpdate.healingParticles]);
        }

        if (enemyUpdate.enemiesDefeated > 0) {
            config.enemiesDestroyed += enemyUpdate.enemiesDefeated;
            updateQuest('destroy50', enemyUpdate.enemiesDefeated);
            checkGalaxyUnlocks(); // Verifica unlocks de galáxia ao derrotar inimigos
            checkSkinUnlocks();   // Verifica unlocks de skin ao derrotar inimigos
        }
    }

    if (!config.bossFightActive) {
        updateWave();
    }

    let currentProjectiles = state.projectiles;
    for (let i = currentProjectiles.length - 1; i >= 0; i--) {
        const proj = currentProjectiles[i];
        const dx = player.x - proj.x;
        const dy = player.y - proj.y;
        if (Math.sqrt(dx * dx + dy * dy) < player.size + proj.size) {
            player.health -= proj.damage;
            playSound('hit');
            if (proj.onDeath === 'explode') {
                state.setExplosions([...state.explosions, { x: proj.x, y: proj.y, radius: proj.explosionRadius, damage: proj.damage, duration: 30, color: proj.color }]);
                playSound('enemyDefeat');
            }
            currentProjectiles.splice(i, 1);
        }
    }
    state.setProjectiles(currentProjectiles);

    state.explosions.forEach(exp => {
        const dx = player.x - exp.x;
        const dy = player.y - exp.y;
        if (Math.sqrt(dx * dx + dy * dy) < exp.radius) {
            player.health -= exp.damage * (deltaTime / 16.67);
        }
    });

    if (player.health <= 0) {
        player.health = 0;
        if (!config.gamePaused) {
            config.gamePaused = true; // Pausa o jogo imediatamente
            playSound('gameOver');
            stopMusic();

            // Transforma a lógica de fim de jogo em uma função assíncrona
            (async () => {
                const finalScore = (config.particlesAbsorbed * 1) + (config.enemiesDestroyed * 10) + (config.level * 50) + (config.wave.number * 20);
                const username = localStorage.getItem('username') || 'Viajante';

                // Exibe a tela de Game Over PRIMEIRO
                ui.showGameOver({
                    level: config.level,
                    wave: config.wave.number,
                    particlesAbsorbed: config.particlesAbsorbed,
                    enemiesDestroyed: config.enemiesDestroyed,
                    finalScore: finalScore
                });

                // Envia a pontuação e DEPOIS atualiza o placar
                await submitScore(username, finalScore);
                await ui.displayLeaderboard();
            })();
        }
    }
}

/**
 * O loop principal do jogo, que é chamado a cada frame pela `requestAnimationFrame`.
 * @param {number} timestamp - O timestamp fornecido pela `requestAnimationFrame`.
 */
function gameLoop(timestamp) {
    if (!state.gameLoopRunning) return;
    requestAnimationFrame(gameLoop);
    state.setLastTime(state.lastTime || timestamp);
    const deltaTime = timestamp - state.lastTime;
    state.setLastTime(timestamp);
    state.incrementFrameCount();
    if (timestamp - state.fpsLastChecked >= 1000) {
        const newFps = Math.round((state.frameCount * 1000) / (timestamp - state.fpsLastChecked));
        state.setFps(newFps, timestamp, 0);
        ui.updateFps(newFps);
    }

    state.setAccumulator(state.accumulator + deltaTime);

    const fixedDeltaTime = 1000 / 60;
    while (state.accumulator >= fixedDeltaTime) {
        updatePhysics(fixedDeltaTime);
        state.setAccumulator(state.accumulator - fixedDeltaTime);
    }

    ui.updateHealthBar(config.players[0].health, config.players[0].maxHealth);
    ui.updateXPBar(config.xp, config.level);
    ui.updateBigBangChargeBar(config.bigBangCharge);
    ui.updateBigBangIndicator(config.bigBangCharge);
    updateStats();
    render();
}

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// > INICIALIZAÇÃO E CONFIGURAÇÃO DE CONTROLES
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

/**
 * Pré-carrega as imagens dos inimigos para evitar que apareçam subitamente no jogo.
 */
function preloadImages() {
    for (const type of Object.values(config.enemySystem.types)) {
        if (type.imageUrl) {
            const img = new Image();
            img.src = type.imageUrl;
            imageCache[type.imageUrl] = img;
        }
    }
}

/**
 * Configura todos os `event listeners` para os controlos do jogo.
 */
function setupControls() {
    const player = config.players[0];
    const menu = document.getElementById('menu');

    const handleFirstInteraction = () => {
        unlockAudio();
        playMusic('mainTheme');
        canvas.removeEventListener('mousemove', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
    };

    canvas.addEventListener('mousemove', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    canvas.addEventListener('mousemove', (e) => { player.x = e.clientX; player.y = e.clientY; });

    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'm') {
            toggleMenu(menu, menu.style.display !== 'block');
        }
        if (config.gamePaused && key !== 'm') return;
        switch (key) {
            case '1': player.mode = 'attract'; break;
            case '2': player.mode = 'repel'; break;
            case '3': player.mode = 'vortex'; break;
            case '4': activateBigBang(); break;
        }
        ui.highlightActiveMode(player.mode);
    });

    window.addEventListener('keyup', (e) => {
        if (['1', '2', '3'].includes(e.key)) {
            player.mode = 'normal';
            ui.highlightActiveMode(player.mode);
        }
    });

    document.getElementById('menu-toggle').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu(menu, menu.style.display !== 'block');
    });

    menu.addEventListener('click', (e) => {
        const menuItem = e.target.closest('.menu-item');
        if (!menuItem) return;
        const action = menuItem.getAttribute('data-action');

        toggleMenu(menu, false);

        switch (action) {
            case 'setMode':
                player.mode = menuItem.getAttribute('data-mode');
                ui.highlightActiveMode(player.mode);
                break;
            case 'showGalaxies':
                toggleMenu(document.getElementById('galaxy-map'), true);
                ui.showGalaxyMap(config.galaxies.list, config.galaxies.unlocked, (key) => {
                    config.galaxies.current = key;
                    localStorage.setItem('selectedGalaxy', key); // Salva a escolha
                    document.body.style.backgroundImage = config.galaxies.list[key].background;
                    showUnlockMessage(`Galáxia ${config.galaxies.list[key].name} selecionada!`);
                    toggleMenu(document.getElementById('galaxy-map'), false);
                });
                break;
            case 'showSkills':
                {
                    const skillTreeMenu = document.getElementById('skill-tree');
                    toggleMenu(skillTreeMenu, true);
                    const refreshUI = () => {
                        ui.showSkillTree(config.skills.tree, config.skillPoints, (skillKey) => {
                            upgradeSkill(skillKey);
                            refreshUI();
                        });
                    };
                    refreshUI();
                }
                break;
            case 'showSkins':
                toggleMenu(document.getElementById('skins-modal'), true);
                ui.showSkinsModal(config.skins.available, config.skins.current, (id) => {
                    config.skins.current = id;
                    player.face = config.skins.available.find(s => s.id === id).emoji;
                    showUnlockMessage(`Skin selecionada!`);
                    // CORREÇÃO: Despausa o jogo após a seleção da skin.
                    toggleMenu(document.getElementById('skins-modal'), false);
                });
                break;
            case 'resetGame':
                restartGame();
                break;
            case 'toggleSound':
                config.soundEnabled = !config.soundEnabled;
                ui.toggleSoundUI(config.soundEnabled);
                if (config.soundEnabled) {
                    playMusic('mainTheme');
                } else {
                    stopMusic();
                }
                break;
        }
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
        toggleMenu(null, false);
        restartGame();
    });

    document.getElementById('close-galaxy-map').addEventListener('click', () => {
        toggleMenu(document.getElementById('galaxy-map'), false);
    });
    document.getElementById('close-skill-tree').addEventListener('click', () => {
        toggleMenu(document.getElementById('skill-tree'), false);
    });
    document.getElementById('close-skins').addEventListener('click', () => {
        toggleMenu(document.getElementById('skins-modal'), false);
    });
}

/**
 * Função principal que inicializa o jogo quando a página é carregada.
 */
export function initGame() {
    const player = config.players[0];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    // CORREÇÃO: Garante que os valores de base do jogador são definidos na inicialização.
    // Isso evita que a vida comece como 'undefined' e cause um game over imediato.
    if (player.baseMaxHealth === undefined) {
        player.baseMaxHealth = player.maxHealth;
    }
    player.health = player.baseMaxHealth; // Garante que a vida seja restaurada no início.

    if (player.baseRadius === undefined) {
        player.baseRadius = player.radius;
    }
    if (player.baseAttractionDamage === undefined) {
        player.baseAttractionDamage = player.attractionDamage;
    }
    if (config.baseXpMultiplier === undefined) {
        config.baseXpMultiplier = 1;
        config.xpMultiplier = 1;
    }

    preloadImages();
    requestAnimationFrame(spawnBatch);

    initSoundSystem();
    preloadMusic('mainTheme');
    ui.updateHealthBar(player.health, player.maxHealth);
    ui.updateXPBar(config.xp, config.level);
    ui.updateBigBangChargeBar(config.bigBangCharge);
    updateStats();
    ui.updateQuestUI(config.quests.active);
    ui.toggleSoundUI(config.soundEnabled);

    const username = localStorage.getItem('username') || 'Viajante';
    document.getElementById('galaxy-owner-display').textContent = `Galáxia de ${username}`;

    // Define o background inicial, carregando a preferência do jogador
    const savedGalaxy = localStorage.getItem('selectedGalaxy');
    if (savedGalaxy && config.galaxies.list[savedGalaxy]) {
        config.galaxies.current = savedGalaxy;
    }

    const currentGalaxy = config.galaxies.list[config.galaxies.current];
    if (currentGalaxy && currentGalaxy.background) {
        document.body.style.backgroundImage = currentGalaxy.background;
    }

    setupControls();
    state.setGameLoopRunning(true);
    requestAnimationFrame(gameLoop);

    ui.displayLeaderboard();
}

// Configura os listeners de eventos globais.
// Removido o window.addEventListener('load', initGame) para evitar race conditions com módulos.
// A inicialização agora é chamada diretamente.

// Expondo o 'config' para o escopo global para permitir a manipulação em testes
if (typeof window.exposeConfig === 'function') {
    window.exposeConfig(config);
}
initGame();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
