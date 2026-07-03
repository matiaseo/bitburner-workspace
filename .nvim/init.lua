-- Set Spacebar as the main Leader key (Must be first!)
vim.g.mapleader = " "

-- Get the absolute location of your global Neovim config (~/.config/nvim)
local global_config_dir = vim.fn.stdpath("config")

-- ====================================================================
-- GLOBAL PACKAGE ROUTING (Fixed for Home Directory Deployment)
-- ====================================================================
-- Tell Neovim to find your modules and downloaded plugins globally
vim.opt.packpath:prepend(global_config_dir)
package.path = package.path .. ";" .. global_config_dir .. "/lua/?.lua"

-- Prevent pollution of your active working repository directories
vim.opt.undodir = vim.fn.stdpath("cache") .. "/undo"
vim.opt.swapfile = false

-- 1. Native Asynchronous Package Downloader (Fixed global pathing)
local lspconfig_path = global_config_dir .. "/pack/plugins/start/nvim-lspconfig"
local verification_file = lspconfig_path .. "/README.md"

if vim.fn.empty(vim.fn.glob(verification_file)) > 0 then
  local full_url = "https://github.com"
  vim.uv.spawn("git", {
    args = { "clone", "--depth=1", full_url, lspconfig_path }
  }, function(code)
    if code == 0 then
      vim.schedule(function() print("Successfully downloaded nvim-lspconfig natively!") end)
    end
  end)
end

-- 2. Load Core Structural Modules
require("ui")
require("hotkeys")
require("lsp")

-- 3. Standard Project-Local Configuration (exrc Engine)
vim.o.exrc = true

