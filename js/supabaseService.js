/**
 * @file Módulo de serviço para interações com o Supabase, como o envio de pontuações e a obtenção do leaderboard.
 * @module js/supabaseService
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig.js';

/**
 * A instância do cliente Supabase, inicializada apenas se as credenciais estiverem disponíveis.
 * @type {import('@supabase/supabase-js').SupabaseClient|null}
 */
let supabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== "SUA_URL_DO_SUPABASE_AQUI" && SUPABASE_ANON_KEY !== "SUA_CHAVE_ANON_AQUI") {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (error) {
        console.error("Falha ao inicializar o Supabase. Verifique suas credenciais.", error);
    }
} else {
    console.warn("Credenciais do Supabase não encontradas. As funcionalidades online estão desativadas.");
}

// Exporta a instância do cliente para ser usada em outros módulos
export { supabase };

/**
 * Envia a pontuação de um jogador para a tabela 'leaderboard'.
 * @param {string} username - O nome do jogador.
 * @param {number} score - A pontuação do jogador (partículas absorvidas).
 * @returns {Promise<object|null>} O resultado da inserção ou nulo em caso de erro.
 */
export async function submitScore(username, score) {
    if (!supabase) return null;

    if (!username || typeof score !== 'number') {
        console.error("Nome de usuário ou pontuação inválida.");
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .insert([{ username, score }])
            .select();

        if (error) {
            console.error('Erro ao enviar pontuação:', error);
            return null;
        }

        console.log('Pontuação enviada com sucesso:', data);
        return data;
    } catch (error) {
        console.error('Falha inesperada ao enviar pontuação:', error);
        return null;
    }
}

/**
 * Busca os 10 melhores jogadores da tabela 'leaderboard', garantindo que cada jogador apareça apenas uma vez com sua maior pontuação.
 * @returns {Promise<Array<{username: string, score: number}>>} Uma lista com os melhores jogadores ou uma lista vazia em caso de erro.
 */
export async function getLeaderboard() {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('username, score')
            .order('score', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Erro ao buscar placar:', error);
            return [];
        }

        const highestScores = new Map();
        for (const entry of data) {
            if (!highestScores.has(entry.username) || entry.score > highestScores.get(entry.username)) {
                highestScores.set(entry.username, entry.score);
            }
        }

        const uniqueScores = Array.from(highestScores, ([username, score]) => ({ username, score }));

        uniqueScores.sort((a, b) => b.score - a.score);

        return uniqueScores.slice(0, 10);

    } catch (error) {
        console.error('Falha inesperada ao buscar placar:', error);
        return [];
    }
}
