/**
 * @file Ficheiro de utilidades com funções de ajuda para som, notificações e lógica de jogo.
 * @module js/utils
 */

import { config } from './config.js';

/**
 * Toca um efeito sonoro pré-carregado.
 * @param {string} soundName - O nome do som a ser tocado (e.g., 'absorb', 'levelUp').
 */
export function playSound(soundName) {
    try {
        if (config.soundEnabled && config.soundEffects[soundName]) {
            config.soundEffects[soundName].currentTime = 0;
            config.soundEffects[soundName].play().catch(e => console.log("Erro ao tocar som:", e));
        }
    } catch (error) {
        console.error("Erro no sistema de som:", error);
    }
}

/**
 * Exibe uma mensagem de notificação animada na tela.
 * @param {string} message - A mensagem a ser exibida.
 */
export function showUnlockMessage(message) {
    const el = document.createElement('div');
    el.className = 'unlock-message';
    el.textContent = message;
    document.body.appendChild(el);

    setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translate(-50%, -50%) scale(1)';

        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translate(-50%, -50%) scale(0.5)';

            setTimeout(() => {
                if (document.body.contains(el)) {
                    document.body.removeChild(el);
                }
            }, 300);
        }, 2000);
    }, 10);
}

/**
 * Carrega todos os efeitos sonoros e as preferências de som do utilizador.
 */
export function initSoundSystem() {
    const soundPaths = {
        // NOTA: Os seguintes ficheiros de áudio estão em falta. As chamadas foram comentadas para evitar erros 404.
    };

    for (const [key, url] of Object.entries(soundPaths)) {
        config.soundEffects[key] = new Audio(url);
        config.soundEffects[key].volume = 0.5;
        config.soundEffects[key].muted = !config.soundEnabled;
        config.soundEffects[key].load();
    }

    const savedSoundPref = localStorage.getItem('soundEnabled');
    if (savedSoundPref !== null) {
        config.soundEnabled = savedSoundPref === 'true';
    }
}

let audioUnlocked = false;
/**
 * Desbloqueia a reprodução de áudio após a primeira interação do utilizador com a página.
 */
export function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    Object.values(config.soundEffects).forEach(sound => {
        sound.play().then(() => sound.pause()).catch(() => {});
    });
}

/**
 * Verifica se o jogador tem XP suficiente para subir de nível.
 * @param {number} level - O nível atual do jogador.
 * @param {number} xp - A quantidade de XP atual do jogador.
 * @param {number} enemiesCount - O número de inimigos na tela.
 * @param {boolean} bossFightActive - Se uma luta de chefe está ativa.
 * @returns {{
 *  newLevel: number,
 *  newXp: number,
 *  skillPointsGained: number,
 *  leveledUp: boolean,
 *  bossToTrigger: number|null,
 *  message: string|null
 * }} Um objeto contendo o novo estado e os eventos que ocorreram.
 */
export function checkLevelUp(level, xp, enemiesCount, bossFightActive) {
    const output = {
        newLevel: level,
        newXp: xp,
        skillPointsGained: 0,
        leveledUp: false,
        bossToTrigger: null,
        message: null,
    };

    const xpNeeded = level * 100;

    if (level < 50 && xp >= xpNeeded) {
        output.newLevel = level + 1;
        output.newXp = xp - xpNeeded;
        output.skillPointsGained = 1;
        output.leveledUp = true;
        output.message = `Nível ${output.newLevel} alcançado! +1 Ponto de Habilidade`;

        if (output.newLevel % 10 === 0) {
            output.bossToTrigger = output.newLevel;
        }
    } else if (level >= 50) {
        output.newXp = xpNeeded;
    }

    if (level === 50 && enemiesCount === 0 && !bossFightActive) {
        output.bossToTrigger = 50;
    }

    return output;
}

/**
 * Cria uma cópia profunda (deep clone) de um objeto.
 * Essencial para evitar mutações de estado indesejadas, especialmente em configurações.
 * @param {T} obj - O objeto a ser clonado.
 * @returns {T} Uma cópia profunda do objeto.
 * @template T
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    // Uma forma simples e eficaz de clonagem profunda para objetos serializáveis em JSON.
    return JSON.parse(JSON.stringify(obj));
}
