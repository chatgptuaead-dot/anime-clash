# Anime Clash

A pixel-art 1v1 fighting game with 10 anime fighters, each with 5 moves. It runs in the browser from a single file with no build step and no dependencies.

**Play online: https://chatgptuaead-dot.github.io/anime-clash/**

You can also open `index.html` in a browser. Either way, click the game once so it receives key presses.

## Modes

- **1 – VS CPU:** you pick your fighter, then pick the CPU's.
- **2 – 2 Players:** two players share one keyboard.
- **3 – Online:** play against someone on another laptop or iPad. Host a room and share its 4-letter code, or join an open room from the lobby.

Matches are best of 3 rounds with a 99-second timer.

## Controls

| | Player 1 | Player 2 |
|---|---|---|
| Move / jump | `W A S D` | Arrow keys |
| Signature | `1` | `6` (or Numpad 1) |
| Special | `2` | `7` (or Numpad 2) |
| Super | `3` | `8` (or Numpad 3) |
| Light | `4` | `9` (or Numpad 4) |
| Heavy | `5` | `0` (or Numpad 5) |
| Lock in fighter | `1`, `Enter` or `Space` | `6` or `Numpad 1` |

- **Block:** hold the direction away from your opponent.
- **Combos:** a light or heavy hit can be cancelled into a special.
- **Supers:** need a full power bar. It fills when you hit or get hit.
- `P` pauses and shows both move lists, `M` mutes and `Esc` goes back.

### iPad and touch screens

On a touch screen the game shows on-screen controls: a stick on the left to move (push up to jump) and five numbered attack buttons on the right, matching the keyboard numbers. Tap **VS CPU** or **2 PLAYERS** on the title screen, and button **1** to lock in a fighter. **II** pauses or goes back. In 2-player mode each player gets their own stick and buttons.

## Online multiplayer

Online play needs the small server in `server.js`, which hosts rooms and passes each player's inputs to the other. Both devices run the same fight in step, so only key presses travel over the network. The game measures the lag between the two players and adds a matching input delay, so the fight stays smooth.

- **Host:** choose **Online**, then **Create room**. Leave "List it in the lobby" ticked to make the room public, or untick it for a code-only room.
- **Join:** type the 4-letter code and press **Join**, or press **Join** next to a room in the lobby.
- Each player picks a fighter with their own controls and locks in. The fight starts when both have locked in.
- After a match, both players press **1** to rematch. **Esc** sends both back to character select.
- During an online fight there is no pause. Press **Esc** then **Q** to leave.

### Deploying the server on Render

1. In Render, choose **New → Blueprint** and connect this repository. Render reads `render.yaml` and creates a free web service named `anime-clash`.
2. When it finishes, open the service URL (for example `https://anime-clash.onrender.com`). That page is the full game with online play built in.
3. The GitHub Pages copy connects to `wss://anime-clash-nslt.onrender.com`. If you move the server, change `DEFAULT_SERVER` near the top of the online section in `index.html`, or open the Pages link with `?server=wss://your-service.onrender.com`.

Pick the Render region closest to your players. Every input travels from one player to the server and on to the other, so a far-away server adds input delay. The game measures that lag in the room and sets the input delay to match, and the character select screen shows it as **LAG**.

On Render's free plan the server sleeps after about 15 minutes without visitors. The first player to connect after that waits up to a minute while it wakes up, and the online menu says so.

### Running it locally

```bash
npm install
npm start
```

Then open `http://localhost:3000` in two browser windows.

## Fighters

| Fighter | Series | Signature | Super |
|---|---|---|---|
| Goku | Dragon Ball | Instant Transmission | Kamehameha |
| Vegeta | Dragon Ball | Galick Gun | Final Flash |
| Luffy | One Piece | Gum-Gum Gatling | Red Hawk |
| Zoro | One Piece | Oni Giri | Asura Nine Sword Flash |
| Naruto | Naruto | Rasengan | Rasenshuriken |
| Sasuke | Naruto | Chidori | Kirin |
| Pikachu | Pokémon | Thunder | Volt Tackle |
| Charizard | Pokémon | Fire Punch | Blast Burn |
| Ichigo | Bleach | Flash Step | Bankai Getsuga |
| Saitama | One Punch Man | Serious Leap | Serious Punch |

This is a non-commercial fan project. All characters belong to their respective creators and rights holders.
