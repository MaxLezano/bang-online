import { GameState, Player, Card, Role, Action, Suit, CardValue, Character } from './types';
import i18n from './i18n';

// --- Constants & Data Setup ---

const CHARACTERS: Character[] = [
    { name: 'Vulture Sam', description: 'Take a card when a player is eliminated.', abilityKey: 'char_vulture_sam', hpMod: 0 },
    { name: 'Paul Regret', description: 'All players see you at distance +1.', abilityKey: 'char_paul_regret', hpMod: -1 },
    { name: 'Kit Carlson', description: 'Draw 3 cards, keep 2.', abilityKey: 'char_kit_carlson', hpMod: 0 },
    { name: 'Jesse Jones', description: 'Draw first card from another player\'s hand.', abilityKey: 'char_jesse_jones', hpMod: 0 },
    { name: 'Willy the Kid', description: 'Can play any number of Bang! cards.', abilityKey: 'char_willy_the_kid', hpMod: 0 },
    { name: 'Rose Doolan', description: 'See all players at distance -1.', abilityKey: 'char_rose_doolan', hpMod: 0 },
    { name: 'Bart Cassidy', description: 'Draw a card when hit.', abilityKey: 'char_bart_cassidy', hpMod: 0 },
    { name: 'El Gringo', description: 'Draw a card from player who hits you.', abilityKey: 'char_el_gringo', hpMod: -1 },
    { name: 'Slab the Killer', description: 'Bang! requires 2 Missed! to cancel.', abilityKey: 'char_slab_the_killer', hpMod: 0 },
    { name: 'Suzy Lafayette', description: 'Draw a card when hand is empty.', abilityKey: 'char_suzy_lafayette', hpMod: 0 },
    { name: 'Sid Ketchum', description: 'Discard 2 cards to heal 1 HP.', abilityKey: 'char_sid_ketchum', hpMod: 0 },
    { name: 'Pedro Ramirez', description: 'Draw first card from discard pile.', abilityKey: 'char_pedro_ramirez', hpMod: 0 },
    { name: 'Lucky Duke', description: '"Draw!" checks flip 2 cards, choose 1.', abilityKey: 'char_lucky_duke', hpMod: 0 },
    { name: 'Jourdonnais', description: 'Has a built-in Barrel effect.', abilityKey: 'char_jourdonnais', hpMod: 0 },
    { name: 'Black Jack', description: 'Show 2nd draw card: if Red/Diamond, draw another.', abilityKey: 'char_black_jack', hpMod: 0 },
    { name: 'Calamity Janet', description: 'Can use Bang! as Missed! and vice versa.', abilityKey: 'char_calamity_janet', hpMod: 0 }
];

const generateDeck = (): Card[] => {
    const cards: Card[] = [];
    let idCounter = 0;

    const add = (count: number, template: Partial<Card>, suits: Suit[], values: CardValue[]) => {
        for (let i = 0; i < count; i++) {
            const suit = suits[i % suits.length] || 'hearts';
            const value = values[i % values.length] || 10;
            idCounter++;
            cards.push({
                id: `card-${idCounter}-${template.name?.replace(/\s/g, '')}`,
                nameKey: template.nameKey!,
                descKey: template.descKey!,
                name: template.name!,
                type: template.type!,
                subType: template.subType,
                suit,
                value,
                effectType: template.effectType!,
                effectValue: template.effectValue,
                description: template.description || '',
                range: template.range
            } as Card);
        }
    };

    // --- BROWN CARDS (Actions) ---
    // BANG!
    add(1, { nameKey: 'card_bang_name', descKey: 'card_bang_desc', name: 'BANG!', type: 'Action', subType: 'Attack', effectType: 'bang' }, ['hearts'], [14]);
    add(1, { nameKey: 'card_bang_name', descKey: 'card_bang_desc', name: 'BANG!', type: 'Action', subType: 'Attack', effectType: 'bang' }, ['hearts'], [12]);
    add(1, { nameKey: 'card_bang_name', descKey: 'card_bang_desc', name: 'BANG!', type: 'Action', subType: 'Attack', effectType: 'bang' }, ['hearts'], [13]);
    add(13, { nameKey: 'card_bang_name', descKey: 'card_bang_desc', name: 'BANG!', type: 'Action', subType: 'Attack', effectType: 'bang' }, ['diamonds'], [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    add(9, { nameKey: 'card_bang_name', descKey: 'card_bang_desc', name: 'BANG!', type: 'Action', subType: 'Attack', effectType: 'bang' }, ['clubs'], [2, 3, 4, 5, 6, 7, 8, 9, 14]);

    // Missed!
    add(12, { nameKey: 'card_missed_name', descKey: 'card_missed_desc', name: 'Missed!', type: 'Action', subType: 'Defense', effectType: 'missed' }, ['spades', 'clubs'], [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14]);

    // Beer
    add(6, { nameKey: 'card_beer_name', descKey: 'card_beer_desc', name: 'Beer', type: 'Action', effectType: 'heal', effectValue: 1 }, ['hearts'], [6, 7, 8, 9, 10, 11]);

    // Panic!
    add(4, { nameKey: 'card_panic_name', descKey: 'card_panic_desc', name: 'Panic!', type: 'Action', effectType: 'steal', range: 1 }, ['hearts', 'diamonds', 'hearts'], [11, 12, 14, 8]);

    // Cat Balou
    add(4, { nameKey: 'card_cat_balou_name', descKey: 'card_cat_balou_desc', name: 'Cat Balou', type: 'Action', effectType: 'discard' }, ['hearts', 'diamonds'], [13, 9, 10, 11]);

    // Stagecoach
    add(2, { nameKey: 'card_stagecoach_name', descKey: 'card_stagecoach_desc', name: 'Stagecoach', type: 'Action', effectType: 'draw', effectValue: 2 }, ['spades'], [9, 9]);

    // Wells Fargo
    add(1, { nameKey: 'card_wells_fargo_name', descKey: 'card_wells_fargo_desc', name: 'Wells Fargo', type: 'Action', effectType: 'draw', effectValue: 3 }, ['hearts'], [3]);

    // General Store
    add(2, { nameKey: 'card_general_store_name', descKey: 'card_general_store_desc', name: 'General Store', type: 'Action', effectType: 'store' }, ['clubs', 'spades'], [9, 12]);

    // Duel
    add(3, { nameKey: 'card_duel_name', descKey: 'card_duel_desc', name: 'Duel', type: 'Action', effectType: 'duel' }, ['diamonds', 'spades', 'clubs'], [12, 11, 8]);

    // Indians!
    add(2, { nameKey: 'card_indians_name', descKey: 'card_indians_desc', name: 'Indians!', type: 'Action', effectType: 'indians' }, ['diamonds'], [13, 14]);

    // Gatling
    add(1, { nameKey: 'card_gatling_name', descKey: 'card_gatling_desc', name: 'Gatling', type: 'Action', effectType: 'damage_all' }, ['hearts'], [10]);

    // Saloon
    add(1, { nameKey: 'card_saloon_name', descKey: 'card_saloon_desc', name: 'Saloon', type: 'Action', effectType: 'saloon' }, ['hearts'], [5]);

    // --- BLUE CARDS (Equipment) ---
    // Weapons
    add(1, { nameKey: 'card_volcanic_name', descKey: 'card_volcanic_desc', name: 'Volcanic', type: 'Equipment', subType: 'Weapon', range: 1, effectType: 'equip' }, ['spades'], [10]);
    add(1, { nameKey: 'card_volcanic_name', descKey: 'card_volcanic_desc', name: 'Volcanic', type: 'Equipment', subType: 'Weapon', range: 1, effectType: 'equip' }, ['clubs'], [10]);
    add(3, { nameKey: 'card_schofield_name', descKey: 'card_schofield_desc', name: 'Schofield', type: 'Equipment', subType: 'Weapon', range: 2, effectType: 'equip' }, ['clubs', 'spades'], [11, 12, 13]);
    add(1, { nameKey: 'card_remington_name', descKey: 'card_remington_desc', name: 'Remington', type: 'Equipment', subType: 'Weapon', range: 3, effectType: 'equip' }, ['clubs'], [14]);
    add(1, { nameKey: 'card_rev_carabine_name', descKey: 'card_rev_carabine_desc', name: 'Rev. Carabine', type: 'Equipment', subType: 'Weapon', range: 4, effectType: 'equip' }, ['clubs'], [14]);
    add(1, { nameKey: 'card_winchester_name', descKey: 'card_winchester_desc', name: 'Winchester', type: 'Equipment', subType: 'Weapon', range: 5, effectType: 'equip' }, ['spades'], [8]);

    // Items
    add(2, { nameKey: 'card_mustang_name', descKey: 'card_mustang_desc', name: 'Mustang', type: 'Equipment', subType: 'Utility', effectType: 'mustang', effectValue: 1 }, ['hearts'], [8, 9]);
    add(1, { nameKey: 'card_scope_name', descKey: 'card_scope_desc', name: 'Scope', type: 'Equipment', subType: 'Utility', effectType: 'scope', effectValue: 1 }, ['spades'], [14]);
    add(1, { nameKey: 'card_scope_name', descKey: 'card_scope_desc', name: 'Scope', type: 'Equipment', subType: 'Utility', effectType: 'scope', effectValue: 1 }, ['spades'], [14]);
    add(2, { nameKey: 'card_barrel_name', descKey: 'card_barrel_desc', name: 'Barrel', type: 'Action', subType: 'Defense', effectType: 'missed' }, ['spades'], [12, 13]);
    // Alijo (Hideout) - Custom Card
    add(2, { nameKey: 'card_alijo_name', descKey: 'card_alijo_desc', name: 'Alijo', type: 'Equipment', subType: 'Utility', effectType: 'hideout' }, ['clubs', 'spades'], [13, 9]);
    add(3, { nameKey: 'card_jail_name', descKey: 'card_jail_desc', name: 'Jail', type: 'Status', effectType: 'jail' }, ['spades', 'hearts'], [10, 11, 4]);
    add(1, { nameKey: 'card_dynamite_name', descKey: 'card_dynamite_desc', name: 'Dynamite', type: 'Status', effectType: 'dynamite' }, ['hearts'], [2]);

    return shuffle(cards);
};

function shuffle<T>(array: T[]): T[] {
    // Fisher-Yates Shuffle
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Distance Calculation
export function calculateDistance(players: Player[], p1Id: string, p2Id: string, sourceMod: number = 0, targetMod: number = 0): number {
    const p1Idx = players.findIndex(p => p.id === p1Id);
    const p2Idx = players.findIndex(p => p.id === p2Id);
    if (p1Idx === -1 || p2Idx === -1) return 999;

    const countHops = (start: number, end: number, dir: 1 | -1) => {
        let dist = 0;
        let curr = start;
        while (curr !== end) {
            curr = (curr + dir + players.length) % players.length;
            if (!players[curr].isDead || curr === end) dist++;
        }
        return dist;
    };

    const cw = countHops(p1Idx, p2Idx, 1);
    const ccw = countHops(p1Idx, p2Idx, -1);

    const physicalDist = Math.min(cw, ccw);
    let finalDist = physicalDist + targetMod - sourceMod;
    if (finalDist < 1) finalDist = 1;
    return finalDist;
}

// Helper for "Draw!" mechanics
function checkDraw(deck: Card[], discardPile: Card[]): { drawnCard: Card, deck: Card[], discardPile: Card[] } {
    let newDeck = [...deck];
    let newDiscard = [...discardPile];

    if (newDeck.length === 0) {
        if (newDiscard.length === 0) {
            throw new Error("No cards to draw!");
        }
        newDeck = shuffle(newDiscard);
        newDiscard = [];
    }

    const drawnCard = newDeck.shift()!;
    newDiscard.push(drawnCard);

    return { drawnCard, deck: newDeck, discardPile: newDiscard };
}

// --- Damage & Death Logic Helper ---
export function handleDamage(
    state: GameState,
    targetIndex: number,
    damage: number,
    attackerIndex: number | null, // null if environment/dynamite
    deck: Card[],
    discardPile: Card[],
    logs: string[]
): { players: Player[], deck: Card[], discardPile: Card[], logs: string[] } {
    let newPlayers = [...state.players];
    let newDeck = [...deck];
    let newDiscard = [...discardPile];
    let newLogs = [...logs];

    let target = newPlayers[targetIndex];
    // prevHp removed (unused)

    // 1. Apply Damage
    target.hp -= damage;
    newLogs.push(` | ${target.name} takes ${damage} damage! (HP: ${target.hp})`);

    // Character Ability: Bart Cassidy (Draw on hit)
    if (target.character === 'Bart Cassidy' && damage > 0) {
        newLogs.push(`🎭 Bart Cassidy draws a card for taking damage!`);
        const check = checkDraw(newDeck, newDiscard);
        newDeck = check.deck;
        newDiscard = check.discardPile;
        target.hand.push(check.drawnCard);
    }

    // Character Ability: El Gringo (Steal card from attacker on hit)
    if (target.character === 'El Gringo' && damage > 0 && attackerIndex !== null && attackerIndex !== targetIndex) {
        const attacker = newPlayers[attackerIndex];
        if (attacker.hand.length > 0) {
            const randIdx = Math.floor(Math.random() * attacker.hand.length);
            const stolenCard = attacker.hand[randIdx];
            attacker.hand.splice(randIdx, 1);
            target.hand.push(stolenCard);
            newLogs.push(`🎭 El Gringo steals a card from ${attacker.name} after being hit!`);
            newPlayers[attackerIndex] = attacker; // Update attacker ref
        }
    }

    // 2. Death Save (Beer) - Only if more than 2 players alive (including current victim potentially saving themselves)
    if (target.hp <= 0) {
        const playersAlive = newPlayers.filter(p => !p.isDead).length;
        // Logic: playersAlive includes the victim because isDead isn't set yet.
        // Rule: Beer has no effect if only 2 players are in the game.
        // If playersAlive is 2, it means it's a head-to-head.

        if (playersAlive > 2) {
            const beerIdx = target.hand.findIndex(c => c.effectType === 'heal' || c.effectType === 'beer');
            if (beerIdx !== -1) {
                // Auto-Use Beer
                const beerCard = target.hand[beerIdx];

                // Double check if standard "heal" logic allows this, but for Death Save we force it.
                target.hand.splice(beerIdx, 1);
                newDiscard.push(beerCard);
                target.hp = 1; // Revive to 1
                newLogs.push(`🍺 ${target.name} uses Beer to survive!`);
            }
        } else {
            newLogs.push(`🚫 Beer has no effect in Head-to-Head!`);
        }
    }

    // 3. Death Check
    if (target.hp <= 0) {
        target.isDead = true;
        target.hp = 0;
        newLogs.push(`💀 ${target.name} ELIMINATED! (${target.role})`);

        // Vulture Sam Check
        const vultureIndex = newPlayers.findIndex(p => p.character === 'Vulture Sam' && !p.isDead);
        const victimCards = [...target.hand, ...target.table];
        target.hand = [];
        target.table = [];

        if (vultureIndex !== -1) {
            // Sam takes cards
            newPlayers[vultureIndex].hand.push(...victimCards);
            newLogs.push(`🦅 Vulture Sam scavenges ${victimCards.length} cards from ${target.name}.`);
        } else {
            // Default: Discard all
            newDiscard.push(...victimCards);
        }

        // Kill Rewards / Penalties (Only if Attacker exists)
        if (attackerIndex !== null && attackerIndex !== targetIndex) {
            const attacker = newPlayers[attackerIndex]; // Re-fetch to be safe if modified by El Gringo

            // Reward: Any player killing an Outlaw -> Draw 3
            if (target.role === 'Outlaw') {
                newLogs.push(`💰 ${attacker.name} collects bounty for Outlaw: Draws 3 cards!`);
                // Draw 3
                for (let i = 0; i < 3; i++) {
                    const check = checkDraw(newDeck, newDiscard);
                    newDeck = check.deck;
                    newDiscard = check.discardPile;
                    attacker.hand.push(check.drawnCard);
                }
            }

            // Penalty: Sheriff kills Deputy -> Discard All
            if (attacker.role === 'Sheriff' && target.role === 'Deputy') {
                newLogs.push(`⚠️ SHERIFF KILLED A DEPUTY! Sheriff loses all cards!`);
                const penaltyCards = [...attacker.hand, ...attacker.table];
                attacker.hand = [];
                attacker.table = [];
                newDiscard.push(...penaltyCards);
            }

            newPlayers[attackerIndex] = attacker;
        }
    }

    newPlayers[targetIndex] = target;
    return { players: newPlayers, deck: newDeck, discardPile: newDiscard, logs: newLogs };
}

export const INITIAL_STATE: GameState = {
    players: [],
    deck: [],
    discardPile: [],
    turnIndex: 0,
    currentPhase: 'draw',
    logs: [],
    selectedCardId: null,
    hasPlayedBang: false,
    turnPlayedCards: [],
};

// --- Reducer ---

export function gameReducer(state: GameState, action: Action): GameState {
    const t = i18n.t;

    switch (action.type) {

        case 'INIT_GAME': {
            const { playerName, botCount, botNames } = action;
            const totalPlayers = 1 + botCount;
            // ROLES: Sheriff, Renegade, Outlaw, Deputy for >5
            // 4 Players: 1 Sheriff, 1 Renegade, 2 Outlaws (Wild West Rules)
            // ROLES: Sheriff is MANDATORY.
            let roles: Role[] = [];
            if (totalPlayers === 2) roles = ['Sheriff', 'Outlaw']; // Duel
            else if (totalPlayers === 3) roles = ['Sheriff', 'Renegade', 'Outlaw'];
            else {
                // Standard Bang! Distribution
                roles = ['Sheriff', 'Renegade', 'Outlaw', 'Outlaw'];
                if (totalPlayers >= 5) roles.push('Deputy');
                if (totalPlayers >= 6) roles.push('Outlaw');
                if (totalPlayers >= 7) roles.push('Deputy');
                // Fill rest with Outlaws if somehow > 7
                while (roles.length < totalPlayers) roles.push('Outlaw');
            }

            // Fisher-Yates Shuffle
            for (let i = roles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [roles[i], roles[j]] = [roles[j], roles[i]];
            }

            const deck = generateDeck();
            const players: Player[] = [];

            const createPlayer = (id: string, name: string, role: Role, isBot: boolean, pos: number): Player => ({
                id,
                name,
                role,
                character: 'Unknown',
                hp: 4,
                maxHp: 4,
                hand: [],
                table: [],
                position: pos,
                weaponRange: 1,
                viewDistance: 0,
                distanceMod: 0,
                isDead: false,
                isBot
            });

            // Human
            players.push(createPlayer('player-0', playerName, roles[0], false, 0));

            // Bots
            for (let i = 0; i < botCount; i++) {
                players.push(createPlayer(`bot-${i + 1}`, botNames?.[i] || `Bot ${i + 1}`, roles[i + 1], true, i + 1));
            }

            // DEBUG: Log Roles
            console.log("--- GAME INIT ROLES ---");
            players.forEach(p => console.log(`${p.name}: ${p.role}`));

            // Find Sheriff for initial turn index
            const sheriffIdx = players.findIndex(p => p.role === 'Sheriff');
            const initialTurnIdx = sheriffIdx !== -1 ? sheriffIdx : 0;

            // AUTO-SELECT for Bots
            const shuffledChars = shuffle([...CHARACTERS]);
            const pendingCharacters: Record<string, Character[]> = {};

            players.forEach((p, idx) => {
                pendingCharacters[p.id] = [shuffledChars[idx * 2], shuffledChars[idx * 2 + 1]];
            });

            let logs = [t('game_init_select_char')];

            return {
                ...state,
                players,
                deck,
                discardPile: [],
                currentPhase: 'select_character',
                turnIndex: initialTurnIdx,
                logs,
                pendingCharacters
            };
        }

        case 'CHOOSE_CHARACTER': {
            const { playerId, characterName } = action;
            const newPlayers = [...state.players];
            const playerIndex = newPlayers.findIndex(p => p.id === playerId);
            if (playerIndex === -1) return state;

            const player = { ...newPlayers[playerIndex] };

            // Find char stats
            const pending = state.pendingCharacters?.[playerId];
            if (!pending) return state;
            const charInfo = pending.find(c => c.name === characterName) || pending[0];

            player.character = charInfo.name;
            player.maxHp = 4 + charInfo.hpMod;
            if (player.role === 'Sheriff') {
                player.maxHp += 1;
            }
            player.hp = player.maxHp;
            player.hand = [];

            // Apply character-specific passive effects
            if (player.character === 'Paul Regret') player.distanceMod += 1;
            if (player.character === 'Rose Doolan') player.viewDistance += 1;

            newPlayers[playerIndex] = player;

            const newPending = { ...state.pendingCharacters };
            delete newPending[playerId];

            const logs = [...state.logs, `${player.name} chose ${charInfo.name}`];

            if (!player.isBot) {
                newPlayers.forEach((p) => {
                    if (p.isBot && p.character === 'Unknown') {
                        const botOpts = newPending[p.id];
                        if (botOpts) {
                            const picked = botOpts[0];
                            p.character = picked.name;
                            p.maxHp = 4 + picked.hpMod + (p.role === 'Sheriff' ? 1 : 0);
                            p.hp = p.maxHp;
                            if (p.character === 'Paul Regret') p.distanceMod += 1;
                            if (p.character === 'Rose Doolan') p.viewDistance += 1;
                            delete newPending[p.id];
                            logs.push(`${p.name} auto-selected ${picked.name}`);
                        }
                    }
                });
            }

            const stillUnknown = newPlayers.some(p => p.character === 'Unknown');

            if (!stillUnknown) {
                // All players have chosen, deal hands and start game
                let currentDeck = [...state.deck];
                newPlayers.forEach(p => {
                    const cardsToDraw = p.hp; // Draw equal to HP
                    const drawn = currentDeck.splice(0, cardsToDraw);
                    p.hand = drawn;
                });

                // Determine who starts: Sheriff
                const sheriffIdx = newPlayers.findIndex(p => p.role === 'Sheriff');
                const startIndex = sheriffIdx !== -1 ? sheriffIdx : 0;

                return {
                    ...state,
                    players: newPlayers,
                    deck: currentDeck,
                    pendingCharacters: undefined,
                    currentPhase: 'draw',
                    logs: [...logs, t('game_started')],
                    turnIndex: startIndex
                };
            }

            return {
                ...state,
                players: newPlayers,
                pendingCharacters: newPending,
                logs
            };
        }

        case 'START_TURN': {
            const currentPlayerIndex = state.turnIndex;
            const player = state.players[currentPlayerIndex];

            if (player.isDead) {
                // Skip all dead players to find next living
                let nextIndex = (state.turnIndex + 1) % state.players.length;
                let loop = 0;
                while (state.players[nextIndex].isDead && loop < state.players.length) {
                    nextIndex = (nextIndex + 1) % state.players.length;
                    loop++;
                }
                return { ...state, turnIndex: nextIndex };
            }

            let newDeck = [...state.deck];
            let newDiscard = [...state.discardPile];
            let newPlayers = [...state.players];
            let logs = [...state.logs];
            let currentPlayer = { ...player };
            let latestDrawCheck: GameState['latestDrawCheck'];


            // --- PHASE 1: STATUS CHECKS (Dynamite, Jail) ---
            // 1. Check Dynamite
            const dynamiteIdx = currentPlayer.table.findIndex(c => c.effectType === 'dynamite');
            if (dynamiteIdx !== -1) {
                const check = checkDraw(newDeck, newDiscard);
                newDeck = check.deck;
                newDiscard = check.discardPile;
                const drawn = check.drawnCard;
                const exploded = drawn.suit === 'spades' && drawn.value >= 2 && drawn.value <= 9;

                latestDrawCheck = {
                    card: drawn,
                    reason: 'dynamite',
                    success: !exploded,
                    playerId: currentPlayer.id,
                    timestamp: Date.now()
                };

                logs.push(`${currentPlayer.name} checks Dynamite... Drawn: ${drawn.suit} ${drawn.value}`);

                // Dynamite explodes on Spades 2-9
                if (exploded) {
                    logs.push(`DYNAMITE EXPLODES! 3 Damage!`);
                    currentPlayer.hp -= 3;
                    newDiscard.push(currentPlayer.table[dynamiteIdx]);
                    currentPlayer.table.splice(dynamiteIdx, 1);

                    if (currentPlayer.hp <= 0) {
                        currentPlayer.isDead = true;
                        logs.push(`${currentPlayer.name} died to Dynamite!`);
                    }
                } else {
                    logs.push(`Dynamite passed to next player.`);
                    const card = currentPlayer.table[dynamiteIdx];
                    currentPlayer.table.splice(dynamiteIdx, 1);

                    let nextIdx = (currentPlayerIndex + 1) % newPlayers.length;
                    while (newPlayers[nextIdx].isDead) nextIdx = (nextIdx + 1) % newPlayers.length;
                    newPlayers[nextIdx].table.push(card);
                }
            }

            if (currentPlayer.isDead) {
                newPlayers[currentPlayerIndex] = currentPlayer;
                return {
                    ...state,
                    players: newPlayers,
                    deck: newDeck,
                    discardPile: newDiscard,
                    logs,
                    turnIndex: (state.turnIndex + 1) % state.players.length,
                    latestDrawCheck: latestDrawCheck || state.latestDrawCheck
                };
            }

            // 2. Check Jail
            const jailIdx = currentPlayer.table.findIndex(c => c.effectType === 'jail');
            if (jailIdx !== -1) {
                const check = checkDraw(newDeck, newDiscard);
                newDeck = check.deck;
                newDiscard = check.discardPile;
                const drawn = check.drawnCard;
                const escaped = drawn.suit === 'hearts';

                latestDrawCheck = {
                    card: drawn,
                    reason: 'jail',
                    success: escaped,
                    playerId: currentPlayer.id,
                    timestamp: Date.now()
                };

                logs.push(`${currentPlayer.name} checks Jail... Drawn: ${drawn.suit} ${drawn.value}`);

                newDiscard.push(currentPlayer.table[jailIdx]);
                currentPlayer.table.splice(jailIdx, 1);

                if (escaped) {
                    logs.push(`Escaped Jail! Turn proceeds.`);
                } else {
                    logs.push(`Stayed in Jail! Turn Skipped.`);
                    newPlayers[currentPlayerIndex] = currentPlayer;
                    return {
                        ...state,
                        players: newPlayers,
                        deck: newDeck,
                        discardPile: newDiscard,
                        logs,
                        turnIndex: (state.turnIndex + 1) % state.players.length,
                        latestDrawCheck
                    };
                }
            }

            // --- PHASE 2: DRAW ---
            let drawCount = 2;
            if (currentPlayer.character === 'Kit Carlson') drawCount = 3;

            if (newDeck.length < drawCount) {
                if (newDiscard.length > 0) {
                    newDeck = [...newDeck, ...shuffle(newDiscard)];
                    newDiscard = [];
                }
            }

            const drawnCards = newDeck.splice(0, drawCount);
            currentPlayer.hand = [...currentPlayer.hand, ...drawnCards];

            newPlayers[currentPlayerIndex] = currentPlayer;

            return {
                ...state,
                players: newPlayers,
                deck: newDeck,
                discardPile: newDiscard,
                currentPhase: 'play',
                logs: [...logs, `${currentPlayer.name} draws ${drawCount} cards.`],
                latestDrawCheck: latestDrawCheck || state.latestDrawCheck,
                hasPlayedBang: false, // Reset logic
                turnPlayedCards: [] // Reset played cards for new turn
            };
        }

        case 'SELECT_CARD':
            return { ...state, selectedCardId: action.cardId };

        case 'PLAY_CARD': {
            const playerIndex = state.turnIndex;
            const player = state.players[playerIndex];
            const card = player.hand.find(c => c.id === action.cardId);

            if (!card) return state;

            // Prevent manual play of 'Missed'
            if (card.effectType === 'missed') {
                return { ...state, logs: [...state.logs, "❌ You cannot play 'Missed!' manually. It is used automatically when attacked."], selectedCardId: null };
            }

            // Deep copy ALL players to prevent mutation in strict mode or global effects
            let newPlayers = state.players.map(p => ({
                ...p,
                table: [...p.table],
                hand: [...p.hand]
            }));

            let newLog = `${player.name} plays ${card.name}`;
            let latestDrawCheck: GameState['latestDrawCheck'];
            let updatedDeck = state.deck;
            let newDiscard = [...state.discardPile];

            if (card.type === 'Equipment' || card.type === 'Status') {
                // JAIL LOGIC: Must be played on an opponent (not Sheriff)
                if (card.name === 'Jail') {
                    if (!action.targetId || action.targetId === player.id) {
                        return { ...state, logs: [...state.logs, "Select a valid target for Jail!"], selectedCardId: null };
                    }
                    const targetIdx = newPlayers.findIndex(p => p.id === action.targetId);
                    const targetP = newPlayers[targetIdx];
                    if (targetP.role === 'Sheriff') {
                        return { ...state, logs: [...state.logs, "Cannot Jail the Sheriff!"], selectedCardId: null };
                    }
                    if (targetP.table.some(c => c.name === 'Jail')) {
                        return { ...state, logs: [...state.logs, `${targetP.name} is already in Jail!`], selectedCardId: null };
                    }

                    newPlayers[targetIdx].table.push(card);
                    newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => c.id !== card.id);
                    newDiscard.push(card); // Discard the played card
                    newLog += ` put ${targetP.name} in JAIL!`;

                    return {
                        ...state,
                        players: newPlayers,
                        logs: [...state.logs, newLog],
                        selectedCardId: null,
                        discardPile: newDiscard,
                    };
                }

                if (card.subType === 'Weapon') {
                    const existingWeaponIdx = newPlayers[playerIndex].table.findIndex(c => c.subType === 'Weapon');
                    if (existingWeaponIdx !== -1) {
                        newDiscard.push(newPlayers[playerIndex].table[existingWeaponIdx]);
                        newPlayers[playerIndex].table.splice(existingWeaponIdx, 1);
                    }
                    newPlayers[playerIndex].table.push(card);
                    newPlayers[playerIndex].weaponRange = card.range || 1;
                    newLog += ` equipped ${card.name}`;
                } else {
                    // DUPLICATE CHECK: Prevent equipping same item twice
                    if (newPlayers[playerIndex].table.some(c => c.name === card.name)) {
                        return { ...state, logs: [...state.logs, `⚠️ You already have ${card.name} equipped!`], selectedCardId: null };
                    }

                    newPlayers[playerIndex].table.push(card);
                    if (card.effectType === 'scope') newPlayers[playerIndex].viewDistance += (card.effectValue || 1);
                    if (card.effectType === 'mustang') newPlayers[playerIndex].distanceMod += (card.effectValue || 1);
                    newLog += ` installed ${card.name}`;
                }

                newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => c.id !== card.id);
                newDiscard.push(card); // Discard the played card

                return {
                    ...state,
                    players: newPlayers,
                    logs: [...state.logs, newLog],
                    selectedCardId: null,
                    discardPile: newDiscard,
                    // Equipment played to table, maybe don't show in "Played Stack" or show briefly?
                    // User said "cards played". I'll skip equipment for now as it stays on screen.
                };

            } else {
                // ACTION CARDS
                if (card.effectType === 'duel' && action.targetId) {
                    const targetIndex = newPlayers.findIndex(p => p.id === action.targetId);
                    const target = newPlayers[targetIndex];

                    const attackerBangs = newPlayers[playerIndex].hand.filter(c => c.effectType === 'bang').length;
                    const targetBangs = target.hand.filter(c => c.effectType === 'bang').length;

                    // Duel Logic: Target discards first. Then Attacker. Repeat.
                    const loserIsAttacker = (targetBangs > attackerBangs);

                    const targetDiscards = loserIsAttacker ? attackerBangs + 1 : targetBangs;
                    const attackerDiscards = loserIsAttacker ? attackerBangs : targetBangs;

                    const discardBangs = (p: Player, count: number) => {
                        let removed = 0;
                        for (let i = 0; i < p.hand.length && removed < count; i++) {
                            if (p.hand[i].effectType === 'bang') {
                                newDiscard.push(p.hand[i]);
                                p.hand.splice(i, 1);
                                i--;
                                removed++;
                            }
                        }
                    };

                    discardBangs(newPlayers[playerIndex], attackerDiscards);
                    discardBangs(newPlayers[targetIndex], targetDiscards);

                    const loserIdx = loserIsAttacker ? playerIndex : targetIndex;
                    const loser = newPlayers[loserIdx];

                    newLog += ` -> Duel! ${loser.name} lost (${targetDiscards + attackerDiscards} Bangs used)`;

                    // HANDLE DAMAGE
                    const damageRes = handleDamage(
                        { ...state, players: newPlayers },
                        loserIdx,
                        1,
                        loserIsAttacker ? targetIndex : playerIndex, // Attacker is the winner
                        updatedDeck,
                        newDiscard,
                        [...state.logs, newLog]
                    );
                    newPlayers = damageRes.players;
                    updatedDeck = damageRes.deck;
                    newDiscard = damageRes.discardPile;
                    const finalLogs = damageRes.logs;

                    newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => c.id !== card.id);
                    newDiscard.push(card);

                    return {
                        ...state,
                        players: newPlayers,
                        deck: updatedDeck,
                        discardPile: newDiscard,
                        logs: finalLogs,
                        selectedCardId: null,
                        hasPlayedBang: state.hasPlayedBang,
                        turnPlayedCards: [...(state.turnPlayedCards || []), card]
                    };
                }

                if (card.effectType === 'bang' && action.targetId) {
                    // Anti-Double-Dispatch Guard: Ensure the card played is actually the selected one
                    if (state.selectedCardId !== action.cardId) {
                        return state;
                    }

                    const targetIndex = newPlayers.findIndex(p => p.id === action.targetId);

                    // CRITICAL FIX: Deep copy target to avoid state mutation
                    newPlayers[targetIndex] = {
                        ...newPlayers[targetIndex],
                        hand: [...newPlayers[targetIndex].hand],
                        table: [...newPlayers[targetIndex].table]
                    };
                    const target = newPlayers[targetIndex];

                    const sorceScope = player.table.filter(c => c.effectType === 'scope').length;
                    const targetMustang = target.table.filter(c => c.effectType === 'mustang').length;
                    const charScope = player.character === 'Rose Doolan' ? 1 : 0;
                    const charMustang = target.character === 'Paul Regret' ? 1 : 0;

                    const dist = calculateDistance(state.players, player.id, target.id, sorceScope + charScope, targetMustang + charMustang);

                    if (dist > player.weaponRange) {
                        return { ...state, logs: [...state.logs, `Target out of range! (Dist: ${dist}, Range: ${player.weaponRange})`], selectedCardId: null };
                    }

                    // CHECK BANG LIMIT
                    // Exception: Volcanic weapon allows unlimited bangs OR Willy the Kid
                    const hasVolcanic = player.table.some(c => c.nameKey === 'card_volcanic_name');
                    const isWillyTheKid = player.character === 'Willy the Kid';

                    if (!hasVolcanic && !isWillyTheKid && state.hasPlayedBang && card.effectType === 'bang') {
                        return { ...state, logs: [...state.logs, `⚠️ You can only play 1 BANG! per turn.`] };
                    }
                    if (!hasVolcanic && !isWillyTheKid && state.hasPlayedBang && card.effectType === 'bang') {
                        return { ...state, logs: [...state.logs, `⚠️ You can only play 1 BANG! per turn.`] };
                    }

                    // CHECK ALIJO (Hideout) - Custom Card
                    const hasAlijo = target.table.some(c => c.effectType === 'hideout');
                    if (hasAlijo) {
                        const check = checkDraw(updatedDeck, newDiscard);
                        updatedDeck = check.deck;
                        newDiscard = check.discardPile;
                        // Add card to target's hand
                        target.hand.push(check.drawnCard);
                        newLog += ` | 🏚️ ${target.name}'s Alijo grants a card!`;
                    }

                    let isMissed = false;

                    // 1. Check Jourdonnais (Barrel Effect Ability)
                    const isJourdonnais = target.character === 'Jourdonnais';

                    if (isJourdonnais) {
                        const check = checkDraw(updatedDeck, newDiscard);
                        updatedDeck = check.deck;
                        newDiscard = check.discardPile;
                        const drawnCard = check.drawnCard;

                        newLog += ` | ${target.name} checks Barrel: ${drawnCard.value} of ${drawnCard.suit}`;
                        if (drawnCard.suit === 'hearts') {
                            isMissed = true;
                            newLog += " (AVOIDED!)";
                        }

                        latestDrawCheck = {
                            card: drawnCard,
                            reason: 'barrel',
                            success: isMissed,
                            playerId: target.id,
                            timestamp: Date.now()
                        };
                    }

                    let finalLogs = [...state.logs, newLog];

                    // 2. Play Card / Discard It
                    // Use helper variable to handle hand filtering properly
                    const cardIdx = newPlayers[playerIndex].hand.findIndex(c => c.id === card.id);
                    if (cardIdx !== -1) newPlayers[playerIndex].hand.splice(cardIdx, 1);
                    newDiscard.push(card);

                    if (!isMissed) {
                        const missIndex = target.hand.findIndex(c => c.effectType === 'missed');
                        if (missIndex !== -1) {
                            // Blocked by Missed!
                            const shieldCard = target.hand[missIndex];
                            newPlayers[targetIndex].hand.splice(missIndex, 1);
                            finalLogs.push(` -> BLOCKED by ${target.name}'s Missed!`);
                            newDiscard.push(shieldCard);
                        } else {
                            // Damage Handling via Helper
                            const damageRes = handleDamage(
                                { ...state, players: newPlayers },
                                targetIndex,
                                1,
                                playerIndex,
                                updatedDeck,
                                newDiscard,
                                finalLogs
                            );
                            newPlayers = damageRes.players;
                            updatedDeck = damageRes.deck;
                            newDiscard = damageRes.discardPile;
                            finalLogs = damageRes.logs;
                        }
                    }

                    return {
                        ...state,
                        players: newPlayers,
                        deck: updatedDeck,
                        discardPile: newDiscard,
                        logs: finalLogs,
                        selectedCardId: null,
                        currentPhase: state.currentPhase,
                        turnIndex: state.turnIndex,
                        hasPlayedBang: true,
                        turnPlayedCards: [...(state.turnPlayedCards || []), card],
                        latestDrawCheck: latestDrawCheck || state.latestDrawCheck,
                        gameOver: state.gameOver,
                        winner: state.winner
                    };
                }

                // Other Cards
                if (card.effectType === 'heal') {
                    if (player.hp < player.maxHp) {
                        newPlayers[playerIndex].hp += 1;
                        newLog += ` (Healed to ${newPlayers[playerIndex].hp})`;
                    } else {
                        return { ...state, logs: [...state.logs, "HP full, cannot heal!"], selectedCardId: null };
                    }
                } else if (card.effectType === 'draw') {
                    const count = card.effectValue || 1;
                    const drawn = updatedDeck.slice(0, count);
                    updatedDeck = updatedDeck.slice(count);
                    newPlayers[playerIndex].hand.push(...drawn);
                    newLog += ` drew ${count} cards`;
                } else if (card.effectType === 'damage_all') {
                    // Gatling
                    let currentLogs = [...state.logs, newLog];
                    // We need to iterate carefully since handleDamage modifies logs
                    // Logic: Gatling -> Each other player triggers Missed or Damage
                    // We must do this sequentially to update message log correctly

                    // Filter targets first
                    const targets = newPlayers.map((p, i) => ({ idx: i, p })).filter(item => item.idx !== playerIndex && !item.p.isDead);

                    targets.forEach(({ idx }) => {
                        let targetInstance = newPlayers[idx]; // Re-fetch in case of mutation (though mutation is inplace on array)
                        const missIdx = targetInstance.hand.findIndex(c => c.effectType === 'missed');
                        if (missIdx !== -1) {
                            const used = targetInstance.hand[missIdx];
                            targetInstance.hand.splice(missIdx, 1);
                            newDiscard.push(used);
                            currentLogs.push(` | ${targetInstance.name} Missed!`);
                            newPlayers[idx] = targetInstance;
                        } else {
                            const damageRes = handleDamage(
                                { ...state, players: newPlayers },
                                idx,
                                1,
                                playerIndex,
                                updatedDeck,
                                newDiscard,
                                currentLogs
                            );
                            newPlayers = damageRes.players;
                            updatedDeck = damageRes.deck;
                            newDiscard = damageRes.discardPile;
                            currentLogs = damageRes.logs;
                        }
                    });

                    newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => c.id !== card.id);
                    newDiscard.push(card);

                    return {
                        ...state,
                        players: newPlayers,
                        deck: updatedDeck,
                        discardPile: newDiscard,
                        logs: currentLogs,
                        selectedCardId: null,
                        turnPlayedCards: [...(state.turnPlayedCards || []), card]
                    };

                } else if (card.effectType === 'saloon') {
                    newPlayers.forEach(p => {
                        if (!p.isDead && p.hp < p.maxHp) {
                            p.hp += 1;
                        }
                    });
                    newLog += ` | All players healed!`;
                } else if (card.effectType === 'indians') {
                    let currentLogs = [...state.logs, newLog];
                    const targets = newPlayers.map((p, i) => ({ idx: i, p })).filter(item => item.idx !== playerIndex && !item.p.isDead);
                    targets.forEach(({ idx }) => {
                        let targetInstance = newPlayers[idx];
                        const bangIdx = targetInstance.hand.findIndex(c => c.effectType === 'bang');
                        if (bangIdx !== -1) {
                            const used = targetInstance.hand[bangIdx];
                            targetInstance.hand.splice(bangIdx, 1);
                            newDiscard.push(used);
                            currentLogs.push(` | ${targetInstance.name} discarded Bang!`);
                            newPlayers[idx] = targetInstance;
                        } else {
                            const damageRes = handleDamage(
                                { ...state, players: newPlayers },
                                idx,
                                1,
                                playerIndex,
                                updatedDeck,
                                newDiscard,
                                currentLogs
                            );
                            newPlayers = damageRes.players;
                            updatedDeck = damageRes.deck;
                            newDiscard = damageRes.discardPile;
                            currentLogs = damageRes.logs;
                        }
                    });

                    newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => c.id !== card.id);
                    newDiscard.push(card);

                    return {
                        ...state,
                        players: newPlayers,
                        deck: updatedDeck,
                        discardPile: newDiscard,
                        logs: currentLogs,
                        selectedCardId: null,
                        turnPlayedCards: [...(state.turnPlayedCards || []), card]
                    };

                } else if (card.effectType === 'store') {
                    const aliveCount = newPlayers.filter(p => !p.isDead).length;
                    const drawn = updatedDeck.slice(0, aliveCount);
                    updatedDeck = updatedDeck.slice(aliveCount);

                    newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => c.id !== card.id);
                    newDiscard.push(card);
                    newLog += ` opens General Store`;

                    return {
                        ...state,
                        players: newPlayers,
                        deck: updatedDeck,
                        discardPile: newDiscard,
                        logs: [...state.logs, newLog],
                        selectedCardId: null,
                        currentPhase: 'general_store',
                        generalStoreCards: drawn,
                        generalStoreTurnIndex: playerIndex,
                        turnPlayedCards: [...(state.turnPlayedCards || []), card]
                    };
                } else if ((card.effectType === 'steal' || card.effectType === 'discard') && action.targetId) {
                    if (state.selectedCardId !== action.cardId) return state;

                    const targetIndex = newPlayers.findIndex(p => p.id === action.targetId);
                    const target = { ...newPlayers[targetIndex], hand: [...newPlayers[targetIndex].hand], table: [...newPlayers[targetIndex].table] };

                    // Panic Check
                    if (card.effectType === 'steal') {
                        const sorceScope = player.table.filter(c => c.effectType === 'scope').length;
                        const targetMustang = target.table.filter(c => c.effectType === 'mustang').length;
                        const charScope = player.character === 'Rose Doolan' ? 1 : 0;
                        const charMustang = target.character === 'Paul Regret' ? 1 : 0;
                        const dist = calculateDistance(state.players, player.id, target.id, sorceScope + charScope, targetMustang + charMustang);

                        if (dist > 1) {
                            return { ...state, logs: [...state.logs, `Target out of range for Panic! (Dist: ${dist})`], selectedCardId: null };
                        }
                    }

                    // Logic: Steal/Discard Random from Hand (Priority) or Random from Table
                    let stolenCard: Card | undefined;

                    if (target.hand.length > 0) {
                        const randIdx = Math.floor(Math.random() * target.hand.length);
                        stolenCard = target.hand.splice(randIdx, 1)[0];
                    } else if (target.table.length > 0) {
                        const randIdx = Math.floor(Math.random() * target.table.length);
                        stolenCard = target.table.splice(randIdx, 1)[0];
                    }

                    if (stolenCard) {
                        newPlayers[targetIndex] = target;
                        if (card.effectType === 'steal') {
                            newPlayers[playerIndex].hand.push(stolenCard);
                            newLog += ` stole a card from ${target.name}`;
                        } else {
                            newDiscard.push(stolenCard);
                            newLog += ` forced ${target.name} to discard a card`;
                        }
                    } else {
                        newLog += ` (Target has no cards!)`;
                    }
                }

                newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => c.id !== card.id);
                newDiscard.push(card);

                return {
                    ...state,
                    players: newPlayers,
                    deck: updatedDeck,
                    discardPile: newDiscard,
                    logs: [...state.logs, newLog],
                    selectedCardId: null,
                    latestDrawCheck: latestDrawCheck || state.latestDrawCheck,
                    hasPlayedBang: state.hasPlayedBang || card.effectType === 'bang',
                    turnPlayedCards: [...(state.turnPlayedCards || []), card]
                };
            }
        }

        case 'DISCARD_CARD': {
            const player = state.players[state.turnIndex];
            const cardId = action.cardId;
            const cardIndex = player.hand.findIndex(c => c.id === cardId);
            if (cardIndex === -1) return state;

            const newHand = [...player.hand];
            const discarded = newHand.splice(cardIndex, 1)[0];

            let newPlayers = [...state.players];
            newPlayers[state.turnIndex] = { ...player, hand: newHand };

            const newState = {
                ...state,
                players: newPlayers,
                discardPile: [...state.discardPile, discarded],
                logs: [...state.logs, `${player.name} discarded ${discarded.name}`],
                currentPhase: 'discard' as const,
            };

            // Check if Requirement Met
            if (newHand.length <= player.hp) {
                // AUTO END TURN LOGIC
                const totalPlayers = state.players.length;
                let nextIndex = (state.turnIndex + 1) % totalPlayers;

                // Win Conditions Check
                const sheriff = state.players.find(p => p.role === 'Sheriff');
                const outlaws = state.players.filter(p => p.role === 'Outlaw' && !p.isDead);
                const deputies = state.players.filter(p => p.role === 'Deputy' && !p.isDead);
                const renegade = state.players.filter(p => p.role === 'Renegade' && !p.isDead);

                if (sheriff && sheriff.isDead) {
                    if (outlaws.length === 0 && deputies.length === 0 && renegade.length === 1 && !renegade[0].isDead) {
                        return { ...newState, gameOver: true, winner: 'Renegade' };
                    } else {
                        return { ...newState, gameOver: true, winner: 'Outlaws' };
                    }
                }
                if (outlaws.length === 0 && renegade.length === 0) {
                    return { ...newState, gameOver: true, winner: 'Sheriff' };
                }

                let loop = 0;
                while (state.players[nextIndex].isDead && loop < totalPlayers) {
                    nextIndex = (nextIndex + 1) % totalPlayers;
                    loop++;
                }

                return {
                    ...newState,
                    turnIndex: nextIndex,
                    currentPhase: 'draw',
                    logs: [...newState.logs, `--- Turn Ended (Discard Complete) ---`],
                };
            }

            return newState;
        }

        case 'DRAFT_CARD': {
            if (state.currentPhase !== 'general_store' || !state.generalStoreCards) return state;

            const pickerIndex = state.generalStoreTurnIndex;
            if (pickerIndex === null || pickerIndex === undefined) return state;

            const cardId = action.cardId;
            const cardIdx = state.generalStoreCards.findIndex(c => c.id === cardId);
            if (cardIdx === -1) return state;

            const card = state.generalStoreCards[cardIdx];
            const newStoreCards = [...state.generalStoreCards];
            newStoreCards.splice(cardIdx, 1);

            const newPlayers = [...state.players];
            const picker = { ...newPlayers[pickerIndex], hand: [...newPlayers[pickerIndex].hand, card] };
            newPlayers[pickerIndex] = picker;

            let logs = [...state.logs, `${picker.name} took ${card.name}`];

            let nextStoreIndex: number | null = (pickerIndex + 1) % state.players.length;
            let loop = 0;
            while (newPlayers[nextStoreIndex].isDead && loop < newPlayers.length) {
                nextStoreIndex = (nextStoreIndex + 1) % state.players.length;
                loop++;
            }

            let nextPhase: GameState['currentPhase'] = state.currentPhase;
            if (newStoreCards.length === 0) {
                nextPhase = 'play';
                nextStoreIndex = null;
                logs.push("General Store closed");
            }

            return {
                ...state,
                players: newPlayers,
                generalStoreCards: newStoreCards,
                generalStoreTurnIndex: nextStoreIndex,
                logs,
                currentPhase: nextPhase,
            };
        }

        case 'END_TURN': {
            const player = state.players[state.turnIndex];

            // Check Hand Limit
            if (player.hand.length > player.hp) {
                return {
                    ...state,
                    currentPhase: 'discard',
                    logs: [...state.logs, `${player.name} must discard ${player.hand.length - player.hp} cards!`],
                };
            }

            const totalPlayers = state.players.length;
            let nextIndex = (state.turnIndex + 1) % totalPlayers;

            // Win Conditions
            const sheriff = state.players.find(p => p.role === 'Sheriff');
            const outlaws = state.players.filter(p => p.role === 'Outlaw' && !p.isDead);
            const deputies = state.players.filter(p => p.role === 'Deputy' && !p.isDead);
            const renegade = state.players.filter(p => p.role === 'Renegade' && !p.isDead);

            if (sheriff && sheriff.isDead) {
                if (outlaws.length === 0 && deputies.length === 0 && renegade.length === 1 && !renegade[0].isDead) {
                    return { ...state, gameOver: true, winner: 'Renegade' };
                } else {
                    return { ...state, gameOver: true, winner: 'Outlaws' };
                }
            }

            if (outlaws.length === 0 && renegade.length === 0) {
                return { ...state, gameOver: true, winner: 'Sheriff' };
            }

            let loop = 0;
            while (state.players[nextIndex].isDead && loop < totalPlayers) {
                nextIndex = (nextIndex + 1) % totalPlayers;
                loop++;
            }

            return {
                ...state,
                turnIndex: nextIndex,
                currentPhase: 'draw',
                logs: [...state.logs, `--- Turn Ended ---`],
            };
        }

        default:
            return state;
    }
}
