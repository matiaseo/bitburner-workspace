// sync.js
import { join } from "https://deno.land";

const PORT = 12525;
const TARGET_DIR = "./src"; // Your local script folder
const WS_URL = `ws://localhost:${PORT}/`;

console.log(`Connecting to Bitburner on ${WS_URL}...`);
let ws;

function connect() {
  ws = new WebSocket(WS_URL);
  
  ws.onopen = () => console.log("Connected to Steam client successfully!");
  ws.onerror = (e) => console.error("WebSocket error:", e);
  ws.onclose = () => {
    console.log("Connection lost. Retrying in 3 seconds...");
    setTimeout(connect, 3000);
  };
}

async function pushFile(filePath) {
  try {
    const content = await Deno.readTextFile(filePath);
    // Convert system path to Bitburner in-game path
    const relativePath = filePath.replace(TARGET_DIR, "");
    
    const payload = {
      jsonrpc: "2.0",
      method: "pushFile",
      params: {
        filename: relativePath,
        content: content,
        server: "home"
      },
      id: Date.now()
    };

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
      console.log(`[Synced] ${relativePath}`);
    }
  } catch (err) {
    console.error(`Failed to read file ${filePath}:`, err);
  }
}

// Start connection
connect();

// Watch the directory natively
console.log(`Watching ${TARGET_DIR} for changes...`);
const watcher = Deno.watchFs(TARGET_DIR);
for await (const event of watcher) {
  if (event.kind === "modify" || event.kind === "create") {
    for (const path of event.paths) {
      // Ignore hidden files or swap files from editors
      if (!path.endsWith("~") && !path.includes(".git")) {
        await pushFile(path);
      }
    }
  }
}

