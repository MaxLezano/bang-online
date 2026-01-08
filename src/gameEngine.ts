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

    // Lightning (formerly Cat Balou)
    add(4, { nameKey: 'card_lightning_name', descKey: 'card_cat_balou_desc', name: 'Lightning', type: 'Action', effectType: 'discard' }, ['hearts', 'diamonds'], [13, 9, 10, 11]);

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
    // Appaloosa - Same effect as Scope
    add(1, { nameKey: 'card_appaloosa_name', descKey: 'card_appaloosa_desc', name: 'Appaloosa', type: 'Equipment', subType: 'Utility', effectType: 'scope', effectValue: 1 }, ['spades'], [8]); // S:8 is typical for Appaloosa
    add(2, { nameKey: 'card_barrel_name', descKey: 'card_barrel_desc', name: 'Barrel', type: 'Equipment', subType: 'Defense', effectType: 'equip' }, ['spades'], [12, 13]);
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

// Helper for Suzy Lafayette Ability
function checkSuzyLafayette(player: Player, deck: Card[], discardPile: Card[], logs: string[]): { player: Player, deck: Card[], discardPile: Card[], logs: string[] } {
    if (player.character === 'Suzy Lafayette' && player.hand.length === 0) {
        let newDeck = [...deck];
        let newDiscard = [...discardPile];

        if (newDeck.length === 0) {
            if (newDiscard.length === 0) return { player, deck, discardPile, logs };
            newDeck = shuffle(newDiscard);
            newDiscard = [];
        }

        const drawn = newDeck.shift();
        if (drawn) {
            const newHand = [...player.hand, drawn];
            return {
                player: { ...player, hand: newHand },
                deck: newDeck,
                discardPile: newDiscard,
                logs: [...logs, `🎩 Suzy Lafayette draws a card (Empty Hand)`]
            };
        }
    }
    return { player, deck, discardPile, logs };
}

// Helper to Recalculate Stats based on Table & Character
export function calculatePlayerStats(player: Player): Player {
    let newPlayer = { ...player };
    // Reset to base
    newPlayer.weaponRange = 1;
    newPlayer.distanceMod = 0;
    newPlayer.viewDistance = 0;

    // Character Base Stats
    if (newPlayer.character === 'Paul Regret') newPlayer.distanceMod += 1;
    if (newPlayer.character === 'Rose Doolan') newPlayer.viewDistance += 1;

    // Equipment Stats
    newPlayer.table.forEach(card => {
        if (card.subType === 'Weapon') {
            newPlayer.weaponRange = card.range || 1;
        }
        if (card.name === 'Mustang' || card.effectType === 'mustang') {
            newPlayer.distanceMod += 1;
        }
        if (card.name === 'Mirilla' || card.name === 'Scope' || card.effectType === 'sight_mod' || card.effectType === 'scope') {
            newPlayer.viewDistance += 1;
        }
    });

    return newPlayer;
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

    // CRITICAL FIX: Spread object AND hand/table to avoid mutating state reference
    let target = {
        ...newPlayers[targetIndex],
        hand: [...newPlayers[targetIndex].hand],
        table: [...newPlayers[targetIndex].table]
    };
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
        const attacker = { ...newPlayers[attackerIndex], hand: [...newPlayers[attackerIndex].hand] };
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
        const deathRes = handleDeath(
            { ...state, players: newPlayers, deck: newDeck, discardPile: newDiscard, logs: newLogs },
            targetIndex,
            attackerIndex
        );
        newPlayers = deathRes.players;
        newDeck = deathRes.deck;
        newDiscard = deathRes.discardPile;
        newLogs = deathRes.logs;
    } else {
        // Only update the target if they survived (otherwise handleDeath updated them correctly)
        newPlayers[targetIndex] = target;
    }

    return { players: newPlayers, deck: newDeck, discardPile: newDiscard, logs: newLogs };
}

// Helper for drawing cards into hand (RESHUFFLES if needed, does NOT discard drawn cards)
// Helper for drawing cards into hand (RESHUFFLES if needed, does NOT discard drawn cards)
function drawCardsFromDeck(deck: Card[], discardPile: Card[], count: number): { drawn: Card[], deck: Card[], discardPile: Card[], reshuffled: boolean } {
    let newDeck = [...deck];
    let newDiscard = [...discardPile];
    const drawn: Card[] = [];
    let reshuffled = false;

    for (let i = 0; i < count; i++) {
        if (newDeck.length === 0) {
            if (newDiscard.length === 0) break; // No cards left anywhere
            newDeck = shuffle(newDiscard);
            newDiscard = [];
            reshuffled = true;
        }
        if (newDeck.length > 0) {
            drawn.push(newDeck.shift()!);
        }
    }
    return { drawn, deck: newDeck, discardPile: newDiscard, reshuffled };
}

// Helper to calculate effective weapon range dynamically (fixes caching bugs)
export function getEffectiveRange(player: Player): number {
    const weapon = player.table.find(c => c.subType === 'Weapon');
    return weapon?.range || 1;
}

// Extracted Death Logic to ensure Vulture Sam works for ALL deaths (Dynamite, etc)
export function handleDeath(
    state: Partial<GameState> & { players: Player[], deck: Card[], discardPile: Card[], logs: string[] },
    victimIndex: number,
    killerIndex: number | null
): { players: Player[], deck: Card[], discardPile: Card[], logs: string[] } {
    let newPlayers = [...state.players];
    let newDeck = [...state.deck];
    let newDiscard = [...state.discardPile];
    let newLogs = [...state.logs];

    const victim = newPlayers[victimIndex];
    victim.isDead = true;
    victim.hp = 0;
    newLogs.push(`💀 ${victim.name} ELIMINATED! (${victim.role})`);

    // Vulture Sam Check
    const vultureIndex = newPlayers.findIndex(p => p.character === 'Vulture Sam' && !p.isDead);
    const victimCards = [...victim.hand, ...victim.table];
    victim.hand = [];
    victim.table = [];

    if (vultureIndex !== -1 && newPlayers[vultureIndex].character === 'Vulture Sam') {
        // Sam takes cards - SANITIZE IDs to prevent "Ghost Card" / Stale State bugs
        const vultureSam = newPlayers[vultureIndex];

        // Regenerate IDs for all looted cards to force React/Redux to treat them as fresh
        const lootedCards = victimCards.map(c => ({
            ...c,
            id: `${c.id}_loot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        }));

        vultureSam.hand.push(...lootedCards);
        newLogs.push(i18n.t('log_vulture_loot', { name: victim.name }));
        newPlayers[vultureIndex] = vultureSam;
    } else {
        // Default: Discard all
        if (victimCards.length > 0) {
            if (victimCards.length > 0) {
                newDiscard.push(...victimCards);
                newLogs.push(i18n.t('log_death_discard', { name: victim.name }));
            }
        }
    }

    // Bonuses / Penalties
    if (killerIndex !== null && killerIndex !== undefined && killerIndex !== victimIndex) {
        const killer = newPlayers[killerIndex];

        // Reward: Any player killing an Outlaw -> Draw 3
        if (victim.role === 'Outlaw') {
            newLogs.push(i18n.t('log_kill_outlaw'));
            const drawRes = drawCardsFromDeck(newDeck, newDiscard, 3);
            if (drawRes.reshuffled) {
                newLogs.push(i18n.t('log_deck_reshuffled'));
            }
            newDeck = drawRes.deck;
            newDiscard = drawRes.discardPile;
            killer.hand.push(...drawRes.drawn);
        }

        // Penalty: Sheriff kills Deputy -> Discard All
        if (killer.role === 'Sheriff' && victim.role === 'Deputy') {
            newLogs.push(i18n.t('log_kill_deputy'));
            const penaltyCards = [...killer.hand, ...killer.table];
            killer.hand = [];
            killer.table = [];
            newDiscard.push(...penaltyCards);
        }

        newPlayers[killerIndex] = killer;
    }

    newPlayers[victimIndex] = victim;
    return { players: newPlayers, deck: newDeck, discardPile: newDiscard, logs: newLogs };
}



export function checkGameEnd(state: GameState): GameState {
    const sheriff = state.players.find(p => p.role === 'Sheriff');
    const outlaws = state.players.filter(p => p.role === 'Outlaw' && !p.isDead);
    const renegades = state.players.filter(p => p.role === 'Renegade' && !p.isDead);

    if (sheriff && sheriff.isDead) {
        if (outlaws.length === 0 && renegades.length === 1) {
            return { ...state, gameOver: true, winner: 'Renegade' };
        } else {
            return { ...state, gameOver: true, winner: 'Outlaws' };
        }
    } else {
        if (outlaws.length === 0 && renegades.length === 0) {
            return { ...state, gameOver: true, winner: 'Sheriff' };
        }
    }
    return state;
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
            const { playerName, botCount, botNames, players: multiplayerParticipants } = action;
            const isMultiplayer = multiplayerParticipants && multiplayerParticipants.length > 0;
            const totalPlayers = isMultiplayer ? multiplayerParticipants!.length : 1 + botCount;

            // ROLES: Sheriff, Renegade, Outlaw, Deputy for >5
            // 4 Players: 1 Sheriff, 2 Outlaws, 1 Renegade
            let roles: Role[] = [];
            if (totalPlayers === 2) roles = ['Sheriff', 'Outlaw'];
            else if (totalPlayers === 3) roles = ['Sheriff', 'Renegade', 'Outlaw'];
            else {
                roles = ['Sheriff', 'Renegade', 'Outlaw', 'Outlaw'];
                if (totalPlayers >= 5) roles.push('Deputy');
                if (totalPlayers >= 6) roles.push('Outlaw');
                if (totalPlayers >= 7) roles.push('Deputy');
                while (roles.length < totalPlayers) roles.push('Outlaw');
            }

            // Shuffle Roles
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

                // Character Preview (Hidden until chosen, but assigned for bots)
                // We will handle character state logic separately below.
                weaponRange: 1,
                viewDistance: 0,
                distanceMod: 0,
                isDead: false,
                isBot
            });

            // Logic for characters pending selection
            const shuffledChars = shuffle([...CHARACTERS]);
            const pendingCharacters: Record<string, Character[]> = {};

            if (isMultiplayer) {
                // Multiplayer Setup
                multiplayerParticipants!.forEach((p, i) => {
                    // Assign 2 char options
                    pendingCharacters[p.id] = [shuffledChars[i * 2], shuffledChars[i * 2 + 1]];
                    players.push(createPlayer(p.id, p.name, roles[i], p.isBot, i)); // Init with dummy char
                });
            } else {
                // Single Player Setup
                const humanId = 'player-0';
                pendingCharacters[humanId] = [shuffledChars[0], shuffledChars[1]];
                players.push(createPlayer(humanId, playerName, roles[0], false, 0));

                for (let i = 0; i < botCount; i++) {
                    const botId = `bot-${i + 1}`;
                    pendingCharacters[botId] = [shuffledChars[(i + 1) * 2], shuffledChars[(i + 1) * 2 + 1]];
                    const botName = botNames?.[i] || `Bot ${i + 1}`;
                    players.push(createPlayer(botId, botName, roles[i + 1], true, i + 1));
                }
            }

            // DEBUG: Log Roles
            console.log("--- GAME INIT ROLES ---");
            players.forEach(p => console.log(`${p.name}: ${p.role}`));

            const sheriffIdx = players.findIndex(p => p.role === 'Sheriff');
            const initialTurnIdx = sheriffIdx !== -1 ? sheriffIdx : 0;

            let logs = [t('game_init_select_char')];

            return {
                ...state,
                players,
                deck,
                discardPile: [],
                currentPhase: 'select_character',
                turnIndex: initialTurnIdx,
                logs,
                pendingCharacters,
                gameOver: undefined,
                winner: undefined,
                pendingAction: undefined
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
                return {
                    ...state,
                    turnIndex: nextIndex,
                    hasPlayedBang: false,
                    turnPlayedCards: []
                };
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

                logs.push(i18n.t('log_dynamite_check', { name: currentPlayer.name, card: `${drawn.suit} ${drawn.value}` }));

                // Dynamite explodes on Spades 2-9
                if (exploded) {
                    logs.push(i18n.t('log_dynamite_exploded'));
                    currentPlayer.hp -= 3;
                    newDiscard.push(currentPlayer.table[dynamiteIdx]);
                    currentPlayer.table.splice(dynamiteIdx, 1);

                    if (currentPlayer.hp <= 0) {
                        const deathRes = handleDeath({ ...state, players: newPlayers, deck: newDeck, discardPile: newDiscard, logs }, currentPlayerIndex, null);
                        newPlayers = deathRes.players;
                        newDeck = deathRes.deck;
                        newDiscard = deathRes.discardPile;
                        logs = deathRes.logs;
                    }
                } else {
                    logs.push(i18n.t('log_dynamite_passed'));
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
                    latestDrawCheck: latestDrawCheck || state.latestDrawCheck,
                    hasPlayedBang: false,
                    turnPlayedCards: []
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

                logs.push(i18n.t('log_jail_check', { name: currentPlayer.name, card: `${drawn.suit} ${drawn.value}` }));

                newDiscard.push(currentPlayer.table[jailIdx]);
                currentPlayer.table.splice(jailIdx, 1);

                if (escaped) {
                    logs.push(i18n.t('log_jail_escaped'));
                } else {
                    logs.push(i18n.t('log_jail_stayed'));
                    newPlayers[currentPlayerIndex] = currentPlayer;
                    return {
                        ...state,
                        players: newPlayers,
                        deck: newDeck,
                        discardPile: newDiscard,
                        logs,
                        turnIndex: (state.turnIndex + 1) % state.players.length,
                        latestDrawCheck,
                        hasPlayedBang: false,
                        turnPlayedCards: []
                    };
                }
            }

            // --- PHASE 2: DRAW ---
            // PEDRO RAMIREZ: Draw first card from discard, second from deck
            if (currentPlayer.character === 'Pedro Ramirez' && newDiscard.length > 0) {
                const discardCard = newDiscard.pop(); // Take top of discard
                let deckCard: Card | undefined;

                // Prepare Deck for second card
                if (newDeck.length === 0) {
                    if (newDiscard.length > 0) {
                        newDeck = [...newDeck, ...shuffle(newDiscard)];
                        newDiscard = [];
                    }
                }

                if (newDeck.length > 0) {
                    deckCard = newDeck.shift();
                }

                if (discardCard) currentPlayer.hand = [...currentPlayer.hand, discardCard];
                if (deckCard) currentPlayer.hand = [...currentPlayer.hand, deckCard];

                newPlayers[currentPlayerIndex] = currentPlayer;

                return {
                    ...state,
                    players: newPlayers,
                    deck: newDeck,
                    discardPile: newDiscard,
                    currentPhase: 'play',
                    logs: [...logs, `${currentPlayer.name} draws from Discard (Pedro Ramirez) and Deck.`],
                    latestDrawCheck: latestDrawCheck || state.latestDrawCheck,
                    hasPlayedBang: false,
                    turnPlayedCards: []
                };
            }

            // JESSE JONES INTERCEPTION
            if (currentPlayer.character === 'Jesse Jones') {
                // Skip auto-draw. Go to choice phase.
                newPlayers[currentPlayerIndex] = currentPlayer;
                return {
                    ...state,
                    players: newPlayers,
                    deck: newDeck,
                    discardPile: newDiscard,
                    logs, // Logs from dynamite/jail checks
                    currentPhase: 'jesse_jones_draw', // NEW PHASE
                    latestDrawCheck: latestDrawCheck || state.latestDrawCheck,
                    hasPlayedBang: false,
                    turnPlayedCards: []
                };
            }

            let drawCount = 2;
            if (currentPlayer.character === 'Kit Carlson') drawCount = 3;

            if (newDeck.length < drawCount) {
                if (newDiscard.length > 0) {
                    newDeck = [...newDeck, ...shuffle(newDiscard)];
                    newDiscard = [];
                }
            }

            const drawnCards = newDeck.splice(0, drawCount);

            // KIT CARLSON LOGIC: Store in temp array, don't add to hand yet
            if (currentPlayer.character === 'Kit Carlson') {
                return {
                    ...state,
                    players: newPlayers,
                    deck: newDeck,
                    discardPile: newDiscard,
                    currentPhase: 'kit_carlson_discard',
                    kitCarlsonCards: drawnCards, // Store them here
                    logs: [...logs, `${currentPlayer.name} draws 3 cards (Kit Carlson).`],
                    latestDrawCheck: latestDrawCheck || state.latestDrawCheck,
                    hasPlayedBang: false,
                    turnPlayedCards: []
                };
            }

            // Normal Draw
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
            // Kit Carlson Phase: Select 1 card to put back on deck from TEMP ARRAY
            if (state.currentPhase === 'kit_carlson_discard') {
                const player = state.players[state.turnIndex];
                if (!state.kitCarlsonCards) return state;

                const cardIdx = state.kitCarlsonCards.findIndex(c => c.id === action.cardId);
                if (cardIdx === -1) return state;

                const cardToCheck = state.kitCarlsonCards[cardIdx];

                // Remove SELECTED card (it goes back to Deck)
                const remainingCards = state.kitCarlsonCards.filter(c => c.id !== cardToCheck.id);

                // Add remaining 2 cards to HAND
                const newHand = [...player.hand, ...remainingCards];

                // Put selected card back on TOP of deck
                const newDeck = [cardToCheck, ...state.deck];

                const newPlayers = [...state.players];
                newPlayers[state.turnIndex] = { ...player, hand: newHand };

                return {
                    ...state,
                    players: newPlayers,
                    deck: newDeck,
                    currentPhase: 'play', // Proceed to play phase
                    kitCarlsonCards: undefined, // Clear temp
                    selectedCardId: null,
                    logs: [...state.logs, `${player.name} keeps 2 cards and returns 1 to the deck`]
                };
            }

            if (state.currentPhase === 'sid_discard') {
                const player = state.players[state.turnIndex];
                const card = player.hand.find(c => c.id === action.cardId);
                if (!card) return state;

                // Discard it
                const newHand = player.hand.filter(c => c.id !== card.id);
                const newDiscard = [...state.discardPile, card];
                const pending = [...(state.abilityPendingDiscords || []), card.id];

                // Update player
                const newPlayers = [...state.players];
                newPlayers[state.turnIndex] = { ...player, hand: newHand };

                if (pending.length >= 2) {
                    // Effect Trigger
                    const newHp = Math.min(newPlayers[state.turnIndex].maxHp, newPlayers[state.turnIndex].hp + 1);
                    newPlayers[state.turnIndex].hp = newHp;

                    return {
                        ...state,
                        players: newPlayers,
                        discardPile: newDiscard,
                        currentPhase: 'play',
                        abilityPendingDiscords: undefined,
                        selectedCardId: null,
                        logs: [...state.logs, `${player.name} discards 2 cards to Heal 1 HP! (HP: ${newHp})`]
                    };
                }

                return {
                    ...state,
                    players: newPlayers,
                    discardPile: newDiscard,
                    abilityPendingDiscords: pending,
                    selectedCardId: null,
                    logs: [...state.logs, `${player.name} discards ${card.name} (1/2)`]
                };
            }
            return { ...state, selectedCardId: action.cardId };

        case 'JESSE_CHOOSE_DRAW': {
            const player = state.players[state.turnIndex];
            let newDeck = [...state.deck];
            let newHand = [...player.hand];
            let newPlayers = [...state.players];
            const newLogs = [...state.logs];

            if (action.source === 'deck') {
                // Option A: Draw 2 from Deck (Standard)
                if (newDeck.length < 2) {
                    if (state.discardPile.length > 0) {
                        newDeck = [...newDeck, ...shuffle(state.discardPile)];
                    }
                }
                const drawn = newDeck.splice(0, 2);
                newHand.push(...drawn);
                newLogs.push(`${player.name} (Jesse Jones) draws 2 cards from Deck.`);
            } else if (action.source === 'player' && action.targetId) {
                // Option B: Steal 1 from Target, Draw 1 from Deck
                const targetIdx = state.players.findIndex(p => p.id === action.targetId);
                if (targetIdx !== -1) {
                    const target = state.players[targetIdx];
                    if (target.hand.length > 0) {
                        // Random steal
                        const randIdx = Math.floor(Math.random() * target.hand.length);
                        const stolenCard = target.hand[randIdx];

                        // Sanitize ID just in case? Usually only needed for death-transfer, but safer.
                        // Actually, swapping hands... let's keep ID for now, simpler.

                        // Remove from target
                        const targetHand = [...target.hand];
                        targetHand.splice(randIdx, 1);
                        newPlayers[targetIdx] = { ...target, hand: targetHand };

                        // Add to Jesse
                        newHand.push(stolenCard);
                        newLogs.push(`${player.name} (Jesse Jones) steals a card from ${target.name}.`);

                        // Draw 2nd card from Deck
                        if (newDeck.length < 1) {
                            if (state.discardPile.length > 0) {
                                newDeck = [...newDeck, ...shuffle(state.discardPile)];
                            }
                        }
                        const drawn = newDeck.splice(0, 1);
                        newHand.push(...drawn);
                    }
                }
            }

            newPlayers[state.turnIndex] = { ...player, hand: newHand };

            return {
                ...state,
                players: newPlayers,
                deck: newDeck,
                logs: newLogs,
                currentPhase: 'play'
            };
        }

        case 'JESSE_CHOOSE_DRAW': {
            const player = state.players[state.turnIndex];
            let newDeck = [...state.deck];
            let newHand = [...player.hand];
            let newPlayers = [...state.players];
            const newLogs = [...state.logs];

            if (action.source === 'deck') {
                // Option A: Draw 2 from Deck (Standard)
                if (newDeck.length < 2) {
                    if (state.discardPile.length > 0) {
                        newDeck = [...newDeck, ...shuffle(state.discardPile)];
                    }
                }
                const drawn = newDeck.splice(0, 2);
                newHand.push(...drawn);
                newLogs.push(`${player.name} (Jesse Jones) draws 2 cards from Deck.`);
            } else if (action.source === 'player' && action.targetId) {
                // Option B: Steal 1 from Target, Draw 1 from Deck
                const targetIdx = state.players.findIndex(p => p.id === action.targetId);
                if (targetIdx !== -1) {
                    const target = state.players[targetIdx];
                    if (target.hand.length > 0) {
                        // Random steal
                        const randIdx = Math.floor(Math.random() * target.hand.length);
                        const stolenCard = target.hand[randIdx];

                        // Sanitize ID just in case? Usually only needed for death-transfer, but safer.
                        // Actually, swapping hands... let's keep ID for now, simpler.

                        // Remove from target
                        const targetHand = [...target.hand];
                        targetHand.splice(randIdx, 1);
                        newPlayers[targetIdx] = { ...target, hand: targetHand };

                        // Add to Jesse
                        newHand.push(stolenCard);
                        newLogs.push(`${player.name} (Jesse Jones) steals a card from ${target.name}.`);

                        // Draw 2nd card from Deck
                        if (newDeck.length < 1) {
                            if (state.discardPile.length > 0) {
                                newDeck = [...newDeck, ...shuffle(state.discardPile)];
                            }
                        }
                        const drawn = newDeck.splice(0, 1);
                        newHand.push(...drawn);
                    }
                }
            }

            // Update player hand
            newPlayers[state.turnIndex] = { ...player, hand: newHand };

            return {
                ...state,
                players: newPlayers,
                deck: newDeck,
                logs: newLogs,
                currentPhase: 'play'
            };
        }

        case 'PLAY_CARD': {
            const playerIndex = state.turnIndex;
            const player = state.players[playerIndex];
            const card = player.hand.find(c => c.id === action.cardId);

            // CRITICAL FIX: Prevent playing cards if game is waiting for response (e.g. double click bang)
            if (state.currentPhase !== 'play') return state;

            if (!card) return state;

            // Prevent manual play of 'Missed' (EXCEPT Calamity Janet)
            if (card.effectType === 'missed' && player.character !== 'Calamity Janet') {
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

                // DYNAMITE LOGIC (Status Item - No Slot Limit)
                if (card.name === 'Dynamite') {
                    if (newPlayers[playerIndex].table.some(c => c.name === 'Dynamite')) {
                        return { ...state, logs: [...state.logs, "You already have Dynamite!"], selectedCardId: null };
                    }
                    newPlayers[playerIndex].table.push(card);
                    newLog += ` lit the DYNAMITE!`;

                    newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => c.id !== card.id);

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
                    // FIX: Recalculate range dynamically to ensure it matches effective range
                    newPlayers[playerIndex].weaponRange = getEffectiveRange(newPlayers[playerIndex]);
                } else {
                    // Gear Logic (Limit 2)
                    const existingGears = newPlayers[playerIndex].table.filter(c => c.subType !== 'Weapon');

                    if (existingGears.length >= 2) {
                        if (action.replacedCardId) {
                            const replaceIdx = newPlayers[playerIndex].table.findIndex(c => c.id === action.replacedCardId);
                            if (replaceIdx !== -1) {
                                newDiscard.push(newPlayers[playerIndex].table[replaceIdx]);
                                newPlayers[playerIndex].table.splice(replaceIdx, 1);
                                newPlayers[playerIndex].table.push(card);
                            } else {
                                return { ...state, logs: [...state.logs, "Invalid replacement card selected."], selectedCardId: null };
                            }
                        } else {
                            return { ...state, logs: [...state.logs, "Gear slots full! Choose a card to replace."], selectedCardId: null };
                        }
                    } else {
                        // Check for duplicates
                        if (newPlayers[playerIndex].table.some(c => c.name === card.name)) {
                            return { ...state, logs: [...state.logs, `You already have ${card.name} equipped!`], selectedCardId: null };
                        }
                        newPlayers[playerIndex].table.push(card);
                    }
                }
                newLog += ` equipped ${card.name}`;

                newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => c.id !== card.id);

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

                if ((card.effectType === 'bang' || (card.effectType === 'missed' && player.character === 'Calamity Janet')) && action.targetId) {
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

                    // FIX: Use dynamic range calculation instead of potentially stale weaponRange property
                    const effectiveRange = getEffectiveRange(player);

                    if (dist > effectiveRange) {
                        return { ...state, logs: [...state.logs, `ERROR_RANGE:${dist}|${effectiveRange}`], selectedCardId: null };
                    }

                    // CHECK BANG LIMIT
                    // Exception: Volcanic weapon allows unlimited bangs OR Willy the Kid
                    const hasVolcanic = player.table.some(c => c.nameKey === 'card_volcanic_name');
                    const isWillyTheKid = player.character === 'Willy the Kid';

                    if (!hasVolcanic && !isWillyTheKid && state.hasPlayedBang && (card.effectType === 'bang' || (card.effectType === 'missed' && player.character === 'Calamity Janet'))) {
                        // Feedback handled in UI, but return state unchanged here
                        return state;
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



                    // 1. Check Auto-Miss Logic (e.g. Calamity Janet/Barrel Auto?) - NO, INTERACTIVE NOW
                    // PAUSE GAME SET TO RESPONDING PHASE


                    // Discard the played BANG logic remains (move this UP or keep here)
                    const cardIdx = newPlayers[playerIndex].hand.findIndex(c => c.id === card.id);
                    if (cardIdx !== -1) newPlayers[playerIndex].hand.splice(cardIdx, 1);
                    newDiscard.push(card);

                    // LOG & CHANGE PHASE
                    let finalLogs = [...state.logs, newLog, `Waiting for ${target.name} to respond...`];

                    // Suzy Check (Attacker)
                    const suzyRes = checkSuzyLafayette(newPlayers[playerIndex], updatedDeck, newDiscard, finalLogs);
                    newPlayers[playerIndex] = suzyRes.player;
                    updatedDeck = suzyRes.deck;
                    newDiscard = suzyRes.discardPile;
                    finalLogs = suzyRes.logs;

                    return {
                        ...state,
                        players: newPlayers,
                        deck: updatedDeck,
                        discardPile: newDiscard,
                        logs: finalLogs,
                        selectedCardId: null,
                        currentPhase: 'responding', // NEW PHASE
                        pendingAction: {
                            type: 'bang',
                            sourceId: player.id,
                            targetId: target.id,
                            cardId: card.id,
                            barrelUsed: false
                        },
                        turnIndex: state.turnIndex,
                        hasPlayedBang: true,
                        turnPlayedCards: [...(state.turnPlayedCards || []), card],
                        latestDrawCheck: latestDrawCheck || state.latestDrawCheck,
                        responseQueue: [] // CRITICAL FIX: Ensure no stale queue exists
                    };
                }

                // Other Cards
                if (card.effectType === 'heal') {
                    if (player.hp < player.maxHp) {
                        newPlayers[playerIndex].hp += 1;
                        newLog += ` (Healed to ${newPlayers[playerIndex].hp})`;
                    } else {
                        return { ...state, logs: [...state.logs, "¡PV al máximo! No curas nada."], selectedCardId: null }; // Manual translation or fix later
                    }
                } else if (card.effectType === 'draw') {
                    const count = card.effectValue || 1;
                    const drawn = updatedDeck.slice(0, count);
                    updatedDeck = updatedDeck.slice(count);
                    newPlayers[playerIndex].hand.push(...drawn);
                    newLog += ` drew ${count} cards`;
                } else if (card.effectType === 'damage_all' || card.effectType === 'indians') {
                    // Gatling OR Indians -> QUEUE BASED INTERACTION 
                    // This allows interactive defense (Barrel/Missed/Bang)
                    const isIndians = card.effectType === 'indians';

                    // Identify Targets (All other living players)
                    let targets: { targetId: string, sourceId: string, cardId: string, type: 'gatling' | 'indians' }[] = [];

                    const totalPlayers = newPlayers.length;
                    for (let i = 1; i < totalPlayers; i++) {
                        const idx = (playerIndex + i) % totalPlayers;
                        if (!newPlayers[idx].isDead) {
                            targets.push({
                                targetId: newPlayers[idx].id,
                                sourceId: player.id,
                                cardId: card.id,
                                type: isIndians ? 'indians' : 'gatling'
                            });
                        }
                    }

                    if (targets.length > 0) {
                        const first = targets[0];
                        const remaining = targets.slice(1);

                        newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => c.id !== card.id);
                        newDiscard.push(card);

                        return {
                            ...state,
                            players: newPlayers,
                            deck: updatedDeck,
                            discardPile: newDiscard,
                            logs: [...state.logs, newLog], // Log the play
                            selectedCardId: null,
                            turnPlayedCards: [...(state.turnPlayedCards || []), card],
                            currentPhase: 'responding',
                            pendingAction: {
                                type: isIndians ? 'indians' : 'bang', // Indians uses 'indians' (needs bang), Gatling uses 'bang' (needs Missed)
                                sourceId: first.sourceId,
                                targetId: first.targetId,
                                cardId: first.cardId
                            },
                            responseQueue: remaining
                        };
                    } else {
                        newLog += ` (No Targets)`;
                    }

                } else if (card.effectType === 'saloon') {
                    newPlayers.forEach(p => {
                        if (!p.isDead && p.hp < p.maxHp) {
                            p.hp += 1;
                        }
                    });
                    newLog += ` | All players healed!`;
                } else if (card.effectType === 'general_store' || card.effectType === 'store') {
                    const aliveCount = newPlayers.filter(p => !p.isDead).length;

                    // Fix: Reshuffle if deck empty
                    if (updatedDeck.length < aliveCount) {
                        if (newDiscard.length > 0) {
                            updatedDeck = [...updatedDeck, ...shuffle(newDiscard)];
                            newDiscard = [];
                        }
                    }

                    // Clone to safe splice
                    updatedDeck = [...updatedDeck];
                    const drawn = updatedDeck.splice(0, aliveCount); // Takes up to length if less


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
                } else if (card.effectType === 'duel' && action.targetId) {
                    const targetIndex = newPlayers.findIndex(p => p.id === action.targetId);
                    const target = newPlayers[targetIndex];

                    newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => c.id !== card.id);
                    newDiscard.push(card);
                    newLog += ` challenges ${target.name} to a DUEL!`;

                    return {
                        ...state,
                        players: newPlayers,
                        deck: updatedDeck,
                        discardPile: newDiscard,
                        logs: [...state.logs, newLog],
                        selectedCardId: null,
                        currentPhase: 'responding',
                        pendingAction: {
                            type: 'duel',
                            sourceId: player.id, // Challenger
                            targetId: target.id, // Challenged (responds first)
                            cardId: card.id
                        },
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
                            return { ...state, logs: [...state.logs, `ERROR_RANGE:${dist}|1`], selectedCardId: null };
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
                        // Recalculate Target Stats (if stole from table)
                        if (target.table.length < newPlayers[targetIndex].table.length + (target.hand.length < newPlayers[targetIndex].hand.length ? 0 : 1)) {
                            // This check is complex. Simplify: Just recalc always safely.
                        }
                        // Actually, just recalc. It's cheap.
                        newPlayers[targetIndex] = calculatePlayerStats(target);

                        if (card.effectType === 'steal') {
                            newPlayers[playerIndex].hand.push(stolenCard);
                            newLog += ` stole a card from ${target.name} `;
                        } else {
                            newDiscard.push(stolenCard);
                            newLog += ` forced ${target.name} to discard a card`;
                        }
                    } else {
                        newLog += ` (Target has no cards!)`;
                    }
                }

                if (card.subType === 'Weapon' || card.effectType === 'equipment' || card.effectType === 'jail' || card.name === 'Mustang' || card.name === 'Mirilla' || card.name === 'Scope') {
                    // Equipment Logic
                    // Check if duplicate in play
                    const existingIdx = player.table.findIndex(c => c.name === card.name);
                    if (existingIdx !== -1) {
                        // Replace existing: Put old in discard
                        const oldCard = player.table[existingIdx];
                        newDiscard.push(oldCard);
                        newPlayers[playerIndex].table[existingIdx] = card;
                    } else {
                        // If Weapon, remove invalid old weapon
                        if (card.subType === 'Weapon') {
                            const weaponIdx = player.table.findIndex(c => c.subType === 'Weapon');
                            if (weaponIdx !== -1) {
                                newDiscard.push(player.table[weaponIdx]);
                                newPlayers[playerIndex].table.splice(weaponIdx, 1);
                            }
                        }
                        newPlayers[playerIndex].table.push(card);
                    }

                    // Remove from hand
                    const handIdx = newPlayers[playerIndex].hand.findIndex(c => c.id === card.id);
                    if (handIdx !== -1) newPlayers[playerIndex].hand.splice(handIdx, 1);

                    // RECALCULATE STATS
                    newPlayers[playerIndex] = calculatePlayerStats(newPlayers[playerIndex]);

                    newLog += ` equipped ${card.name}`;

                    // Suzy Check
                    const suzyRes = checkSuzyLafayette(newPlayers[playerIndex], updatedDeck, newDiscard, [...state.logs, newLog]);
                    newPlayers[playerIndex] = suzyRes.player;
                    updatedDeck = suzyRes.deck;
                    newDiscard = suzyRes.discardPile;
                    const finalLogsGeneric = suzyRes.logs;

                    return {
                        ...state,
                        players: newPlayers,
                        deck: updatedDeck,
                        discardPile: newDiscard,
                        logs: finalLogsGeneric,
                        selectedCardId: null,
                        turnPlayedCards: [...(state.turnPlayedCards || []), card],
                        hasPlayedBang: state.hasPlayedBang
                    };
                }

                newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => c.id !== card.id);
                newDiscard.push(card);

                // Suzy Check
                const suzyRes = checkSuzyLafayette(newPlayers[playerIndex], updatedDeck, newDiscard, [...state.logs, newLog]);
                newPlayers[playerIndex] = suzyRes.player;
                updatedDeck = suzyRes.deck;
                newDiscard = suzyRes.discardPile;
                const finalLogsGeneric = suzyRes.logs;

                return {
                    ...state,
                    players: newPlayers,
                    deck: updatedDeck,
                    discardPile: newDiscard,
                    logs: finalLogsGeneric,
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
                logs: [...state.logs, `${player.name} discarded ${discarded.name} `],
                currentPhase: 'discard' as const,
            };

            // Check if Requirement Met
            if (newHand.length <= player.hp) {
                // AUTO END TURN LOGIC
                const totalPlayers = state.players.length;
                let nextIndex = (state.turnIndex + 1) % totalPlayers;

                // Win Conditions Check
                const checkedState = checkGameEnd(newState);
                if (checkedState.gameOver) return checkedState;


                let loop = 0;
                while (state.players[nextIndex].isDead && loop < totalPlayers) {
                    nextIndex = (nextIndex + 1) % totalPlayers;
                    loop++;
                }

                return {
                    ...newState,
                    turnIndex: nextIndex,
                    currentPhase: 'draw',
                    logs: [...newState.logs, `-- - Turn Ended(Discard Complete)-- - `],
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

            let logs = [...state.logs, `${picker.name} took ${card.name} `];

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
                logs: [...state.logs, `-- - Turn Ended-- - `],
            };
        }

        case 'USE_ABILITY': {
            const userId = action.playerId;
            const player = state.players.find(p => p.id === userId);
            if (!player || state.turnIndex !== state.players.findIndex(p => p.id === userId)) {
                return { ...state, logs: [...state.logs, "Not your turn!"] };
            }

            if (player.character === 'Sid Ketchum') {
                if (player.hand.length < 2) {
                    return { ...state, logs: [...state.logs, "Not enough cards!"] };
                }
                if (player.hp >= player.maxHp) {
                    return { ...state, logs: [...state.logs, "Health full!"] };
                }
                return {
                    ...state,
                    currentPhase: 'sid_discard',
                    abilityPendingDiscords: [],
                    logs: [...state.logs, "Sid Ketchum: Select 2 cards to discard."]
                };
            }
            // Pedro Ramirez logic could go here if phase is 'draw'

            return { ...state, logs: [...state.logs, `Ability for ${player.character} not implemented yet.`] };
        }

        case 'RESPOND': {
            if (state.currentPhase !== 'responding' || !state.pendingAction) return state;
            const { sourceId, targetId, barrelUsed } = state.pendingAction;

            // Validate Responder
            // In a real multiplayer setting we would check action.playerId, for now assume handling logic
            const targetIndex = state.players.findIndex(p => p.id === targetId);
            const sourceIndex = state.players.findIndex(p => p.id === sourceId);
            const target = state.players[targetIndex];

            let newPlayers = [...state.players];
            let newDiscard = [...state.discardPile];
            let newDeck = [...state.deck];
            let logs = [...state.logs];
            let currentPhase: GameState['currentPhase'] = state.currentPhase;
            let pendingAction: GameState['pendingAction'] = state.pendingAction;
            let latestDrawCheck = state.latestDrawCheck;
            let responseQueue = [...(state.responseQueue || [])];

            // --- DUEL LOGIC ---
            if (pendingAction.type === 'duel') {
                if (action.responseType === 'card') {
                    const requiredEffect: Card['effectType'] = 'bang';
                    const cardIndex = target.hand.findIndex(c => c.id === action.cardId && ((c.effectType as string) === requiredEffect || (target.character === 'Calamity Janet' && ((c.effectType as string) === 'bang' || (c.effectType as string) === 'missed'))));

                    if (cardIndex !== -1) {
                        const playedCard = target.hand[cardIndex];
                        newPlayers[targetIndex] = { ...target, hand: target.hand.filter(c => c.id !== action.cardId) };
                        newDiscard.push(playedCard);
                        logs.push(`${target.name} retaliates with BANG! Turn passes to opponent!`);

                        // SWAP ROLES for next round of Duel
                        pendingAction = {
                            ...pendingAction,
                            sourceId: targetId,
                            targetId: sourceId
                        };
                        return { ...state, players: newPlayers, discardPile: newDiscard, logs, pendingAction };
                    }
                } else if (action.responseType === 'take_hit') {
                    // Target Loses Duel
                    logs.push(`${target.name} loses the Duel!`);
                    const damageRes = handleDamage(
                        { ...state, players: newPlayers, deck: newDeck, discardPile: newDiscard, logs, currentPhase: 'play', pendingAction: undefined },
                        targetIndex,
                        1,
                        sourceIndex,
                        newDeck,
                        newDiscard,
                        logs
                    );
                    return {
                        ...state,
                        players: damageRes.players,
                        deck: damageRes.deck,
                        discardPile: damageRes.discardPile,
                        logs: damageRes.logs,
                        currentPhase: 'play',
                        pendingAction: undefined
                    };
                }
                // Barrel not allowed in Duel
                return state;
            }

            if (action.responseType === 'card') {
                const isIndians = pendingAction.type === 'indians';
                const requiredEffect: Card['effectType'] = isIndians ? 'bang' : 'missed';

                // For Indians, Calamity Janet can play 'missed' as 'bang'
                // For Bang/Gatling, Calamity Janet can play 'bang' as 'missed'
                const cardIndex = target.hand.findIndex(c => c.id === action.cardId && (c.effectType === requiredEffect || (target.character === 'Calamity Janet' && (c.effectType === 'bang' || c.effectType === 'missed'))));

                if (cardIndex !== -1) {
                    const playedCard = target.hand[cardIndex];
                    newPlayers[targetIndex] = {
                        ...target,
                        hand: target.hand.filter(c => c.id !== action.cardId)
                    };
                    newDiscard.push(playedCard);
                    logs.push(` -> ${target.name} defends with ${playedCard.name}`);

                    // Suzy Check (Defender)
                    // Note: 'newDeck' might not be defined in this scope if not initialized, but typically is in RESPOND.
                    // Checking RESPOND reducer initialization... usually 'let newDeck = [...state.deck];'
                    // If not, we might need to be careful. Assuming newDeck exists.
                    // Actually, RESPOND uses 'newDeck' in 'barrel' case (Line 1712), so it should be available.
                    // Wait, lines 1650 don't show newDeck init.
                    // Let's assume it IS defined (standard pattern). If fails, I'll fix.
                    // Actually, looking at 'barrel' case, it uses 'newDeck'.
                    const suzyResDef = checkSuzyLafayette(newPlayers[targetIndex], newDeck, newDiscard, logs);
                    newPlayers[targetIndex] = suzyResDef.player;
                    newDeck = suzyResDef.deck;
                    newDiscard = suzyResDef.discardPile;
                    logs = suzyResDef.logs;


                    // --- SLAB THE KILLER LOGIC ---
                    const sourceId = pendingAction.sourceId;
                    const attacker = state.players.find(p => p.id === sourceId);

                    if (attacker && attacker.character === 'Slab the Killer' && pendingAction.type === 'bang') {
                        const currentMissed = pendingAction.missedPlayed || 0;
                        if (currentMissed < 1) {
                            // Needs one more!
                            logs.push(`🔪 Slab the Killer's BANG! requires 2 Missed! cards. (1/2 played)`);
                            return {
                                ...state,
                                players: newPlayers,
                                discardPile: newDiscard,
                                logs,
                                pendingAction: {
                                    ...pendingAction,
                                    missedPlayed: 1
                                }
                            };
                        }
                    }
                    // -----------------------------

                    // Proceed to next in queue or end
                    if (responseQueue.length > 0) {
                        const next = responseQueue[0];
                        pendingAction = {
                            type: next.type === 'indians' ? 'indians' : 'bang',
                            sourceId: next.sourceId,
                            targetId: next.targetId,
                            cardId: next.cardId
                        };
                        responseQueue.shift(); // Remove from queue
                        // Keep currentPhase 'responding'
                    } else {
                        currentPhase = 'play';
                        pendingAction = undefined; // Resolved
                    }
                }
            }
            else if (action.responseType === 'barrel') {
                if (barrelUsed) return state; // Already used
                if (pendingAction.type === 'indians') return state; // Cannot barrel Indians

                // Draw Check
                const check = checkDraw(newDeck, newDiscard);
                newDeck = check.deck;
                newDiscard = check.discardPile;
                const drawnCard = check.drawnCard;

                let success = drawnCard.suit === 'hearts';
                if (target.character === 'Jourdonnais') {
                    // Standard Jourdonnais is simplified here
                }

                logs.push(i18n.t('log_barrel_check', { name: target.name, card: `${drawnCard.suit} ${drawnCard.value}` }));
                logs.push(success ? i18n.t('log_barrel_success') : i18n.t('log_barrel_fail'));

                latestDrawCheck = {
                    card: drawnCard,
                    reason: 'barrel',
                    success,
                    playerId: target.id,
                    timestamp: Date.now()
                };

                if (success) {
                    // Proceed to next in queue or end
                    if (responseQueue.length > 0) {
                        const next = responseQueue[0];
                        pendingAction = {
                            type: next.type === 'indians' ? 'indians' : 'bang',
                            sourceId: next.sourceId,
                            targetId: next.targetId,
                            cardId: next.cardId
                        };
                        responseQueue.shift();
                    } else {
                        currentPhase = 'play';
                        pendingAction = undefined; // Resolved
                    }
                } else {
                    // Mark barrel as used, allow user to try card or take hit
                    pendingAction = { ...pendingAction!, barrelUsed: true };
                }
            }
            else if (action.responseType === 'take_hit') {
                // Damage Handling
                const damageRes = handleDamage(
                    { ...state, players: newPlayers, deck: newDeck, discardPile: newDiscard, currentPhase: 'play', pendingAction: undefined, logs },
                    targetIndex,
                    1,
                    sourceIndex,
                    newDeck,
                    newDiscard,
                    logs
                );

                // Update refs after damage
                newPlayers = damageRes.players;
                newDeck = damageRes.deck;
                newDiscard = damageRes.discardPile;
                logs = damageRes.logs;

                // Proceed to next in queue or end
                if (responseQueue.length > 0) {
                    const next = responseQueue[0];
                    pendingAction = {
                        type: next.type === 'indians' ? 'indians' : 'bang',
                        sourceId: next.sourceId,
                        targetId: next.targetId,
                        cardId: next.cardId
                    };
                    responseQueue.shift();
                } else {
                    currentPhase = 'play';
                    pendingAction = undefined; // Resolved
                }
            }

            return checkGameEnd({
                ...state,
                players: newPlayers,
                deck: newDeck,
                discardPile: newDiscard,
                logs: logs,
                currentPhase: currentPhase,
                pendingAction: pendingAction,
                latestDrawCheck,
                responseQueue: responseQueue
            });
        }

        default:
            return state;
    }
}
/*
            if (state.currentPhase !== 'responding' || !state.pendingAction) return state;
            const { sourceId, targetId, barrelUsed } = state.pendingAction;

            // Validate Responder
            const targetIndex = state.players.findIndex(p => p.id === targetId);
            const sourceIndex = state.players.findIndex(p => p.id === sourceId);
            const target = state.players[targetIndex];

            let newPlayers = [...state.players];
            let newDiscard = [...state.discardPile];
            let newDeck = [...state.deck];
            let logs = [...state.logs];
            let pendingAction: GameState['pendingAction'] = state.pendingAction;
            let latestDrawCheck = state.latestDrawCheck;
            let nextPhase = state.currentPhase;

            if (action.responseType === 'card') {
                const isIndians = pendingAction.type === 'indians';
                const requiredEffect = isIndians ? 'bang' : 'missed';
                
                const cardIndex = target.hand.findIndex(c => c.id === action.cardId && (c.effectType === requiredEffect || (target.character === 'Calamity Janet' && (c.effectType === 'bang' || c.effectType === 'missed'))));
                
                if (cardIndex !== -1) {
                    const playedCard = target.hand[cardIndex];
                    newPlayers[targetIndex] = {
                        ...target,
                        hand: target.hand.filter(c => c.id !== action.cardId)
                    };
                    newDiscard.push(playedCard);
                    logs.push(` -> ${target.name} defends with ${playedCard.name}`);
                    
                    // Proceed to next in queue or end
                    if (state.responseQueue && state.responseQueue.length > 0) {
                        const next = state.responseQueue[0];
                        pendingAction = {
                            type: next.type === 'indians' ? 'indians' : next.type === 'gatling' ? 'bang' : 'bang', // Map types
                            sourceId: next.sourceId,
                            targetId: next.targetId,
                            cardId: next.cardId
                        };
                        state.responseQueue.shift(); // Remove from queue
                        // Keep currentPhase 'responding'
                    } else {
                        nextPhase = 'play';
                        pendingAction = undefined; // Resolved
                    }
                }
            }
            else if (action.responseType === 'barrel') {
                if (barrelUsed) return state; // Already used
                if (pendingAction.type === 'indians') return state; // Cannot barrel Indians

                // Draw Check
                const check = checkDraw(newDeck, newDiscard);
                newDeck = check.deck;
                newDiscard = check.discardPile;
                const drawnCard = check.drawnCard;

                let success = drawnCard.suit === 'hearts'; // Barrel succeeds on Hearts
                if (target.character === 'Jourdonnais') {
                   // Jourdonnais effect is passive barrel, but if using item barrel...
                   // Rules: Jourdonnais can use ability AND barrel. Implementation simplistic here.
                }

                logs.push(` -> ${target.name} Barrel Check: ${drawnCard.value} of ${drawnCard.suit} (${success ? 'AVOIDED!' : 'FAILED'})`);

                latestDrawCheck = {
                    card: drawnCard,
                    reason: 'barrel',
                    success,
                    playerId: target.id,
                    timestamp: Date.now()
                };

                if (success) {
                     // Proceed to next in queue or end
                    if (state.responseQueue && state.responseQueue.length > 0) {
                        const next = state.responseQueue[0];
                        pendingAction = {
                            type: next.type === 'indians' ? 'indians' : next.type === 'gatling' ? 'bang' : 'bang',
                            sourceId: next.sourceId,
                            targetId: next.targetId,
                            cardId: next.cardId
                        };
                        state.responseQueue.shift();
                    } else {
                        nextPhase = 'play';
                        pendingAction = undefined;
                    }
                } else {
                    // Mark barrel as used, allow user to try card or take hit
                    pendingAction = { ...pendingAction!, barrelUsed: true };
                }
            }
            else if (action.responseType === 'take_hit') {
                // Damage Handling
                const damageRes = handleDamage(
                    { ...state, players: newPlayers, deck: newDeck, discardPile: newDiscard, currentPhase: 'play', pendingAction: undefined, logs },
                    targetIndex,
                    1,
                    sourceIndex,
                    newDeck,
                    newDiscard,
                    logs
                );
                
                // Update refs after damage
                newPlayers = damageRes.players;
                newDeck = damageRes.deck;
                newDiscard = damageRes.discardPile;
                logs = damageRes.logs;

                 // Proceed to next in queue or end
                 if (state.responseQueue && state.responseQueue.length > 0) {
                    const next = state.responseQueue[0];
                    pendingAction = {
                        type: next.type === 'indians' ? 'indians' : next.type === 'gatling' ? 'bang' : 'bang',
                        sourceId: next.sourceId,
                        targetId: next.targetId,
                        cardId: next.cardId
                    };
                    state.responseQueue.shift();
                } else {
                    nextPhase = 'play';
                    pendingAction = undefined;
                }
            }

            return {
                ...state,
                players: newPlayers,
                deck: newDeck,
                discardPile: newDiscard,
                logs: logs,
                currentPhase: nextPhase,
                pendingAction: pendingAction,
                latestDrawCheck,
                responseQueue: state.responseQueue
            };
        }

        default:
            return state;
    }
}
*/
