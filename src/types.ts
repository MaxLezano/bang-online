export type Role = 'Sheriff' | 'Deputy' | 'Outlaw' | 'Renegade';
export type CardType = 'Action' | 'Equipment' | 'Status'; // 'Status' for blue cards like Jail/Dynamite? Or treat as Equipment?
// Actually Bang! has Brown (Action) and Blue (Equipment-like). 'Status' is good for temporary effects on players (Jail).

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 11=J, 12=Q, 13=K, 14=A

export interface Card {
    id: string;
    nameKey: string;
    descKey: string;
    name: string;
    type: CardType;
    subType?: 'Attack' | 'Defense' | 'Utility' | 'Weapon';
    suit: Suit;
    value: CardValue;
    // effectType covers all card logic keys
    effectType: 'bang' | 'missed' | 'heal' | 'beer' | 'draw' | 'discard' | 'steal' | 'equip' | 'damage_all' | 'duel' | 'indians' | 'saloon' | 'store' | 'general_store' | 'jail' | 'dynamite' | 'scope' | 'mustang' | 'barrel' | 'hideout' | 'sight_mod' | 'equipment';
    effectValue?: number;
    range?: number;
    description: string;
}

export interface Player {
    id: string;
    name: string;
    character: string;
    role: Role;
    hp: number;
    maxHp: number;
    weaponRange: number; // default 1, modified by Weapon cards
    viewDistance: number; // For Scope effects (seeing others closer) default 0
    distanceMod: number; // For Mustang effects (being seen further) default 0

    hand: Card[];
    table: Card[]; // Cards in play (Weapons, Items, Statuses)
    // equipment: Card[]; // DEPRECATED - use table

    position: number; // 0 to TotalPlayers - 1
    isDead: boolean;
    isBot: boolean;
}

export interface Character {
    name: string;
    description: string;
    abilityKey: string;
    hpMod: number; // Modifies base HP
}

export interface GameState {
    players: Player[];
    deck: Card[];
    discardPile: Card[];
    turnIndex: number;
    currentPhase: 'draw' | 'play' | 'discard' | 'select_character' | 'general_store' | 'sid_discard' | 'kit_carlson_discard' | 'jesse_jones_draw' | 'responding';
    logs: string[];
    selectedCardId: string | null;
    abilityPendingDiscords?: string[]; // IDs of cards discarded for ability (Sid Ketchum)
    gameOver?: boolean;
    winner?: string;
    pendingCharacters?: Record<string, Character[]>; // playerId -> characters
    pendingAction?: {
        type: 'bang' | 'duel' | 'general_store' | 'counter' | 'indians' | 'gatling'; // counter = waiting for missed/barrel
        sourceId: string;
        targetId: string;
        cardId?: string; // Card used to attack
        barrelUsed?: boolean; // If target tried barrel already
        missedPlayed?: number; // For Slab the Killer: Tracks how many missed cards played
    };
    responseQueue?: {
        targetId: string;
        sourceId: string;
        cardId: string;
        type: 'indians' | 'gatling';
    }[]; // For global attacks (Gatling, Indians)
    latestDrawCheck?: {
        card: Card;
        reason: 'barrel' | 'dynamite' | 'jail' | 'event';
        success: boolean;
        playerId: string;
        timestamp: number;
    };
    hasPlayedBang?: boolean;
    turnPlayedCards?: Card[];
    generalStoreCards?: Card[];
    generalStoreTurnIndex?: number | null;
    kitCarlsonCards?: Card[]; // Temp storage for Kit's 3 cards
}

export interface GameSettings {
    playerName: string;
    mode: 'SINGLE' | 'MULTIPLAYER';
    playerCount: number;
    botCount: number;
    roomId?: string;
    isHost?: boolean;
    players?: { id: string; name: string; isBot: boolean }[];
}

export type Action =
    | { type: 'INIT_GAME'; playerName: string; botCount: number; botNames?: string[]; players?: { id: string; name: string; isBot: boolean }[] }
    | { type: 'START_TURN' }
    | { type: 'SELECT_CARD'; cardId: string | null }
    | { type: 'JESSE_CHOOSE_DRAW'; source: 'deck' | 'player'; targetId?: string }
    | { type: 'PLAY_CARD'; cardId: string; targetId?: string; replacedCardId?: string }
    | { type: 'END_TURN' }
    | { type: 'DISCARD_CARD'; cardId: string }
    | { type: 'DRAW_CARD' }
    | { type: 'DRAW_CARD' }
    | { type: 'DRAFT_CARD'; cardId: string }
    | { type: 'DRAFT_CARD'; cardId: string }
    | { type: 'CHOOSE_CHARACTER'; playerId: string; characterName: string }
    | { type: 'USE_ABILITY'; playerId: string }
    | { type: 'RESPOND'; responseType: 'card' | 'barrel' | 'take_hit'; cardId?: string }
    | { type: 'SYNC_STATE'; state: GameState };
