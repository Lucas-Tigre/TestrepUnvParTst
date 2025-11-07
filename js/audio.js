/**
 * @file Gestor de áudio para a música de fundo do jogo.
 * @module js/audio
 */

/**
 * Mapeamento dos nomes das faixas para os seus arquivos de áudio correspondentes.
 * @type {Object.<string, string>}
 */
const musicTracks = {
    mainTheme: 'assets/audio/WordCLASSIC.mp3',
    bossBattle: 'assets/audio/10.40BFHT.mp3',
    finalBossTheme: 'assets/audio/FinalBoss50.mp3'
};

/**
 * Cache para armazenar os elementos de áudio pré-carregados e evitar recarregamentos.
 * @type {Object.<string, HTMLAudioElement>}
 */
const audioCache = {};

/**
 * A faixa de áudio atualmente em reprodução ou em transição.
 * @type {{audio: HTMLAudioElement, trackName: string}|null}
 */
let currentTrack = null;

/**
 * Flag para controlar o estado de fading (transição) entre faixas.
 * @type {boolean}
 */
let isFading = false;

/**
 * Pré-carrega uma faixa de áudio e a armazena no cache.
 * @param {string} trackName - O nome da faixa a ser pré-carregada (deve ser uma chave em `musicTracks`).
 */
export function preloadMusic(trackName) {
    if (!musicTracks[trackName] || audioCache[trackName]) {
        return;
    }
    const audio = new Audio(musicTracks[trackName]);
    audio.preload = 'auto';
    audio.load();
    audioCache[trackName] = audio;
    console.log(`Pré-carregando música: ${trackName}`);
}

/**
 * Obtém um elemento de áudio do cache ou o cria se não existir.
 * @private
 * @param {string} trackName - A chave da faixa no objeto `musicTracks`.
 * @returns {HTMLAudioElement|null} O elemento de áudio configurado ou nulo se a faixa não for encontrada.
 */
function getAudioElement(trackName) {
    if (audioCache[trackName]) {
        const audio = audioCache[trackName];
        audio.currentTime = 0; // Reinicia a música
        return audio;
    }

    if (!musicTracks[trackName]) {
        console.error(`Faixa de música "${trackName}" não encontrada.`);
        return null;
    }

    const audio = new Audio(musicTracks[trackName]);
    audio.loop = true;
    audioCache[trackName] = audio;
    return audio;
}

import { config } from './config.js';

/**
 * Toca uma faixa musical, fazendo um fade out da faixa atual e um fade in da nova.
 * @param {string} trackName - O nome da faixa a ser tocada.
 */
export function playMusic(trackName) {
    if (!config.soundEnabled) return;
    if (isFading || (currentTrack && currentTrack.trackName === trackName)) {
        return;
    }

    const newAudio = getAudioElement(trackName);
    if (!newAudio) return;

    newAudio.volume = 0;
    isFading = true;

    if (currentTrack && currentTrack.audio.volume > 0) {
        let fadeOutInterval = setInterval(() => {
            currentTrack.audio.volume = Math.max(0, currentTrack.audio.volume - 0.05);
            if (currentTrack.audio.volume === 0) {
                clearInterval(fadeOutInterval);
                currentTrack.audio.pause();
                startFadeIn();
            }
        }, 100);
    } else {
        startFadeIn();
    }

    function startFadeIn() {
        currentTrack = { audio: newAudio, trackName: trackName };
        currentTrack.audio.play().catch(e => console.error("Falha ao tocar áudio:", e));

        let fadeInInterval = setInterval(() => {
            currentTrack.audio.volume = Math.min(0.5, currentTrack.audio.volume + 0.05);
            if (currentTrack.audio.volume >= 0.5) {
                clearInterval(fadeInInterval);
                isFading = false;
            }
        }, 100);
    }
}

/**
 * Para a música atualmente em reprodução com um efeito de fade out.
 */
export function stopMusic() {
    if (!currentTrack || isFading) return;

    // Se o som estiver desativado, apenas pare a música imediatamente.
    if (!config.soundEnabled) {
        if (currentTrack) {
            currentTrack.audio.pause();
            currentTrack.audio.currentTime = 0;
            currentTrack = null;
        }
        return;
    }

    isFading = true;
    let fadeOutInterval = setInterval(() => {
        currentTrack.audio.volume = Math.max(0, currentTrack.audio.volume - 0.05);
        if (currentTrack.audio.volume === 0) {
            clearInterval(fadeOutInterval);
            currentTrack.audio.pause();
            currentTrack = null;
            isFading = false;
        }
    }, 100);
}
