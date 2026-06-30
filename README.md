# 2048 VS • Real-Time Competitive Arcade

A sleek, real-time competitive split-screen version of 2048. Challenge a friend on the same screen (via split-keyboard layouts) or test your own coordination skills! Built with high-performance React 19, Tailwind CSS v4, Motion, and an immersive custom Web Audio API synthesizer.

👉 **Play the live web app here:** [2048versus.netlify.app](https://2048versus.netlify.app)

---

## 🎮 Game Modes

### 1. 🏁 Race Mode
The classic speed run.
* **Objective:** Be the first player to merge and create the **Goal Tile** (e.g. `2048` or customized targets like `256`, `512`, `1024`).
* **Laps Option:** Turn on Lap Mode to race across multiple game sets (e.g., Best of 3 or Best of 5). Each time you reach the goal tile, your board resets and a lap point is scored!

### 2. ⚡ Survivor Mode
The high-intensity clock pressure match.
* **Objective:** Keep making moves to survive! 
* **Mechanics:** Every move reset your dynamic timer (starts at 10 seconds). If you do not make a valid move before the timer expires, you get **eliminated**!
* **Fast-Paced Action:** As you score higher, the timer shrinks dynamically down to as low as 3 seconds, making lightning-fast planning essential.

---

## 🕹️ Controls Layout

Perfectly optimized for local split-screen battles.

| Action | 🔵 Player 1 (Left) | 🔴 Player 2 (Right) |
| :--- | :--- | :--- |
| **Move Up** | <kbd>W</kbd> | <kbd>▲</kbd> Arrow Up |
| **Move Down**| <kbd>S</kbd> | <kbd>▼</kbd> Arrow Down |
| **Move Left**| <kbd>A</kbd> | <kbd>◀</kbd> Arrow Left |
| **Move Right**|<kbd>D</kbd> | <kbd>▶</kbd> Arrow Right |
| **Touch** | Swipe Gestures (Left half of screen) | Swipe Gestures (Right half of screen) |

---

## 💎 Features & Customization

* **Web Audio Sound Effects:** Real-time synthesis of retro-arcade sound effects using the Web Audio API—no heavy audio asset downloads required. Features crisp sound effects for valid moves, merging high-value tiles, game over sweeps, and winner fanfares (with a quick global toggle in the header).
* **Fully Responsive Multi-Device Design:** Perfectly responsive down to mobile devices. On mobile screens, the app dynamically scales the split boards to fit the viewport perfectly (`min(44vw, 34vh)`) with custom swipe gestures tailored for dual touch layouts.
* **Modern Arcade Aesthetic:** Midnight black slate visuals accented by neon cyan and rose indicators, smooth motion fly-in tile animations, warning shake shakes for ticking Survivor clocks, and a dynamic HUD.

---

## 🛠️ Technology Stack

* **UI Library:** React 19 + TypeScript
* **Styling Framework:** Tailwind CSS v4 (native lightning build)
* **Animations:** Motion (Framer Motion)
* **Icons:** Lucide React
* **Sound Engine:** Custom-written low-latency Web Audio API synthesizer (`/src/audio.ts`)

---

## 🚀 Getting Started Locally

To run the project in development mode:

1. Clone the project or download the source code files.
2. Install the package dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

To create an optimized production build:
```bash
npm run build
```
And to preview the built app locally:
```bash
npm run preview
```

---

*Made with 🧡 by Idnafen • Competitive Arcade 2026*
