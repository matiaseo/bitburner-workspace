-- NATIVE AUTOCOMPLETE ENGINE (Omnifunc Automation)
vim.api.nvim_create_autocmd("LspAttach", {
  callback = function(args)
    local bufnr = args.buf
    vim.bo[bufnr].omnifunc = "v:lua.vim.lsp.omnifunc"

    vim.api.nvim_create_autocmd("InsertCharPre", {
      buffer = bufnr,
      callback = function()
        if vim.fn.pumvisible() == 0 and vim.v.char:match("[%w%.]") then
          vim.schedule(function()
            vim.api.nvim_feedkeys(vim.api.nvim_replace_termcodes("<C-x><C-o>", true, true, true), "n", true)
          end)
        end
      end,
    })
  end,
})
vim.opt.completeopt = { "menuone", "noselect", "noinsert" }

