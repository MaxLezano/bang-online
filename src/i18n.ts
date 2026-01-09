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
                    add_bot: "ADD BOT",
                    remove_bot: "REMOVE BOT",
                    bot_unit: "BOT UNIT",
                    ai_controlled: "AI Controlled",
                    wanted_title: "WANTED",
                    choose_legend: "CHOOSE YOUR LEGEND",
                    select: "SELECT",
                    select_target: "SELECT TARGET",
                    join_room_title: "JOIN ROOM",
                    cancel: "CANCEL",
                    join_action: "JOIN",
                    connecting: "CONNECTING...",
                    total_players: "TOTAL",
                    human_player: "Human Player",
                    waiting_for_host: "Waiting for Host...",
                    room_code_input_label: "ROOM CODE",

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
                    hover_to_reveal: "Hover to Reveal Mission",

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
                    objective: "Objective",
                    empty: "Empty",
                    ability: "Ability",
                    view: "View",
                    health: "Health",
                    current_status: "CURRENT STATUS",
                    click_to_play: "CLICK TO PLAY",
                    cards_in_hand: "Cards in Hand",
                    distance_tooltip: "Distance / Range",
                    phase_general_store: "GENERAL STORE",
                    phase_sid_discard: "ABILITY: DISCARD 2",
                    phase_kit_carlson_discard: "KIT: RETURN 1 CARD TO DECK",
                    eliminated: "ELIMINATED",
                    label_weapon: "WEAPON",
                    label_gear: "GEAR",
                    dead_status: "DEAD",
                    type_equipment: "Equipment",
                    indicator_you: "(YOU)",
                    type_scope: "Scope",
                    type_action: "Action",
                    type_status: "Status",
                    winner_is: "WINNER IS",
                    role_outlaws: "THE OUTLAWS",
                    back_to_lobby: "RETURN TO LOBBY",

                    // Phases
                    phase_draw: "DRAW PHASE",
                    phase_play: "PLAY PHASE",
                    phase_discard: "DISCARD PHASE",
                    phase_responding: "WAITING FOR RESPONSE...",
                    phase_wait: "WAITING...",
                    phase_select_character: "SELECT CHARACTER",
                    general_store_open: "GENERAL STORE OPEN",
                    your_turn_pick: "YOUR TURN TO PICK!",
                    discard_pile: "Discard Pile",
                    graveyard_empty: "The graveyard is empty...",
                    waiting_bot: "WAITING FOR BOT...",

                    // Actions
                    draw_cards: "Draw Cards",
                    end_turn: "END TURN",
                    use_ability: "USE ABILITY",

                    // Logs
                    game_init: "Game Initialized. Waiting to start...",
                    game_init_select_char: "Select your character!",
                    game_started: "Game Started! Sheriff goes first.",
                    turn_start: "Start of Turn",
                    discard_limit: "Hand Limit: {{limit}}",
                    discard_excess: "Discard {{count}} cards",

                    // Messages
                    // Interactive Defense
                    attacked: "ATTACKED!",
                    is_attacking_you: "is attacking you",
                    play_missed_hint: "Select a Missed! card to dodge.",
                    play_bang_hint: "Discard a BANG! card to escape!",
                    use_barrel: "USE BARREL",
                    take_damage: "TAKE DAMAGE",
                    must_play_missed: "You must play a Missed! card!",

                    // Messages
                    limit_reached: "LIMIT REACHED",
                    bang_limit_reached: "You can only play 1 BANG! per turn\nUNLESS YOU HAVE A VOLCANIC",

                    // Draw Check
                    checking: "Drawing for",
                    failed: "FAILED",
                    success: "PASSED",

                    already_equipped: "ALREADY EQUIPPED",
                    already_equipped_desc: "You already have {{card}} equipped!",
                    cannot_jail_sheriff: "CANNOT JAIL SHERIFF",
                    cannot_jail_sheriff_desc: "You cannot put the Sheriff in Jail!",
                    close: "CLOSE",
                    your_turn: "It's your turn!",
                    waiting_for: "Waiting for {{name}}...",
                    win_admin: "Law and Order Prevails! (Sheriff Won)",
                    win_outlaws: "The West is Wild! (Outlaws Won)",
                    win_renegade: "New Sheriff in Town! (Renegade Won)",

                    // Characters
                    char_vulture_sam: "Takes all cards (hand & table) from eliminated players.",
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
                    card_lightning_name: "LIGHTNING",
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
                    card_appaloosa_name: "Appaloosa",

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
                    card_mustang_desc: "Others see you at distance +1",
                    card_scope_desc: "See others at distance -1.",
                    card_barrel_desc: "Draw! when attacked to avoid.",
                    card_jail_desc: "Skip turn unless you Draw! Hearts.",
                    card_dynamite_desc: "Draw! If Spades 2-9, take 3 damage.",
                    card_appaloosa_desc: "See others at distance -1.",
                    card_alijo_desc: "Draw a card when targeted by a Bang!.",

                    // Modals
                    modal: {
                        weapon_replacement: "WEAPON REPLACEMENT",
                        gear_limit_reached: "GEAR LIMIT REACHED",
                        equip_new_weapon: "Equip New Weapon?",
                        choose_discard: "Choose Item to Discard",
                        new: "New",
                        incoming: "Incoming",
                        current: "Current",
                        equipped: "Equipped",
                        discard: "Discard",
                        cancel: "Cancel",
                        confirm_replace: "Confirm Replace"
                    }
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
                    add_bot: "AÑADIR BOT",
                    remove_bot: "ELIMINAR BOT",
                    bot_unit: "UNIDAD ROBOT",
                    ai_controlled: "Controlado por IA",
                    wanted_title: "SE BUSCA",
                    choose_legend: "ELIGE TU LEYENDA",
                    select: "SELECCIONAR",
                    select_target: "SELECCIONAR OBJETIVO",
                    use_ability: "USAR HABILIDAD",

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
                    hover_to_reveal: "Pasa el cursor para revelar misión",

                    // UI / HUD
                    hp: "PV",
                    range: "Alcance",
                    distance: "Dist",
                    player_intel: "INFORMACIÓN JUGADOR",
                    hand_label: "Mano",
                    cards_suffix: "cartas",
                    dead_status: "MUERTO",
                    // Nombres de Cartas
                    deck: "Mazo",
                    discard: "Descartes",
                    role: "Rol",
                    character: "Personaje",
                    stats: "ESTADÍSTICAS",
                    objective: "Objetivo",
                    empty: "Vacío",
                    ability: "Habilidad",
                    view: "Visión",
                    health: "Salud",
                    current_status: "ESTADO ACTUAL",
                    click_to_play: "CLIC PARA JUGAR",
                    cards_in_hand: "Cartas en Mano",
                    distance_tooltip: "DISTANCIA",
                    phase_general_store: "ALMACÉN",
                    phase_sid_discard: "HABILIDAD: DESCARTAR 2",
                    label_weapon: "ARMA",
                    label_gear: "EQUIPO",
                    label_weapon_range: "ALCANCE",
                    label_sight: "DEFENSA",
                    label_defense: "DISTANCIA",
                    type_equipment: "Equipo",
                    indicator_you: "(TÚ)",
                    type_scope: "Mirilla",
                    type_action: "Acción",
                    type_status: "Estado",
                    winner_is: "VICTORIA PARA",
                    role_outlaws: "LOS FORAJIDOS",
                    back_to_lobby: "VOLVER AL LOBBY",

                    // Phases
                    phase_draw: "FASE DE ROBO",
                    phase_play: "FASE DE JUEGO",
                    phase_discard: "FASE DE DESCARTE",
                    phase_responding: "ESPERANDO RESPUESTA...",
                    phase_wait: "ESPERANDO...",
                    phase_select_character: "ELEGIR PERSONAJE",
                    general_store_open: "ALMACÉN ABIERTO",
                    your_turn_pick: "¡TU TURNO DE ELEGIR!",

                    // Interactive Defense
                    attacked: "¡ATACADO!",
                    is_attacking_you: "te está atacando",
                    use_barrel: "Usar Barril",
                    take_damage: "Recibir Daño",
                    play_missed_hint: "Elige carta Fallaste! para esquivar",
                    must_play_missed: "¡Debes jugar una carta Fallaste!",

                    discard_pile: "Pila de Descartes",
                    graveyard_empty: "El cementerio está vacío...",
                    waiting_bot: "ESPERANDO AL BOT...",

                    // Actions
                    draw_cards: "Robar Cartas",
                    end_turn: "TERMINAR TURNO",

                    // Logs
                    game_init: "Juego iniciado. Esperando...",
                    game_init_select_char: "¡Elige tu personaje!",
                    game_started: "¡Empieza el juego! El Sheriff va primero.",
                    turn_start: "Inicio de Turno",
                    discard_limit: "Límite: {{limit}}",
                    discard_excess: "Descarta {{count}} cartas",
                    log_jail_check: "{{name}} revisa la Prisión... Carta: {{card}}",
                    log_jail_escaped: "¡Escapó de la Prisión! El turno continúa.",
                    log_jail_stayed: "¡Se queda en Prisión! Pierde el turno.",
                    log_dynamite_check: "{{name}} revisa la Dinamita... Carta: {{card}}",
                    log_dynamite_exploded: "¡LA DINAMITA EXPLOTÓ! 3 de Daño!",
                    log_dynamite_passed: "La Dinamita pasa el siguiente jugador.",
                    log_barrel_check: "{{name}} usa Barril... Carta: {{card}}",
                    log_barrel_success: "¡Esquivado! (Barril)",
                    log_barrel_fail: "¡Falló! (Barril)",
                    log_panic_range: "¡Objetivo fuera de alcance para Pánico! (Dist: {{dist}})",
                    error_out_of_range_title: "OBJETIVO FUERA DE ALCANCE",
                    error_out_of_range_desc: "Distancia al Objetivo: {{dist}}\nTu Alcance: {{range}}\n\n¡Necesitas un arma con más alcance o acercarte (Mustang)!",

                    // Death
                    death_title: "ELIMINADO",
                    death_desc: "Has caído en combate...",
                    spectate_mode: "MODO ESPECTADOR",

                    // Draw Check
                    draw_check_title: "CHEQUEO DE CARTA",
                    success: "ÉXITO",
                    fail: "FALLO",
                    player_label: "Jugador",
                    check_reason_barrel: "EFECTO BARRIL",
                    check_reason_dynamite: "DINAMITA",
                    check_reason_jail: "PRISIÓN",
                    check_reason_event: "EVENTO",

                    // Jesse Jones
                    jesse_jones_prompt: "Habilidad: Jesse Jones",
                    jesse_jones_desc: "Puedes robar tu primera carta del mazo o de la mano de otro jugador.",
                    draw_deck: "Robar del Mazo",
                    steal_hand: "Robar de {{name}}",
                    steal_hand_short: "Robar Mano",

                    // Kit Carlson
                    kit_carlson_prompt: "Elige 1 carta para DEVOLVER al mazo",
                    kit_carlson_keep: "(Te quedarás con las otras 2)",
                    return_to_deck: "DEVOLVER",

                    // Messages
                    limit_reached: "LÍMITE ALCANZADO",
                    bang_limit_reached: "Solo puedes jugar 1 BANG! por turno\nA MENOS QUE OTRA CARTA TE LO PERMITA",
                    already_equipped: "YA EQUIPADO",
                    already_equipped_desc: "¡Ya tienes equipado {{card}}!",
                    cannot_jail_sheriff: "IMPOSIBLE ENCARCELAR AL SHERIFF",
                    cannot_jail_sheriff_desc: "¡No puedes meter al Sheriff en la cárcel!",

                    // Draw Check
                    checking: "Comprobando",

                    close: "CERRAR",
                    your_turn: "¡Es tu turno!",
                    waiting_for: "Esperando a {{name}}...",
                    win_admin: "¡La Ley prevalece! (Ganó el Sheriff)",
                    win_outlaws: "¡El Oeste es Salvaje! (Ganaron Forajidos)",
                    win_renegade: "¡Nuevo Sheriff en la ciudad! (Ganó Renegado)",

                    needs_bang: "La carta INDIOS requiere descartar un BANG! o recibir daño.",
                    out_of_range: "OBJETIVO FUERA DE ALCANCE",
                    invalid_card: "CARTA INVÁLIDA",

                    // Death Logs
                    log_kill_outlaw: "💰 RECOMPENSA: Robas 3 cartas por eliminar a un FORAJIDO.",
                    log_kill_deputy: "⚠️ CASTIGO: El Sheriff pierde todas sus cartas por matar a un AGUACIL.",
                    log_vulture_loot: "🦅 Vulture Sam rapiña las cartas de {{name}}.",
                    log_death_discard: "⚰️ Las cartas de {{name}} van al descarte.",
                    needs_missed: "Necesitas una carta FALLASTE.",
                    hand_empty: "Tu mano está vacía...",

                    // Characters
                    char_vulture_sam: "Toma todas las cartas (mano y juego) de los jugadores eliminados.",
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
                    card_lightning_name: "RAYO",
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
                    card_appaloosa_name: "Appaloosa",
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
                    card_indians_desc: "Todos los demás descartan BANG! o reciben daño.",
                    card_gatling_desc: "Dispara un BANG! a todos los demás.",
                    card_saloon_desc: "Cura 1 PV a todos.",
                    card_volcanic_desc: "Alcance 1. Juega BANGs ilimitados.",
                    card_dynamite: "DINAMITA",
                    card_dynamite_desc: "Al inicio de tu turno: Si sacas Espadas 2-9, ¡PIERDES 3 VIDAS! Si no, pasa al vecino.",
                    card_appaloosa_desc: "Ves a los demás a distancia -1.",
                    card_schofield_desc: "Alcance 2.",
                    card_remington_desc: "Alcance 3.",
                    card_rev_carabine_desc: "Alcance 4.",
                    card_winchester_desc: "Alcance 5.",
                    card_mustang_desc: "Otros te ven a distancia +1",
                    card_scope_desc: "Ves a otros a distancia -1.",
                    card_barrel_desc: "¡Desenfundar! al ser atacado para evitar.",
                    card_jail_desc: "Pierdes turno a menos que Desenfudes Corazones.",

                    // New Lobby Keys
                    join_room_title: "UNIRSE A SALA",
                    cancel: "CANCELAR",
                    join_action: "UNIRSE",
                    connecting: "CONECTANDO...",
                    total_players: "TOTAL",
                    human_player: "Jugador Humano",
                    waiting_for_host: "Esperando al Anfitrión...",
                    room_code_input_label: "CÓDIGO DE SALA",


                    card_alijo_desc: "Roba una carta cuando eres objetivo de un Bang!.",

                    // Modals
                    modal: {
                        weapon_replacement: "REEMPLAZO DE ARMA",
                        gear_limit_reached: "LÍMITE DE EQUIPO ALCANZADO",
                        equip_new_weapon: "¿Equipar Nueva Arma?",
                        choose_discard: "Elige Objeto a Descartar",
                        new: "Nueva",
                        incoming: "Entrante",
                        current: "Actual",
                        equipped: "Equipado",
                        discard: "Descartar",
                        cancel: "Cancelar",
                        confirm_replace: "Confirmar"
                    }
                }
            },
        },
    });

export default i18n;
