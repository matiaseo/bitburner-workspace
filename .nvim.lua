-- .nvim.lua
-- Pure workspace root binding for Bitburner (Neovim 0.12+ Root Fix)

local has_lspconfig, lspconfig = pcall(require, "lspconfig.configs.denols")
local base_config = has_lspconfig and lspconfig or {
  default_config = {
    cmd = { "deno", "lsp" },
    filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact" }
  }
}

vim.lsp.config("denols", {
  cmd = base_config.default_config.cmd,
  filetypes = base_config.default_config.filetypes,

  -- Clear all internal settings arrays. Deno will parse its configs natively from deno.json
  settings = {},

  -- Strict anchor targets. Ensures the server binds ONLY to this project root path folder
  root_markers = { "sync.js", "NetscriptDefinitions.d.ts", "deno.json" },
})

-- Start the language server cleanly
vim.lsp.enable("denols")

