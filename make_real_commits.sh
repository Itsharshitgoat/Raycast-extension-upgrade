#!/bin/bash
set -e

echo "Renaming nested .git directories to .git_bak to prevent submodule issues..."
while IFS= read -r git_dir; do
  if [ -n "$git_dir" ]; then
    parent_dir=$(dirname "$git_dir")
    mv "$git_dir" "$parent_dir/.git_bak"
  fi
done < <(find . -mindepth 2 -name ".git" -type d)

echo "Initializing git repo..."
git init
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Itsharshitgoat/Raycast-extension-upgrade.git
git checkout -B main

count=$(git rev-list --count HEAD 2>/dev/null || echo 0)

echo "Making 50 individual commits with real files..."
while IFS= read -r file; do
  if [ "$count" -ge 50 ]; then
    break
  fi
  
  if [ -n "$file" ]; then
    git add -f "$file" || continue
    filename=$(basename "$file")
    # only commit if there are changes
    if ! git diff --cached --quiet; then
        git commit -m "Add $filename" || continue
        count=$((count+1))
    fi
  fi
done < <(find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.git_bak/*" -not -path "*/.next/*" -not -name ".*" | head -n 100)

echo "Adding any remaining files..."
git add -f . || true
if ! git diff --cached --quiet; then
    git commit -m "Add remaining files for extensions" || true
fi

echo "Pushing to GitHub..."
git push -u origin main --force || true

echo "Restoring nested .git directories..."
while IFS= read -r git_bak_dir; do
  if [ -n "$git_bak_dir" ]; then
    parent_dir=$(dirname "$git_bak_dir")
    mv "$git_bak_dir" "$parent_dir/.git"
  fi
done < <(find . -mindepth 2 -name ".git_bak" -type d)

echo "Done!"
