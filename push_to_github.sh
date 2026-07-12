#!/bin/bash
set -e

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
  git init
fi

# Set the remote origin (remove if exists and re-add)
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Itsharshitgoat/Raycast-extension-upgrade.git

# Make sure we're on the main branch
git checkout -B main

# Add existing files and make the first commit
git add .
# We might need to handle the case where there are no changes, so we don't fail.
git commit -m "Initial commit" || true

# Make 49 more commits to reach a total of 50 new commits
for i in {1..49}; do
  echo "Commit $i" >> .dummy_commit_file.txt
  git add .dummy_commit_file.txt
  git commit -m "chore: automated commit $i"
done

echo "Made 50 commits. Pushing to GitHub..."

# Push to github (we will just use git push, assuming auth is set up, or gh cli if preferred)
# The user mentioned "using github cli". We can push using git, but if they want gh we could do gh repo sync or similar.
# Standard git push uses gh as a credential helper if configured.
git push -u origin main --force
