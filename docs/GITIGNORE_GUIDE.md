# 🔒 .gitignore Setup Guide

Your `.gitignore` file is configured to prevent sensitive files from being committed to Git.

---

## ✅ What's Being Ignored

### Environment Variables (CRITICAL)
```
.env                    ← Main env file (NEVER commit!)
.env.local              ← Local overrides
.env.*.local            ← Environment-specific files
.env.production.local   ← Production overrides
```

**These contain:**
- Google OAuth Client IDs
- API keys
- Passwords
- Credentials

### Dependencies
```
node_modules/          ← Installed packages (too large)
```

### Build Outputs
```
.expo/                 ← Expo cache
dist/                  ← Built files
build/                 ← Build artifacts
web-build/             ← Web build output
```

### IDE Files
```
.vscode/               ← VS Code settings
.idea/                 ← JetBrains IDE
*.swp, *.swo          ← Editor backups
```

### Secrets & Credentials
```
*.pem                  ← SSL certificates
*.key                  ← Private keys
*.p8, *.p12           ← Apple certificates
*.jks                  ← Java keystores
.aws/                  ← AWS credentials
.gcloud/               ← Google Cloud credentials
```

### Logs & Debug Files
```
npm-debug.*            ← NPM debug logs
yarn-debug.*           ← Yarn debug logs
yarn-error.*           ← Yarn error logs
```

### macOS
```
.DS_Store              ← macOS folder metadata
```

---

## 📋 Files You SHOULD Track

### ✅ Commit These
```
.env.example           ← Template for .env
package.json           ← Dependencies list
package-lock.json      ← Lock file (optional)
src/                   ← Source code
docs/                  ← Documentation
.gitignore             ← This file
README.md              ← Project readme
```

### Example `.env.example`
```bash
# Copy this file to .env and fill in your values

EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your_web_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your_android_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your_ios_client_id.apps.googleusercontent.com
```

---

## 🔐 Security Best Practices

### ✅ DO
```bash
# 1. Keep .env in .gitignore
# (Already done!)

# 2. Use .env.example for template
# Commit this, not .env

# 3. Add .env to .gitignore early
# Do this before committing any secrets

# 4. Use environment-specific files
.env.development.local
.env.production.local
.env.staging.local

# 5. Rotate credentials if accidentally committed
# If you commit secrets, they're compromised!
```

### ❌ DON'T
```bash
# Don't commit .env file
git add .env              ❌ NO!

# Don't hardcode secrets in code
const apiKey = "secret"   ❌ NO!

# Don't commit credentials
*.key
*.pem
*.p8

# Don't share .env files
email .env               ❌ NO!

# Don't push to public repos
git push --force origin main ❌ NO!
```

---

## Verification

### Check if .env is Being Tracked

```bash
# See what Git would commit
git status

# Should show .env as UNTRACKED or NOT STAGED
# Should NOT show it in "Changes to be committed"

# If .env is already committed (BAD):
git rm --cached .env       # Remove from tracking
git commit -m "Remove .env from tracking"
```

### Verify .gitignore Works

```bash
# Check if a file would be ignored
git check-ignore -v .env

# Should output:
# .gitignore:34: .env

# If it outputs nothing, the file is NOT ignored (BAD!)
```

---

## Setup Instructions

### 1. ✅ Already Configured
Your `.gitignore` is already set up correctly:
- `✅ .env` is ignored
- `✅ Sensitive files are ignored
- `✅ IDE files are ignored
- `✅ Build outputs are ignored

### 2. Create `.env` from Template
```bash
cp .env.example .env

# Edit .env and add your actual values
# This file is ignored by Git
```

### 3. Verify Setup
```bash
# See what's ignored
git check-ignore -v .env
# Should show: .gitignore:34: .env

# Check Git status
git status
# .env should NOT appear in the list
```

### 4. Commit Only .env.example
```bash
git add .env.example
git commit -m "Add .env.example template"

# Never commit .env!
```

---

## If You Accidentally Committed .env

### ⚠️ URGENT: Your credentials are compromised!

```bash
# 1. Remove from Git history (completely)
git rm --cached .env              # Remove from staging
git commit -m "Remove .env from Git"

# 2. Force push (if already pushed)
git push origin main              # Be careful with force push!

# 3. Rotate all credentials
# - Get new Google OAuth Client IDs
# - Update .env with new credentials
# - Update any API keys/passwords
# - Notify team members

# 4. Verify it's removed from history
git log --oneline -- .env         # Should be empty
```

---

## Team Best Practices

### For New Team Members

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   ```

2. **Create .env from template**
   ```bash
   cp .env.example .env
   ```

3. **Get credentials from team lead**
   ```bash
   # Ask for:
   # - Google OAuth Client IDs
   # - API credentials
   # - Backend URL
   ```

4. **Update .env**
   ```bash
   # Edit .env and add values
   # Don't commit it!
   ```

5. **Start developing**
   ```bash
   npm install
   npm start
   ```

### For Team Lead

1. **Create .env.example**
   ```bash
   # Include all required variables
   # Use placeholder values
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your_web_client_id.apps.googleusercontent.com
   ```

2. **Share credentials securely**
   ```bash
   # Use password manager
   # Email with encryption
   # 1Password / LastPass
   # Never in Slack/email without encryption!
   ```

3. **Verify team doesn't commit .env**
   ```bash
   # Check before merging PRs
   git diff main..feature-branch -- .env
   # Should return nothing
   ```

---

## Common Issues

### Issue: ".env appears in Git status"
**Solution:** Check if it's tracked
```bash
git ls-files | grep .env
# If .env appears, it's already tracked
# Remove it: git rm --cached .env
```

### Issue: "Changes to .env keep appearing in status"
**Solution:** It's not ignored properly
```bash
git check-ignore .env
# If nothing outputs, add to .gitignore
# Verify: git check-ignore -v .env
```

### Issue: ".env file got pushed to remote"
**Solution:** Remove from history
```bash
# See git history warning above
# Credentials are compromised!
# Rotate all credentials immediately!
```

### Issue: "Team member changed .env"
**Solution:** Use Git assume-unchanged
```bash
# Tell Git to ignore changes to .env
git update-index --skip-worktree .env

# Later, to track again:
git update-index --no-skip-worktree .env
```

---

## Current Setup

### ✅ Your .gitignore
```
# local env files
.env                    ✅ Main file ignored
.env.local              ✅ Local overrides ignored
.env.*.local            ✅ Environment files ignored
.env.production.local   ✅ Production file ignored
```

### ✅ What's Protected
- Google OAuth Client IDs
- API keys
- Database URLs
- Passwords
- Private keys
- Certificates

### ✅ Team Safe
- Each developer has their own .env
- Credentials never shared via Git
- .env.example shows structure
- No accidental commits possible

---

## Useful Commands

```bash
# Check if file is ignored
git check-ignore -v .env

# See what would be committed
git status

# See staged changes
git diff --cached

# See ignored files
git status --ignored

# Stop tracking a file (keep local)
git rm --cached .env

# Update .gitignore and apply
git rm -r --cached .
git add .
git commit -m "Apply gitignore"

# Check git history for a file
git log --oneline -- .env

# Verify no secrets in last commit
git show --stat HEAD -- .env
```

---

## Summary

✅ **Your Setup:**
- `.env` is ignored by Git
- `.env.example` shows required variables
- Team can clone and run locally
- No credentials in version control

✅ **Security:**
- Secrets safe locally
- No accidental commits
- Team can't see credentials
- Easy onboarding

✅ **Best Practice:**
- Share credentials securely (not via Git)
- Each developer has their own .env
- Template (`.env.example`) is tracked
- Actual values (`.env`) are not tracked

---

## Next Steps

1. ✅ .gitignore is configured
2. ✅ Verify with: `git check-ignore -v .env`
3. ✅ Create `.env` from `.env.example`
4. ✅ Add credentials
5. ✅ Never commit `.env`!

---

**Remember:** Never commit `.env` files with real credentials! 🔒

If you need help, see the examples above or check Git documentation: https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files
