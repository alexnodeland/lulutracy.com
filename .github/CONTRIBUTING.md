# Contributing

This project is managed through **Claude Code** and the **GitHub mobile app**.

---

## 🖼️ Adding a Painting

Use the `/add-painting` command in Claude Code:

```
/add-painting Sunset Over Mountains
```

Or ask Claude directly:

> "Add a new painting called Sunset Over Mountains"

Claude will guide you through adding the image and metadata.

---

## ✏️ Editing Content

| What            | Where                | How                                         |
| --------------- | -------------------- | ------------------------------------------- |
| 🖼️ Paintings    | `content/paintings/` | `/gatsby-content` skill                     |
| 👤 About page   | `content/about/`     | Edit the language file (en.md, zh.md, etc.) |
| 🌐 Translations | `locales/`           | Edit JSON files per language                |

Just describe what you want to change and Claude will help.

---

## 🤖 Claude Code Skills

These skills are available to help with common tasks:

| Command           | What it does                           |
| ----------------- | -------------------------------------- |
| `/add-painting`   | Add a new painting to the gallery      |
| `/validate`       | Check that everything is working       |
| `/commit`         | Create a commit with proper formatting |
| `/gatsby-content` | Help with any content changes          |

---

## 📱 Using GitHub Mobile

After Claude makes changes and pushes a branch:

1. **Open GitHub app** → Navigate to this repository
2. **Pull Requests** → Find the new PR
3. **Review** → Check the changes look correct
4. **Merge** → Tap "Squash and merge"

The site automatically deploys after merging to main.

---

## ✅ Quality Checks

Every change runs through automated checks:

- **TypeScript** — No type errors
- **Tests** — All tests pass (90% coverage)
- **Lighthouse** — Performance scores stay high

You'll see ✅ or ❌ on each pull request. Only merge when everything passes.

---

## 💡 Tips

- **Be specific** — Tell Claude exactly what you want changed
- **Review changes** — Always check the diff before merging
- **One thing at a time** — Smaller changes are easier to review
- **Ask questions** — Claude can explain any part of the codebase
