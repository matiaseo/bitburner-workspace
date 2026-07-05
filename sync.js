const port = 12525
const sources = 'src/'

const activeSockets = new Set()
const startSync = socket => activeSockets.add(socket)
const stopSync = socket => activeSockets.delete(socket)

console.log(new Date().toISOString(), 'Starting sync server')
Deno.serve({port}, request => {
  const { socket, response } = Deno.upgradeWebSocket(request)
  socket.addEventListener('open', () => console.log('new ws connection') || startSync(socket))
  socket.addEventListener('message', event => console.log('got message', event.data))
  socket.addEventListener('close', () => stopSync(socket))
  return response
})

async function pushFile(filePath) {
  try {
    const content = await Deno.readTextFile(filePath);
    // Convert system path to Bitburner in-game path
    const relativePath = 'scripts/' + filePath.split(sources).slice(-1);

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

console.log('sending', payload)

    for (const ws of activeSockets)
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
        console.log(new Date().toISOString(), `[Synced] ${relativePath}`);
      }
  } catch (err) {
    console.error(`Failed to read file ${filePath}:`, err);
  }
}


// Watch the directory natively
console.log(`Watching for changes...`);
const watcher = Deno.watchFs(sources);
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

