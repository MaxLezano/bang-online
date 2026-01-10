# BANG! Online

A modern, responsive digital recreation of the famous Wild West card game **BANG!**. Face off as the Sheriff and their Deputies against the Outlaws and the Renegade in this game of shootouts, bluffing, and deduction.

Built with **React**, **TypeScript**, **Vite**, **TailwindCSS**, and **Socket.IO**.

## 🚀 Features

### 🎮 core Gameplay
-   **Faithful Adaptation**: Full implementation of rules, including roles (Sheriff, Outlaw, Renegade, Deputy) and character abilities.
-   **Smart Bots**: Play solo or fill empty slots with AI that makes strategic decisions based on roles and game state.
-   **Multiplayer Lobby**: Host/Guest architecture with real-time state synchronization via Socket.IO.
-   **Mechanics**:
    -   *General Store* optimization (auto-picks last card).
    -   *Black Jack* ability (draws extra card on Red).
    -   *Range & Distance* calculation fixes (Mustang, Scope, etc.).

### 🔊 Immersive Audio System
-   **Global Sound Engine**: React Context-based audio manager with volume control and overlap support (using `cloneNode` for rapid fire).
-   **Dynamic Effects**:
    -   **Action Sounds**: *Bang!*, *Missed!*, *Dynamite*, *Jail*, *Beer* (glug), and *Equip* (cocking gun).
    -   **Game Events**: Turn start bells, card shuffling, and victory/defeat fanfares.
    -   **UI Feedback**: Responsive click sounds on buttons and card interactions.
-   **Safety**: Graceful failure if audio assets are missing.

### 🎨 Modern UI/UX
-   **Responsive Design**: Fluid layout that adapts to various screen sizes.
-   **Visual Polish**:
    -   Custom white vector crosshair cursor for target selection.
    -   Animated card interactions and modals.
    -   Attack notifications (e.g., "[Player] is attacking you!").
-   **Internationalization**: Built-in support for English and Spanish (`i18n`).

## 🛠️ Prerequisites

-   **Node.js**: Version 20.0.0 or higher is recommended.

## 📦 Installation

1.  Clone the repository or download the source code.
2.  Open a terminal in the project folder.
3.  Install dependencies:

```bash
npm install
```

## 🎮 How to Play (Local Development)

To start the development server:

```bash
npm run dev
```

This will launch the game in your default browser (usually at `http://localhost:5173`).

## 🏗️ Build for Production

To generate optimized files for deployment:

```bash
npm run build
```

The generated files will be in the `dist` folder.

## 📂 Project Structure

-   `src/components`: UI components (GameBoard, LobbyScreen, etc.).
-   `src/contexts`: Global state providers (**GameContext**, **SoundContext**).
-   `src/gameEngine.ts`: Core game logic (Reducer pattern).
-   `server/`: Socket.IO server logic for multiplayer synchronization.
-   `public/sounds`: Audio assets (mp3).
-   `public/icons`: SVG icons and cursors.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements or bug fixes!

---

*This project is a fan-made implementation and is not affiliated with the original creators of the board game.*
