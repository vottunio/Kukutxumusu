# GitHub Issues Auto-Generator

This script automatically creates GitHub Issues from the technical roadmap for the Kukuxumusu NFT project.

## 📋 What It Does

- Creates **30+ organized Issues** from `technical_en.md`
- Organizes issues by **Day** (Day 1-5)
- Adds appropriate **labels** (frontend, backend, relayer, smart-contracts, etc.)
- Creates **milestones** for each day
- Includes detailed checklists for each task

## 🚀 Quick Start

### 1. Prerequisites

Make sure GitHub CLI is installed and authenticated:

```bash
# Check if installed
gh --version

# If not installed, install it:
# Windows:
winget install GitHub.cli

# Authenticate
gh auth login
```

### 2. Configure the Script

Open `create-github-issues.js` and update:

```javascript
const REPO = 'YOUR_GITHUB_USERNAME/kukutxumusu'; // ⚠️ CHANGE THIS!
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

### 3. Test Run (Dry Run)

First, run in dry-run mode to see what will be created:

```bash
node create-github-issues.js
```

This will show you all issues without actually creating them.

### 4. Create Issues

When ready, set `DRY_RUN = false` in the script and run:

```bash
node create-github-issues.js
```

This will create all issues in your GitHub repository!

## 📊 What Gets Created

### Milestones (5)
- Day 1: Foundation
- Day 2: Core Functionality
- Day 3: Admin Dashboard
- Day 4: Explore & Gallery
- Day 5: Testing & Deployment

### Labels
- `day-1`, `day-2`, `day-3`, `day-4`, `day-5`
- `frontend`
- `backend`
- `relayer`
- `smart-contracts`
- `blockchain`
- `testing`
- `deployment`
- `infrastructure`
- And more...

### Issues (30+)
Each issue includes:
- Clear title with day prefix
- Detailed description
- Complete checklist of subtasks
- Appropriate labels
- Assigned milestone

## 🔧 Customization

You can edit the `issues` array in `create-github-issues.js` to:
- Add more issues
- Modify existing ones
- Change labels
- Update descriptions

## 📝 Example Issue Structure

```javascript
{
  title: '[Day 1] Setup Payment Smart Contract on Base',
  body: `## Task
Create payment smart contract with multi-token support

## Checklist
- [ ] Create payment contract
- [ ] Implement payment function
- [ ] Add unit tests`,
  labels: ['day-1', 'smart-contracts', 'base'],
  milestone: 'Day 1: Foundation'
}
```

## 🎯 Next Steps

After creating issues:

1. **Create a GitHub Project Board**:
   - Go to your repo → Projects → New Project
   - Choose "Board" template
   - Link issues to the project

2. **Assign team members** to issues

3. **Start working!** Check off items as you complete them

4. **Track progress** in the Project board

## 💡 Tips

- Use `gh issue list` to see all created issues
- Use GitHub Projects to visualize progress
- Close issues with commit messages: `fixes #123` or `closes #123`
- Use labels to filter issues: `gh issue list --label "day-1"`

## 🐛 Troubleshooting

**Error: "Resource not accessible by integration"**
- Make sure you're authenticated: `gh auth status`
- Re-authenticate if needed: `gh auth login`

**Error: "Milestone not found"**
- The script creates milestones automatically
- If it fails, create them manually in GitHub first

**Error: "Repository not found"**
- Double-check the REPO variable format: `username/repo-name`
- Make sure you have access to the repository

## 📚 Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub Issues Guide](https://docs.github.com/en/issues)
- [GitHub Projects Guide](https://docs.github.com/en/issues/planning-and-tracking-with-projects)

---

Happy coding! 🚀