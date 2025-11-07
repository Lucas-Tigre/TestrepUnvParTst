/**
 * @file Ficheiro de configuração central para todos os parâmetros de jogabilidade.
 * @module js/config
 */

/**
 * @typedef {Object} ParticleColorRange
 * @property {number[]} h - Variação de Matiz (Hue).
 * @property {number[]} s - Variação de Saturação (Saturation).
 * @property {number[]} l - Variação de Luminosidade (Lightness).
 */

/**
 * @typedef {Object} Galaxy
 * @property {string} name - O nome da galáxia.
 * @property {string} description - A descrição da galáxia.
 * @property {string} unlockCondition - A condição para desbloquear a galáxia.
 * @property {ParticleColorRange} particleColorRange - A gama de cores das partículas.
 * @property {string} background - A imagem de fundo da galáxia.
 */

/**
 * @typedef {Object} Player
 * @property {number} id - O identificador do jogador.
 * @property {number|null} x - A posição X do jogador.
 * @property {number|null} y - A posição Y do jogador.
 * @property {string} mode - O modo de interação do jogador ('attract' ou 'repel').
 * @property {string} color - A cor do jogador.
 * @property {number} radius - O raio de interação do jogador.
 * @property {number} size - O tamanho do jogador.
 * @property {string} face - O emoji que representa o jogador.
 * @property {number} faceSize - O tamanho do emoji.
 * @property {number} health - A vida atual do jogador.
 * @property {number} maxHealth - A vida máxima do jogador.
 * @property {number} collisionDamage - O dano que o jogador causa ao colidir com inimigos.
 * @property {number} attractionDamage - O dano por segundo do vórtice de atração.
 * @property {boolean} isPoweredUp - Se o jogador está com power-up.
 * @property {number} powerUpTimer - O temporizador do power-up.
 * @property {number} invincibilityCooldown - A duração da invencibilidade em frames após sofrer dano.
 * @property {number} invincibleTimer - O temporizador atual da invencibilidade.
 */

/**
 * @typedef {Object} EnemyType
 * @property {string} name - O nome do tipo de inimigo.
 * @property {number} chance - A probabilidade de aparecimento deste tipo de inimigo.
 * @property {number} speed - A velocidade do inimigo.
 * @property {string} behavior - O comportamento do inimigo.
 * @property {string[]} face - Os emojis que representam o inimigo.
 * @property {string} color - A cor do inimigo.
 * @property {number} [healthMultiplier] - O multiplicador de vida do inimigo.
 * @property {number} [huntRadius] - O raio de perseguição do inimigo.
 * @property {number} [preferredDistance] - A distância preferida do inimigo em relação ao jogador.
 * @property {number} [shootCooldown] - O tempo de recarga do tiro do inimigo.
 * @property {string} [projectileType] - O tipo de projétil que o inimigo dispara.
 * @property {number} [damage] - O dano do inimigo.
 * @property {boolean} [ignoresAttraction] - Se o inimigo ignora a atração do jogador.
 * @property {boolean} [ignoresCollision] - Se o inimigo ignora a colisão com o jogador.
 * @property {string|null} [imageUrl] - A URL da imagem do inimigo.
 * @property {number} [size] - O tamanho do inimigo.
 * @property {number} [health] - A vida do inimigo.
 */

/**
 * @typedef {Object} Skill
 * @property {string} name - O nome da habilidade.
 * @property {number} cost - O custo da habilidade.
 * @property {number} maxLevel - O nível máximo da habilidade.
 * @property {string} effect - O efeito da habilidade.
 * @property {number} currentLevel - O nível atual da habilidade.
 * @property {string[]} [requires] - Os pré-requisitos para desbloquear a habilidade.
 */

/**
 * @typedef {Object} Quest
 * @property {string} id - O identificador da missão.
 * @property {number} target - O objetivo da missão.
 * @property {number} current - O progresso atual da missão.
 * @property {number} reward - A recompensa da missão.
 * @property {string} title - O título da missão.
 */

/**
 * @typedef {Object} StoryScene
 * @property {string} npc - O NPC da cena.
 * @property {string} text - O texto da cena.
 * @property {string} background - O fundo da cena.
 * @property {string} effect - O efeito da cena.
 * @property {boolean} [shake] - Se a cena deve tremer.
 */

/**
 * @typedef {Object} Skin
 * @property {string} id - O identificador da skin.
 * @property {string} name - O nome da skin.
 * @property {string} emoji - O emoji da skin.
 * @property {string} type - O tipo de skin ('normal' ou 'premium').
 * @property {boolean} unlocked - Se a skin está desbloqueada.
 * @property {string} [unlockCondition] - A condição para desbloquear a skin.
 */

/**
 * Objeto de configuração principal que contém todos os parâmetros do jogo.
 * @type {Object}
 * @property {number} particleCount - Número total de partículas no mapa.
 * @property {number} mouseRadius - Raio de interação do mouse (não utilizado atualmente).
 * @property {Object} particleRespawn - Configurações de respawn de partículas.
 * @property {number} particleRespawn.minParticles - Se o número de partículas cair abaixo disso, novas partículas são geradas.
 * @property {number} particleRespawn.respawnAmount - Quantidade de partículas a serem geradas.
 * @property {number} particleRespawn.checkInterval - Intervalo (em frames) para verificar a necessidade de gerar novas partículas.
 * @property {Object} healingParticle - Configurações de partículas de cura.
 * @property {number} healingParticle.dropChance - Probabilidade de um inimigo dropar uma partícula de cura.
 * @property {number} healingParticle.amount - Quantidade de vida que a partícula restaura.
 * @property {Object} galaxies - Configurações de galáxias.
 * @property {string[]} galaxies.unlocked - As galáxias desbloqueadas.
 * @property {string} galaxies.current - A galáxia atual.
 * @property {Object.<string, Galaxy>} galaxies.list - A lista de galáxias.
 * @property {Player[]} players - A lista de jogadores.
 * @property {Object} enemySystem - Configurações do sistema de inimigos.
 * @property {number} enemySystem.spawnMargin - Distância da borda da tela para o nascimento de inimigos.
 * @property {number} enemySystem.baseHealth - Vida base dos inimigos.
 * @property {number} enemySystem.baseDamage - Dano base dos inimigos.
 * @property {number} enemySystem.damageIncreasePerLevel - Dano adicional por onda.
 * @property {number} enemySystem.baseSize - Tamanho base dos inimigos.
 * @property {number} enemySystem.eliteSizeMultiplier - Multiplicador de tamanho para inimigos de elite.
 * @property {number} enemySystem.healthIncreasePerLevel - Aumento de vida por nível.
 * @property {number} enemySystem.collisionCooldown - Frames de invencibilidade do inimigo após colidir com o jogador.
 * @property {Object.<string, EnemyType>} enemySystem.types - Os tipos de inimigos.
 * @property {Object} skills - A árvore de habilidades.
 * @property {Object.<string, Skill>} skills.tree - A lista de habilidades.
 * @property {number} xp - A experiência atual do jogador.
 * @property {number} globalXpMultiplier - Multiplicador global para ganho de XP.
 * @property {number} level - O nível atual do jogador.
 * @property {number} skillPoints - Os pontos de habilidade atuais do jogador.
 * @property {boolean} soundEnabled - Se o som está ativado.
 * @property {boolean} gamePaused - Se o jogo está pausado.
 * @property {boolean} bossFightActive - Se uma luta contra um chefe está ativa.
 * @property {number} particlesAbsorbed - O número de partículas absorvidas.
 * @property {number} enemiesDestroyed - O número de inimigos destruídos.
 * @property {number} gameTime - O tempo de jogo.
 * @property {Object} wave - Configurações de onda.
 * @property {number} wave.number - O número da onda atual.
 * @property {number} wave.enemiesToSpawn - O número de inimigos a serem gerados.
 * @property {number} wave.spawned - O número de inimigos gerados.
 * @property {number} wave.timer - O temporizador da onda.
 * @property {number} bigBangCharge - A carga atual do Big Bang.
 * @property {number} bigBangChargeRate - Pontos de carga por inimigo derrotado.
 * @property {boolean} isMobile - Se o dispositivo é um telemóvel.
 * @property {Object} quests - As missões do jogo.
 * @property {Quest[]} quests.active - As missões ativas.
 * @property {string[]} quests.completed - As missões concluídas.
 * @property {Object} soundEffects - Cache para efeitos sonoros.
 * @property {Object} story - As configurações da história.
 * @property {boolean} story.enabled - Se a história está ativada.
 * @property {number} story.currentScene - A cena atual da história.
 * @property {StoryScene[]} story.scenes - As cenas da história.
 * @property {Object} npc - As configurações do NPC.
 * @property {boolean} npc.active - Se o NPC está ativo.
 * @property {number} npc.currentDialog - O diálogo atual do NPC.
 * @property {string[]} npc.dialogs - Os diálogos do NPC.
 * @property {string} npc.bossDialog - O diálogo do chefe do NPC.
 * @property {Object} skins - As skins do jogo.
 * @property {Skin[]} skins.available - As skins disponíveis.
 * @property {string} skins.current - A skin atual.
 */
export const config = {
    // =============================================
    // CONFIGURAÇÕES GERAIS DE JOGABILIDADE
    // =============================================
    particleCount: 300, // Número total de partículas no mapa.
    mouseRadius: 150,   // Raio de interação do mouse (não utilizado atualmente).
    particleRespawn: {
        minParticles: 150,     // Se o número de partículas cair abaixo disso, novas partículas são geradas.
        respawnAmount: 50,     // Quantidade de partículas a serem geradas.
        checkInterval: 30      // Intervalo (em frames) para verificar a necessidade de gerar novas partículas.
    },

    healingParticle: {
        dropChance: 0.1, // 10% de chance de um inimigo dropar uma partícula de cura
        amount: 5        // Quantidade de vida que a partícula restaura
    },

    // =============================================
    // GALÁXIAS (APARÊNCIA E FUNDOS DE TELA)
    // =============================================
    galaxies: {
        unlocked: ['classic'],
        current: 'classic',
        list: {
            classic: {
                name: "Clássico",
                description: "O universo original de partículas.",
                unlockCondition: "Inicial",
                particleColorRange: { h: [0, 360], s: [80, 90], l: [50, 70] },
                // FUNDO 1: Imagem de fundo para a galáxia Clássico.
                background: "url('assets/images/MapaIN.png')"
            },
            neon: {
                name: "Neon",
                description: "Cores vibrantes e partículas brilhantes.",
                unlockCondition: "Alcançar nível 5",
                particleColorRange: { h: [280, 320], s: [100, 100], l: [60, 80] },
                // FUNDO 2: Imagem de fundo para a galáxia Neon.
                background: "url('assets/images/MapaIN.png')"
            },
            fire: {
                name: "O Absoluto",
                description: "Partículas flamejantes e inimigos furiosos.",
                unlockCondition: "Derrotar 50 inimigos",
                particleColorRange: { h: [10, 40], s: [80, 100], l: [50, 70] },
                // FUNDO 3: Imagem de fundo para a galáxia Inferno.
                background: "url('assets/images/MapaFN.png')"
            },
        }
    },

    // =============================================
    // CONFIGURAÇÕES DO JOGADOR
    // =============================================
    players: [
        {
            id: 1,
            x: null,
            y: null,
            mode: 'attract',
            color: '#3d0aa3ff',
            radius: 150,
            size: 30,
            face: "🐶",
            faceSize: 28,
            health: 100,
            maxHealth: 100,
            collisionDamage: 10,     // Dano que o jogador causa ao colidir com inimigos.
            attractionDamage: 2,  // Dano por segundo do vórtice de atração.
            baseAttractionDamage: 2, // Dano base para ser usado como referência.
            isPoweredUp: false,
            powerUpTimer: 0,
            invincibilityCooldown: 0, // Duração da invencibilidade em frames após sofrer dano.
            invincibleTimer: 0         // Timer atual da invencibilidade.
        }
    ],

    // =============================================
    // SISTEMA DE INIMIGOS
    // =============================================
    enemySystem: {
        spawnMargin: 100, // Distância da borda da tela para o nascimento de inimigos.
        baseHealth: 15, // REBALANCEAMENTO: Reduzido para facilitar o início.
        baseDamage: 3, // REBALANCEAMENTO: Reduzido para diminuir a dificuldade.
        damageIncreasePerLevel: 0.2, // Dano adicional por onda.
        baseSize: 20,
        eliteSizeMultiplier: 1.3,
        healthIncreasePerLevel: 0.05, // REBALANCEAMENTO: Reduzido para uma curva de dificuldade mais suave.
        collisionCooldown: 30, // Frames de invencibilidade do inimigo após colidir com o jogador.
        types: {
            fast: {
                name: "Rápido",
                chance: 0.55,
                speed: 3.5,
                behavior: 'hunt',
                huntRadius: 500,   // Adicionado raio de perseguição
                face: ["😠", "😡", "😤"],
                color: '#FFDD00',
                healthMultiplier: 0.8
            },
            hunter: {
                name: "Caçador",
                chance: 0.25,
                speed: 2.0,
                behavior: 'huntAndShoot',
                face: ["🎯", "🔫", "💥"],
                color: '#FF9900',
                huntRadius: 500,
                preferredDistance: 250,
                shootCooldown: 2000,
                projectileType: 'normal'
            },
            cosmic: {
                name: "Cósmico",
                chance: 0.10,
                speed: 4.5,
                behavior: 'crossScreen',
                face: ["☄️", "🌠"],
                color: '#00AAFF',
                damage: 25,
                ignoresAttraction: true,
                ignoresCollision: true
            },
            shooter: {
                name: "Atirador",
                chance:.05,
                speed: 1.5,
                behavior: 'shooter',
                face: ["🛰️", "📡"],
                color: '#00FFFF',
                healthMultiplier: 0.1,
                shootCooldown: 2000,
                projectileType: 'explosive'
            },
            boss: {
                name: "Chefe",
                chance: 0, // Apenas gerado manualmente.
                speed: 2.5,
                behavior: 'hunt',
                // IMAGEM_CHEFE_1: Substitua null pela URL da imagem do chefe.
                imageUrl: null,
                face: ["😈", "💀", "👹"],
                color: '#FF8C00',
                size: 40,
                health: 200,
                huntRadius: 1000,
            },
            finalBoss: {
                name: "Chefe Final",
                chance: 0, // Apenas gerado manualmente.
                speed: 3.0,
                behavior: 'hunt',
                // IMAGEM_CHEFE_2: Substitua null pela URL da imagem do chefe final.
                imageUrl: null,
                face: ["🔥", "💥", "☄️"],
                color: '#DC143C',
                size: 60,
                health: 600,
                huntRadius: 2000,
            }
        }
    },

    // =============================================
    // ÁRVORE DE HABILIDADES
    // =============================================
    skills: {
        tree: {
            attractRadius: {
                name: "Raio de Atração",
                cost: 2,
                maxLevel: 5,
                effect: "Aumenta o raio de atração em 20% por nível.",
                currentLevel: 0
            },
            healthBoost: {
                name: "Vitalidade",
                cost: 1,
                maxLevel: 10,
                effect: "Aumenta a saúde máxima em 10% por nível.",
                currentLevel: 0
            },
            particleMastery: {
                name: "Domínio de Partículas",
                cost: 4,
                maxLevel: 3,
                effect: "Partículas dão 20% mais XP por nível.",
                currentLevel: 0,
                requires: ["attractRadius:3"]
            }
        }
    },

    // =============================================
    // ESTADO INICIAL DO JOGO
    // =============================================
    xp: 0,
    globalXpMultiplier: 2.5, // Multiplicador global para ganho de XP.
    level: 1,
    skillPoints: 0,
    soundEnabled: false,
    gamePaused: false,
    bossFightActive: false,
    particlesAbsorbed: 0,
    enemiesDestroyed: 0,
    gameTime: 0,
    wave: { number: 1, enemiesToSpawn: 3, spawned: 0, timer: 0 }, // REBALANCEAMENTO: Reduzido o número inicial de inimigos.
    bigBangCharge: 0,
    bigBangChargeRate: 5, // Pontos de carga por inimigo derrotado.
    isBigBangAnimating: false,
    bigBangAnimationTimer: 0,
    bigBangEffectTriggered: false,

    // =============================================
    // OUTRAS CONFIGURAÇÕES
    // =============================================
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),

    quests: {
        active: [
            { id: 'absorb100', target: 100, current: 0, reward: 50, title: "Absorver 100 partículas" },
            { id: 'defeat20', target: 20, current: 0, reward: 100, title: "Derrotar 20 inimigos" },
            { id: 'wave5', target: 5, current: 1, reward: 200, title: "Alcançar onda 5" }
        ],
        completed: []
    },

    soundEffects: {}, // Cache para efeitos sonoros.

    story: {
        enabled: true,
        currentScene: 0,
        scenes: [
            {
                npc: "👁️",
                text: "MORTAL... VOCÊ OUSA INVADIR MEU UNIVERSO?",
                background: "radial-gradient(ellipse at center, #200122 0%, #6f0000 100%)",
                effect: "terror"
            },
            {
                npc: "👁️",
                text: "EU SOU AZATHOTH, O DEVORADOR DE GALÁXIAS...",
                background: "radial-gradient(ellipse at center, #000000 0%, #4a0000 100%)",
                effect: "terror"
            },
            {
                npc: "👽",
                text: "*sussurro* Psst... Não olhe diretamente para ele! Use as partículas para se fortalecer...",
                background: "radial-gradient(ellipse at center, #1B2735 0%, #090A0F 100%)",
                effect: "normal"
            },
            {
                npc: "👁️",
                text: "SEU DESTINO É SER DESTRUÍDO COMO TODOS OS OUTROS!",
                background: "radial-gradient(ellipse at center, #300000 0%, #000000 100%)",
                effect: "terror",
                shake: true
            }
        ]
    },

    npc: {
        active: true,
        currentDialog: 0,
        dialogs: [
            "Ah, finalmente acordou... Tava demorando, hein?",
            "Olha só, um novato no universo. Vamos ver quanto tempo você dura...",
            "Cuidado com essas partículas, elas são mais espertas do que parecem!",
            "Tá com medo? Eu também estaria...",
            "Se você chegar no nível 50, algo MUITO grande te espera...",
            "Você realmente acha que está no controle? Kkk...",
            "Pressione 1, 2 ou 3... se conseguir lembrar qual é qual.",
            "Os inimigos estão rindo de você... literalmente.",
            "Você é lento... mas pelo menos é consistente.",
            "Sabia que cada galáxia tem suas próprias leis da física? Divertido, né?",
            "Eu já vi jogadores melhores... mas também vi piores.",
            "Quer um conselho? Não confie nas partículas roxas.",
            "Já perdi a conta de quantos universos eu vi serem destruídos...",
            "Você está evoluindo... mas ainda tem muito o que aprender.",
            "As habilidades que você desbloqueia são só a ponta do iceberg!",
            "Os inimigos estão ficando mais fortes... ou você que está ficando mais fraco?",
            "Você nota como o universo reage às suas ações? Interessante..."
        ],
        bossDialog: "🏆 PARABÉNS! Agora o verdadeiro desafio começa... 🐉"
    },

    skins: {
        available: [
            { id: 'default', name: 'Viajante', emoji: '🐶', type: 'normal', unlocked: true },
            { id: 'cosmic', name: 'Ser Cósmico', emoji: '👽', type: 'premium', unlocked: false, unlockCondition: 'Alcançar nível 10' },
            { id: 'nebula', name: 'Nebulosa', emoji: '🌌', type: 'normal', unlocked: true },
            { id: 'blackhole', name: 'Buraco Negro', emoji: '⚫', type: 'premium', unlocked: false, unlockCondition: 'Derrotar 100 inimigos' },
            { id: 'ancient', name: 'Antigo', emoji: '👁️', type: 'premium', unlocked: false, unlockCondition: 'Completar todas as missões' }
        ],
        current: 'default'
    }
}
