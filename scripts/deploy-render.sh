#!/bin/bash

# Render Deployment Script for ClinicNet Backend
# This script automates the deployment process to Render

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_header "🚀 Render Deployment Script for ClinicNet"

print_info "This script will help you deploy your application to Render."
echo ""

# Step 1: Check Git Status
print_header "Step 1: Checking Git Status"

if [ ! -d .git ]; then
    print_warning "Not a git repository. Initializing..."
    git init
    print_success "Git repository initialized"
fi

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n): " commit_changes

    if [[ $commit_changes == "y" || $commit_changes == "Y" ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        print_success "Changes committed"
    else
        print_warning "Proceeding with uncommitted changes..."
    fi
fi

# Step 2: Check Remote Repository
print_header "Step 2: Checking GitHub Remote"

if ! git remote get-url origin &> /dev/null; then
    print_warning "No GitHub remote found."
    echo ""
    print_info "You need to create a GitHub repository and connect it."
    print_info "Steps:"
    print_info "  1. Go to https://github.com/new"
    print_info "  2. Create a new repository (e.g., 'clinicnet-backend')"
    print_info "  3. Copy the repository URL"
    echo ""
    read -p "Enter your GitHub repository URL: " repo_url

    if [[ -z "$repo_url" ]]; then
        print_error "Repository URL is required"
        exit 1
    fi

    git remote add origin "$repo_url"
    print_success "Remote added: $repo_url"
else
    print_success "GitHub remote found: $(git remote get-url origin)"
fi

# Step 3: Push to GitHub
print_header "Step 3: Pushing to GitHub"

current_branch=$(git rev-parse --abbrev-ref HEAD)
print_info "Current branch: $current_branch"

read -p "Push to GitHub? (y/n): " push_confirm

if [[ $push_confirm == "y" || $push_confirm == "Y" ]]; then
    print_info "Pushing to GitHub..."
    git push -u origin "$current_branch"
    print_success "Code pushed to GitHub"
else
    print_warning "Skipping GitHub push. You'll need to push manually before deploying to Render."
fi

# Step 4: Render Deployment Instructions
print_header "Step 4: Deploy to Render"

print_info "Your code is ready for deployment!"
echo ""
print_info "Choose your deployment method:"
echo ""
echo "  ${GREEN}Option A: One-Click Deploy (Recommended)${NC}"
echo "    1. Go to https://render.com and sign up/login with GitHub"
echo "    2. Click 'New +' → 'Blueprint'"
echo "    3. Connect your GitHub repository"
echo "    4. Render will detect render.yaml and set up everything"
echo "    5. Click 'Apply' to deploy"
echo ""
echo "  ${YELLOW}Option B: Manual Setup${NC}"
echo "    1. Follow the step-by-step guide in RENDER_DEPLOY.md"
echo "    2. Create PostgreSQL database first"
echo "    3. Then create web service"
echo ""

read -p "Open Render dashboard in browser? (y/n): " open_browser

if [[ $open_browser == "y" || $open_browser == "Y" ]]; then
    print_info "Opening Render dashboard..."

    # Detect OS and open browser
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "https://render.com/select-repo?type=blueprint"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "https://render.com/select-repo?type=blueprint" &> /dev/null || print_warning "Could not open browser automatically"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        start "https://render.com/select-repo?type=blueprint"
    else
        print_info "Please manually open: https://render.com/select-repo?type=blueprint"
    fi
fi

# Step 5: Environment Variables Reminder
print_header "Step 5: Environment Variables (Important!)"

print_warning "Don't forget to add these environment variables in Render:"
echo ""
echo "  ${GREEN}Required (auto-configured via render.yaml):${NC}"
echo "    ✓ NODE_ENV=production"
echo "    ✓ PORT=4000"
echo "    ✓ DATABASE_URL (from PostgreSQL service)"
echo "    ✓ JWT_SECRET (auto-generated)"
echo "    ✓ JWT_REFRESH_SECRET (auto-generated)"
echo ""
echo "  ${YELLOW}Optional (add manually if needed):${NC}"
echo "    • TWILIO_ACCOUNT_SID"
echo "    • TWILIO_AUTH_TOKEN"
echo "    • TWILIO_PHONE_NUMBER"
echo "    • CORS_ORIGIN (update with your frontend URL)"
echo ""

print_info "You can find pre-generated secure values in .env.production.example"

# Step 6: Next Steps
print_header "🎉 Deployment Preparation Complete!"

echo "Next steps:"
echo ""
echo "  1. Complete deployment in Render dashboard"
echo "  2. Wait for build to complete (3-5 minutes)"
echo "  3. Test your endpoints:"
echo "     ${BLUE}curl https://your-app.onrender.com/api/v1/health${NC}"
echo ""
echo "  4. Add Twilio credentials (if using SMS/OTP)"
echo "  5. Update CORS_ORIGIN when you deploy frontend"
echo ""

print_info "For detailed instructions, see: ${GREEN}RENDER_DEPLOY.md${NC}"
print_info "For troubleshooting, check Render logs in the dashboard"

echo ""
print_success "Happy deploying! 🚀"
echo ""
