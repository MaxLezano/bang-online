import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languagedetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources: {
            en: {
                translation: {
                    game_title: "BANG! - Wild West",

                    // Welcome / Lobby
                    welcome: "WELCOME",
                    description: "High Stakes • Fast Draw • No Mercy",
                    start_game: "START GAME",
                    enter_name: "PLAYER NAME",
                    join_lobby: "JOIN FORCE",
                    create_lobby: "CREATE LOBBY",
                    back: "BACK",
                    waiting_room: "WAITING ROOM",
                    room_code: "ACCESS CODE",
                    copy_code: "COPY",
                    copied: "COPIED",
                    needs_3_players: "Need 3+ Players",
                    start_match: "START MATCH",
                    loading: "LOADING",
                    waiting_for_others: "Waiting for other legends...",

                    // Roles
                    role_admin: "Sheriff",
                    role_hacker: "Deputy",
                    role_virus: "Outlaw",
                    role_glitch: "Renegade",
                    role_sheriff: "Sheriff",
                    role_deputy: "Deputy",
                    role_outlaw: "Outlaw",
                    role_renegade: "Renegade",
                    role_sheriff_goal: "Kill all Outlaws and the Renegade.",
                    role_outlaw_goal: "Kill the Sheriff.",
                    role_deputy_goal: "Protect the Sheriff.",
                    role_renegade_goal: "Be the last one standing.",
                    role_card: "YOUR ROLE",
                    accept_mission: "ACCEPT MISSION",

                    // UI / HUD
                    hp: "HP",
                    range: "Range",
                    distance: "Dist",
                    cards: "Cards",
                    deck: "Deck",
                    discard: "Discard",
                    role: "Role",
                    character: "Character",
                    stats: "STATS",

                    // Phases
                    phase_draw: "DRAW PHASE",
                    phase_play: "PLAY PHASE",
                    phase_discard: "DISCARD PHASE",
                    phase_wait: "WAITING...",
                    phase_select_character: "SELECT CHARACTER",

                    // Actions
                    draw_cards: "Draw Cards",
                    end_turn: "END TURN",

                    // Logs
                    game_init: "Game Initialized. Waiting to start...",
                    game_init_select_char: "Select your character!",
                    game_started: "Game Started! Sheriff goes first.",
                    turn_start: "Start of Turn",

                    // Messages
                    your_turn: "It's your turn!",
                    waiting_for: "Waiting for {{name}}...",
                    win_admin: "Law and Order Prevails! (Sheriff Won)",
                    win_outlaws: "The West is Wild! (Outlaws Won)",
                    win_renegade: "New Sheriff in Town! (Renegade Won)",

                    // Characters
                    char_vulture_sam: "Take a card when a player is eliminated.",
                    char_paul_regret: "All players see you at distance +1.",
                    char_kit_carlson: "Draw 3 cards, keep 2.",
                    char_jesse_jones: "Draw first card from another player's hand.",
                    char_willy_the_kid: "Can play any number of Bang! cards.",
                    char_rose_doolan: "See all players at distance -1.",
                    char_bart_cassidy: "Draw a card when hit.",
                    char_el_gringo: "Draw a card from player who hits you.",
                    char_slab_the_killer: "Bang! requires 2 Missed! to cancel.",
                    char_suzy_lafayette: "Draw a card when hand is empty.",
                    char_sid_ketchum: "Discard 2 cards to heal 1 HP.",
                    char_pedro_ramirez: "Draw first card from discard pile.",
                    char_lucky_duke: "\"Draw!\" checks flip 2 cards, choose 1.",
                    char_jourdonnais: "Has a built-in Barrel effect.",
                    char_black_jack: "Show 2nd draw card: if Red/Diamond, draw another.",
                    char_calamity_janet: "Can use Bang! as Missed! and vice versa.",

                    // Card Names
                    card_bang_name: "BANG!",
                    card_missed_name: "Missed!",
                    card_beer_name: "Beer",
                    card_panic_name: "Panic!",
                    card_cat_balou_name: "Cat Balou",
                    card_stagecoach_name: "Stagecoach",
                    card_wells_fargo_name: "Wells Fargo",
                    card_general_store_name: "General Store",
                    card_duel_name: "Duel",
                    card_indians_name: "Indians!",
                    card_gatling_name: "Gatling",
                    card_saloon_name: "Saloon",

                    // Equipment Names
                    card_volcanic_name: "Volcanic",
                    card_schofield_name: "Schofield",
                    card_remington_name: "Remington",
                    card_rev_carabine_name: "Rev. Carabine",
                    card_winchester_name: "Winchester",
                    card_mustang_name: "Mustang",
                    card_scope_name: "Scope",
                    card_barrel_name: "Barrel",
                    card_jail_name: "Jail",
                    card_dynamite_name: "Dynamite",

                    // Card Desc
                    card_bang_desc: "Attack a player in range.",
                    card_missed_desc: "Avoid a Bang! shot.",
                    card_beer_desc: "Regain 1 HP.",
                    card_panic_desc: "Draw a card from a player at distance 1.",
                    card_cat_balou_desc: "Force a player to discard a card.",
                    card_stagecoach_desc: "Draw 2 cards.",
                    card_wells_fargo_desc: "Draw 3 cards.",
                    card_general_store_desc: "Reveal cards for all players to pick.",
                    card_duel_desc: "Challenge a player. Loser takes 1 damage.",
                    card_indians_desc: "All others discard Bang! or take damage.",
                    card_gatling_desc: "Shoot a Bang! at all other players.",
                    card_saloon_desc: "Heal 1 HP for everyone.",
                    card_volcanic_desc: "Range 1. Play unlimited Bangs.",
                    card_schofield_desc: "Range 2.",
                    card_remington_desc: "Range 3.",
                    card_rev_carabine_desc: "Range 4.",
                    card_winchester_desc: "Range 5.",
                    card_mustang_desc: "Others see you at distance +1.",
                    card_scope_desc: "See others at distance -1.",
                    card_barrel_desc: "Draw! when attacked to avoid.",
                    card_jail_desc: "Skip turn unless you Draw! Hearts.",
                    card_dynamite_desc: "Draw! If Spades 2-9, take 3 damage.",
                    card_alijo_desc: "Draw a card when targeted by a Bang!.",
                }
            },

            // --- SPANISH ---
            es: {
                translation: {
                    game_title: "BANG! - El Lejano Oeste",

                    // Welcome / Lobby
                    welcome: "BIENVENIDO",
                    description: "Apuestas Altas • Desenfundado Rápido • Sin Piedad",
                    start_game: "COMENZAR",
                    enter_name: "NOMBRE DEL JUGADOR",
                    join_lobby: "UNIRSE",
                    create_lobby: "CREAR SALA",
                    back: "VOLVER",
                    waiting_room: "SALA DE ESPERA",
                    room_code: "CÓDIGO",
                    copy_code: "COPIAR",
                    copied: "COPIADO",
                    needs_3_players: "Necesitas 3+ Jugadores",
                    start_match: "INICIAR PARTIDA",
                    loading: "CARGANDO",
                    waiting_for_others: "Esperando otras leyendas...",

                    // Roles
                    role_admin: "Sheriff",
                    role_hacker: "Alguacil",
                    role_virus: "Forajido",
                    role_glitch: "Renegado",
                    role_sheriff: "Sheriff",
                    role_deputy: "Alguacil",
                    role_outlaw: "Forajido",
                    role_renegade: "Renegado",
                    role_sheriff_goal: "Elimina a los Forajidos y al Renegado.",
                    role_outlaw_goal: "Mata al Sheriff.",
                    role_deputy_goal: "Protege al Sheriff a toda costa.",
                    role_renegade_goal: "Sé el último en pie.",
                    role_card: "TU ROL",
                    accept_mission: "ACEPTAR MISIÓN",

                    // UI / HUD
                    hp: "PV",
                    range: "Alcance",
                    distance: "Dist",
                    cards: "Cartas",
                    deck: "Mazo",
                    discard: "Descartes",
                    role: "Rol",
                    character: "Personaje",
                    stats: "ESTADÍSTICAS",

                    // Phases
                    phase_draw: "FASE DE ROBO",
                    phase_play: "FASE DE JUEGO",
                    phase_discard: "FASE DE DESCARTE",
                    phase_wait: "ESPERANDO...",
                    phase_select_character: "ELEGIR PERSONAJE",

                    // Actions
                    draw_cards: "Robar Cartas",
                    end_turn: "TERMINAR TURNO",

                    // Logs
                    game_init: "Juego iniciado. Esperando...",
                    game_init_select_char: "¡Elige tu personaje!",
                    game_started: "¡Empieza el juego! El Sheriff va primero.",
                    turn_start: "Inicio de Turno",

                    // Messages
                    your_turn: "¡Es tu turno!",
                    waiting_for: "Esperando a {{name}}...",
                    win_admin: "¡La Ley prevalece! (Ganó el Sheriff)",
                    win_outlaws: "¡El Oeste es Salvaje! (Ganaron Forajidos)",
                    win_renegade: "¡Nuevo Sheriff en la ciudad! (Ganó Renegado)",

                    // Characters
                    char_vulture_sam: "Toma una carta cuando un jugador es eliminado.",
                    char_paul_regret: "Todos te ven a distancia +1.",
                    char_kit_carlson: "Roba 3 cartas, quédate 2.",
                    char_jesse_jones: "Roba la primera carta de la mano de otro.",
                    char_willy_the_kid: "Puedes jugar cualquier número de cartas BANG!.",
                    char_rose_doolan: "Ves a todos a distancia -1.",
                    char_bart_cassidy: "Roba una carta cuando eres herido.",
                    char_el_gringo: "Roba una carta del jugador que te hiera.",
                    char_slab_the_killer: "BANG! requiere 2 Fallados para cancelar.",
                    char_suzy_lafayette: "Roba una carta cuando tu mano está vacía.",
                    char_sid_ketchum: "Descarta 2 cartas para curar 1 PV.",
                    char_pedro_ramirez: "Roba la primera carta del descarte.",
                    char_lucky_duke: "En '¡Desenfundar!', voltea 2 cartas y elige 1.",
                    char_jourdonnais: "Tiene un efecto Barril incorporado.",
                    char_black_jack: "Muestra 2ª carta: si es Roja/Diamante, roba otra.",
                    char_calamity_janet: "Puede usar BANG! como Fallado y viceversa.",

                    // Card Names
                    card_bang_name: "BANG!",
                    card_missed_name: "¡Fallado!",
                    card_beer_name: "Cerveza",
                    card_panic_name: "¡Pánico!",
                    card_cat_balou_name: "Cat Balou",
                    card_stagecoach_name: "Diligencia",
                    card_wells_fargo_name: "Wells Fargo",
                    card_general_store_name: "Almacén",
                    card_duel_name: "Duelo",
                    card_indians_name: "Indios!",
                    card_gatling_name: "Gatling",
                    card_saloon_name: "Salón",

                    // Equipment Names
                    card_volcanic_name: "Volcanic",
                    card_schofield_name: "Schofield",
                    card_remington_name: "Remington",
                    card_rev_carabine_name: "Rev. Carabine",
                    card_winchester_name: "Winchester",
                    card_mustang_name: "Mustang",
                    card_scope_name: "Mirilla",
                    card_barrel_name: "Barril",
                    card_jail_name: "Prisión",
                    card_dynamite_name: "Dinamita",
                    card_alijo_name: "Alijo",

                    // Card Desc
                    card_bang_desc: "Ataca a un jugador en alcance.",
                    card_missed_desc: "Evita un disparo BANG!.",
                    card_beer_desc: "Recupera 1 PV.",
                    card_panic_desc: "Roba una carta de un jugador a distancia 1.",
                    card_cat_balou_desc: "Obliga a descartar una carta.",
                    card_stagecoach_desc: "Roba 2 cartas.",
                    card_wells_fargo_desc: "Roba 3 cartas.",
                    card_general_store_desc: "Revela cartas para que todos elijan.",
                    card_duel_desc: "Desafía a un jugador.",
                    card_indians_desc: "Todos descartan BANG! o reciben daño.",
                    card_gatling_desc: "Dispara un BANG! a todos los demás.",
                    card_saloon_desc: "Cura 1 PV a todos.",
                    card_volcanic_desc: "Alcance 1. Juega BANGs ilimitados.",
                    card_schofield_desc: "Alcance 2.",
                    card_remington_desc: "Alcance 3.",
                    card_rev_carabine_desc: "Alcance 4.",
                    card_winchester_desc: "Alcance 5.",
                    card_mustang_desc: "Otros te ven a distancia +1.",
                    card_scope_desc: "Ves a otros a distancia -1.",
                    card_barrel_desc: "¡Desenfundar! al ser atacado para evitar.",
                    card_jail_desc: "Pierdes turno a menos que Desenfudes Corazones.",
                    card_dynamite_desc: "¡Desenfundar! Si Picas 2-9, recibes 3 daño.",
                    card_alijo_desc: "Esta carta permite robar cuando es objetivo de un BANG.",
                }
            },
        },
    });

export default i18n;
