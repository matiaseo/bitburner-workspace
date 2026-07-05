## BitBurner game scripts

Running sync:
```
deno run --allow-read sync.js
```

## ⌨️ Neovim Workspace Hotkeys

All custom development shortcuts are mapped to work exclusively in **Normal Mode**. The custom prefix key `<leader>` is bound to the **Spacebar**.

### 💾 File Management & Navigation

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `F5` | Save & Close | Executes `:wq` to quickly exit a script. |
| `Ctrl + s` | Quick Save | Saves file immediately to trigger the background Deno sync script. |
| `Space + e` | File Explorer | Opens Neovim's native directory navigation grid (`:Ex`). |
| `Space + bn` | Next File | Flips forward to the next open script file buffer. |
| `Space + bp` | Previous File | Flips backward to the previous open script file buffer. |
| `Space + bd` | Close File | Closes the active file buffer safely. |

### 🛠️ LSP Diagnostics & Error Handling

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `Space + d` | View Line Error | Opens a floating window showing the exact Deno compilation error under the cursor. |
| `[d` | Previous Error | Jumps cursor backward to the previous syntax error in the file. |
| `]d` | Next Error | Jumps cursor forward to the next syntax error in the file. |

### ☁️ Automated Cloud Synchronization

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `Space + g` | GitHub Push | Prompts for a commit message and asynchronously pushes your entire codebase to GitHub. |

### 💡 Autocomplete Pop-up Navigation
* **Trigger Menu:** Type `ns.` inside a main function to auto-open the game API suggestion panel.
* **Scroll Down:** Press `Ctrl + n` to navigate downward through the completion list.
* **Scroll Up:** Press `Ctrl + p` to navigate upward through the completion list.
* **Confirm Selection:** Press `Enter` or `Ctrl + y` to commit the selected game function to your code.

