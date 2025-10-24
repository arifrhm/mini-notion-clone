# GitLab Repository Setup Instructions

## Step 1: Create Private Repository on GitLab

1. Go to [GitLab](https://gitlab.com)
2. Click on **New Project**
3. Select **Create blank project**
4. Fill in the details:
   - **Project name**: `mini-notion-clone`
   - **Visibility Level**: Select **Private**
   - **Initialize repository with a README**: Uncheck this (we already have code)
5. Click **Create project**

## Step 2: Add GitLab Remote

In your local repository, add the GitLab remote:

```bash
cd /Users/arifrahman/Documents/mini-notion-clone
git remote add origin git@gitlab.com:YOUR_USERNAME/mini-notion-clone.git
```

Or if using HTTPS:

```bash
git remote add origin https://gitlab.com/YOUR_USERNAME/mini-notion-clone.git
```

## Step 3: Push Code to GitLab

```bash
git push -u origin main
```

## Step 4: Invite abdul110 as Maintainer

1. In your GitLab project, go to **Settings** → **Members**
2. In the **Invite members** section:
   - Enter username: `abdul110`
   - Select role: **Maintainer**
   - Click **Invite**
3. The user `abdul110` will receive an invitation and have maintainer access

## Alternative: Using GitLab CLI

If you have the GitLab CLI installed, you can also invite the user via command line after pushing:

```bash
# Create the project (if needed)
# Then invite the user
# Note: This requires GitLab API access token
```

## Verify Repository Structure

Your repository should have this structure:

```
mini-notion-clone/
├── .gitignore
├── README.md
├── GITLAB_SETUP.md
├── backend/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── ...
└── frontend/
    ├── src/
    ├── package.json
    └── ...
```

## Important Notes

- ✅ Repository is **Private** as required
- ✅ Backend code is in `/backend` folder
- ✅ Frontend code is in `/frontend` folder
- ✅ Comprehensive README.md is included
- ✅ All sensitive files (.env) are in .gitignore
- ✅ abdul110 will be added as Maintainer

## Next Steps After Push

1. Verify all files are pushed correctly
2. Check that .env files are NOT in the repository (they should be ignored)
3. Confirm abdul110 has been invited as maintainer
4. Test the setup instructions in README.md
