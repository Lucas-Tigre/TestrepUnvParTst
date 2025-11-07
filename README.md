# Universo de Partículas 🌌

Bem-vindo ao Universo de Partículas! Este é um jogo de sobrevivência espacial 2D onde você controla uma entidade cósmica com o poder de manipular partículas e inimigos. Sobreviva a ondas de adversários, suba de nível, desbloqueie habilidades e enfrente chefes poderosos para se tornar o mestre do universo.

## 🚀 Começando

Para executar o projeto localmente, siga estes passos:

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [npm](https://www.npmjs.com/) (normalmente vem com o Node.js)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/universo-de-particulas.git
   ```
2. Navegue para o diretório do projeto:
   ```bash
   cd universo-de-particulas
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```

### Executando o Jogo

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```
2. Abra o seu navegador e vá para `http://localhost:8080`.

## 🎮 Como Jogar

O controle do jogo é simples e intuitivo:

-   **Mover:** Seu personagem segue o cursor do mouse.
-   **Atração (Segure '1' ou clique esquerdo):** Atrai partículas e inimigos para perto de você. Inimigos presos no seu raio de atração sofrem dano contínuo.
-   **Repulsão (Segure '2' ou clique direito):** Empurra partículas e inimigos para longe.
-   **Vórtice (Segure '3'):** Cria um vórtice orbital que puxa inimigos e partículas em uma espiral, causando dano.
-   **Menu (Pressione 'M'):** Abre e fecha o menu do jogo. O jogo pausa enquanto o menu está aberto.

O objetivo é absorver partículas para ganhar XP, subir de nível e fortalecer seu personagem para sobreviver ao maior número de ondas possível.

## ✨ Funcionalidades Principais

-   **Sistema de Níveis e XP:** Absorva partículas para ganhar experiência e subir de nível, até o nível máximo de 50.
-   **Árvore de Habilidades:** Gaste pontos de habilidade ganhos a cada nível para desbloquear e melhorar status como raio de atração, dano do vórtice e vida máxima.
-   **Inimigos Diversificados:** Enfrente uma variedade de inimigos, cada um com comportamentos únicos.
-   **Batalhas de Chefe:** A cada 10 níveis, um Chefe poderoso aparece. No nível 50, prepare-se para o Chefe Final!
-   **Power-Ups:** Colete partículas douradas especiais para ganhar um bônus temporário de dano e alcance.
-   **Customização:** Personalize sua experiência de jogo com diferentes galáxias e skins.

## 🛠️ Estrutura do Projeto

O código do jogo foi organizado de forma modular para ser fácil de entender e modificar. Todos os arquivos principais estão na pasta `js/`:

-   `game.js`: O coração do jogo. Controla o loop principal, a física, a renderização e a inicialização de tudo.
-   `config.js`: O painel de controle do jogo. Aqui você pode ajustar quase tudo: status do jogador, tipos de inimigos, chances de spawn, habilidades, etc.
-   `state.js`: Gerencia o estado dinâmico do jogo, como as posições atuais de inimigos, partículas e projéteis.
-   `ui.js`: Controla a interface do usuário. Qualquer coisa relacionada a menus, barras de vida/XP e painéis é gerenciada aqui.
-   `enemy.js`: Define a lógica de como os inimigos nascem (spawn) e se comportam (IA).
-   `particle.js`: Gerencia as partículas de XP e as partículas hostis dos ataques de chefe.
-   `projectile.js`: Controla os projéteis disparados pelos inimigos.
-   `explosion.js`: Gerencia a lógica e a renderização das explosões.
-   `audio.js`: Controla a reprodução de músicas de fundo.
-   `utils.js`: Contém funções úteis, como o sistema de efeitos sonoros.
-   `supabaseService.js`: Gerencia a comunicação com o Supabase para o leaderboard.
-   `login.js`: Controla a lógica de autenticação na página de login.

## 🎨 Como Customizar

O projeto está preparado para que você possa customizar facilmente os sons e as imagens.

### Áudio

1.  Navegue até a pasta `assets/audio/`.
2.  Substitua os arquivos `.mp3` existentes pelos seus, mantendo os mesmos nomes.

### Imagens

1.  Coloque suas imagens na pasta `assets/images/`.
2.  Abra `js/config.js`.
3.  Na seção `galaxies`, altere a propriedade `background` para o caminho da sua imagem.
4.  Na seção `enemySystem.types`, altere a propriedade `imageUrl` para os chefes.
