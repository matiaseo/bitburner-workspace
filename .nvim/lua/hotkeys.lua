-- Keymaps (Save, Explorer, Buffers)
vim.keymap.set("n", "<F5>", ":wq<CR>", { desc = "Save and Close File" })
vim.keymap.set("n", "<C-s>", ":w<CR>", { desc = "Quick Save File" })
vim.keymap.set("n", "<leader>e", ":Ex<CR>", { desc = "Open Native File Explorer" })
vim.keymap.set("n", "<leader>bn", ":bnext<CR>", { desc = "Switch to Next File Buffer" })
vim.keymap.set("n", "<leader>bp", ":bprev<CR>", { desc = "Switch to Previous File Buffer" })
vim.keymap.set("n", "<leader>bd", ":bdelete<CR>", { desc = "Close Current File" })

-- Instant GitHub Cloud Sync
vim.keymap.set("n", "<leader>g", function()
  vim.ui.input({ prompt = "Commit Message: " }, function(msg)
    if not msg or msg == "" then return end
    print("\nPushing scripts to GitHub...")
    vim.fn.system("git add .")
    vim.fn.system({ "git", "commit", "-m", msg })
    
    vim.uv.spawn("git", { args = { "push", "origin", "main" } }, function(code)
      vim.schedule(function()
        if code == 0 then print("GitHub sync successful!")
        else print("Git push failed. Check your internet connection.") end
      end)
    end)
  end)
end, { desc = "Git Add, Commit, and Push Workspace" })

