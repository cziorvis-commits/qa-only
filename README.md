# qa-only

A Claude Code mod. Start a prompt with `question`, `Q` or `q` (e.g. `Q how does claude work`) and Claude answers in chat only: no plans, no file edits. A `?` pill at the right of the row above the prompt turns green on those turns and grey otherwise.

- `/qa-only on` / `/qa-only off` / `/qa-only` (toggle). Off hides the pill. The choice is remembered.

## Install

In a terminal Claude Code session:

```
/plugin install qa-only --marketplace cziorvis-commits/qa-only
```

Answer `y` to add the marketplace, then pick the user scope. It then loads in every session, including the desktop app's Code tab.
