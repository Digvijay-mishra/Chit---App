#!/bin/bash
# Pre-Deployment Verification Script
# Run this before pushing to GitHub

echo "========================================="
echo "🔍 Pre-Deployment Verification"
echo "========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues
ISSUES=0

# Check 1: .gitignore exists
echo -n "Checking .gitignore exists... "
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check 2: .env files are in .gitignore
echo -n "Checking .env in .gitignore... "
if grep -q "^\.env$" .gitignore 2>/dev/null || grep -q "^\*\.env$" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "  WARNING: .env files may not be protected!"
    ISSUES=$((ISSUES + 1))
fi

# Check 3: .env.example files exist
echo -n "Checking backend/.env.example exists... "
if [ -f "backend/.env.example" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ISSUES=$((ISSUES + 1))
fi

echo -n "Checking frontend/.env.example exists... "
if [ -f "frontend/.env.example" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check 4: requirements.txt exists
echo -n "Checking backend/requirements.txt exists... "
if [ -f "backend/requirements.txt" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check 5: package.json exists
echo -n "Checking frontend/package.json exists... "
if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check 6: README.md exists
echo -n "Checking README.md exists... "
if [ -f "README.md" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} (optional but recommended)"
fi

# Check 7: Deployment config files exist
echo -n "Checking railway.json exists... "
if [ -f "railway.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} (optional but recommended)"
fi

echo -n "Checking vercel.json exists... "
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} (optional but recommended)"
fi

# Check 8: Look for potential secrets in tracked files
echo ""
echo "Checking for potential secrets in code..."

# Check for .env files that might be tracked
ENV_FILES=$(git ls-files | grep -E "\.env$|\.env\.")
if [ -n "$ENV_FILES" ]; then
    echo -e "${RED}✗ Found .env files in git tracking:${NC}"
    echo "$ENV_FILES"
    echo -e "  ${YELLOW}Run: git rm --cached <file>${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓ No .env files in git tracking${NC}"
fi

# Check for hardcoded MongoDB URLs
echo -n "Checking for hardcoded MongoDB URLs... "
MONGO_URLS=$(grep -r "mongodb+srv://" --include="*.py" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v ".env" | grep -v "node_modules" | grep -v ".example")
if [ -n "$MONGO_URLS" ]; then
    echo -e "${RED}✗${NC}"
    echo "  Found in:"
    echo "$MONGO_URLS" | cut -d: -f1 | sort -u
    echo -e "  ${YELLOW}Replace with environment variables!${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# Check 9: Git status
echo ""
echo "Git status check:"
if [ -d ".git" ]; then
    UNTRACKED=$(git status --short | grep "^??" | wc -l)
    MODIFIED=$(git status --short | grep "^ M\|^M " | wc -l)
    
    if [ $UNTRACKED -gt 0 ]; then
        echo -e "${YELLOW}⚠ $UNTRACKED untracked files${NC}"
    fi
    
    if [ $MODIFIED -gt 0 ]; then
        echo -e "${YELLOW}⚠ $MODIFIED modified files${NC}"
    fi
    
    if [ $UNTRACKED -eq 0 ] && [ $MODIFIED -eq 0 ]; then
        echo -e "${GREEN}✓ Working directory clean${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Git not initialized${NC}"
fi

# Summary
echo ""
echo "========================================="
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo "You're ready to push to GitHub!"
else
    echo -e "${RED}✗ Found $ISSUES issue(s)${NC}"
    echo "Please fix the issues above before pushing."
    exit 1
fi
echo "========================================="
