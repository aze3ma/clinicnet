#!/bin/bash

# Fly.io Deployment Script for ClinicNet Backend
# This script automates the deployment process to Fly.io

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

print_header "🚀 Fly.io Deployment Script for ClinicNet"

print_info "This script will help you deploy your application to Fly.io's free tier."
echo ""

# Step 1: Check if flyctl is installed
print_header "Step 1: Checking Fly CLI Installation"

if ! command -v flyctl &> /dev/null; then
    print_error "Fly CLI (flyctl) is not installed."
    echo ""
    print_info "Install it now:"
    echo ""

    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "  ${GREEN}brew install flyctl${NC}"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "  ${GREEN}curl -L https://fly.io/install.sh | sh${NC}"
    else
        echo "  ${GREEN}Visit: https://fly.io/docs/hands-on/install-flyctl/${NC}"
    fi

    echo ""
    read -p "Install now? (y/n): " install_cli

    if [[ $install_cli == "y" || $install_cli == "Y" ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install flyctl
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -L https://fly.io/install.sh | sh
        else
            print_error "Please install manually from: https://fly.io/docs/hands-on/install-flyctl/"
            exit 1
        fi
        print_success "Fly CLI installed"
    else
        print_error "Fly CLI is required. Exiting."
        exit 1
    fi
else
    print_success "Fly CLI found: $(flyctl version)"
fi

# Step 2: Check authentication
print_header "Step 2: Checking Fly.io Authentication"

if ! flyctl auth whoami &> /dev/null; then
    print_warning "Not logged in to Fly.io"
    echo ""
    print_info "You need to sign up or log in."
    echo ""
    read -p "Do you have a Fly.io account? (y/n): " has_account

    if [[ $has_account == "y" || $has_account == "Y" ]]; then
        print_info "Opening login page..."
        flyctl auth login
    else
        print_info "Opening signup page..."
        flyctl auth signup
    fi

    print_success "Authentication complete"
else
    USER_EMAIL=$(flyctl auth whoami 2>&1 | grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' || echo "")
    print_success "Already logged in as: $USER_EMAIL"
fi

# Step 3: Check if app already exists
print_header "Step 3: Checking Existing App"

if [ -f fly.toml ]; then
    APP_NAME=$(grep "^app = " fly.toml | cut -d'"' -f2)
    print_info "Found existing fly.toml with app: $APP_NAME"

    read -p "Deploy to existing app? (y/n): " use_existing

    if [[ $use_existing != "y" && $use_existing != "Y" ]]; then
        print_warning "You chose not to use existing app."
        read -p "Enter new app name: " APP_NAME
        sed -i.bak "s/^app = .*/app = \"$APP_NAME\"/" fly.toml
        rm fly.toml.bak
        print_success "Updated fly.toml with new app name: $APP_NAME"
    fi
else
    print_warning "No fly.toml found. Starting launch wizard..."

    read -p "Press Enter to launch app (or Ctrl+C to exit)"

    flyctl launch --no-deploy

    print_success "App configuration created"
fi

# Step 4: Set up database
print_header "Step 4: Database Setup"

print_info "Checking for PostgreSQL database..."

if flyctl postgres list 2>&1 | grep -q "No postgres databases found"; then
    print_warning "No PostgreSQL database found."
    echo ""
    read -p "Create PostgreSQL database? (y/n): " create_db

    if [[ $create_db == "y" || $create_db == "Y" ]]; then
        print_info "Creating PostgreSQL database (Development - Free tier)..."
        flyctl postgres create --name "$APP_NAME-db" --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 1

        print_success "PostgreSQL database created"

        print_info "Attaching database to app..."
        flyctl postgres attach "$APP_NAME-db"
        print_success "Database attached"
    else
        print_warning "Skipping database creation. You'll need to set DATABASE_URL manually."
    fi
else
    print_success "PostgreSQL database already exists"
fi

# Step 5: Set up secrets
print_header "Step 5: Environment Variables & Secrets"

print_info "Setting up environment variables..."
echo ""

# Generate JWT secrets
print_info "Generating JWT secrets..."

JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

print_success "JWT secrets generated"

# Set all secrets
print_info "Setting secrets in Fly.io..."

flyctl secrets set \
  JWT_SECRET="$JWT_SECRET" \
  JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  JWT_EXPIRES_IN="7d" \
  JWT_REFRESH_EXPIRES_IN="30d" \
  CORS_ORIGIN="http://localhost:3000,http://localhost:5173" \
  LOG_LEVEL="info" \
  NODE_ENV="production" \
  --stage

print_success "Secrets configured"

# Optional: Twilio
echo ""
read -p "Do you want to add Twilio credentials for SMS/OTP? (y/n): " add_twilio

if [[ $add_twilio == "y" || $add_twilio == "Y" ]]; then
    read -p "Twilio Account SID: " TWILIO_SID
    read -p "Twilio Auth Token: " TWILIO_TOKEN
    read -p "Twilio Phone Number (e.g., +1234567890): " TWILIO_PHONE

    flyctl secrets set \
      TWILIO_ACCOUNT_SID="$TWILIO_SID" \
      TWILIO_AUTH_TOKEN="$TWILIO_TOKEN" \
      TWILIO_PHONE_NUMBER="$TWILIO_PHONE" \
      --stage

    print_success "Twilio credentials added"
fi

# Step 6: Deploy
print_header "Step 6: Deploy Application"

print_info "Ready to deploy your application!"
echo ""
print_warning "This will:"
echo "  1. Build your Docker image"
echo "  2. Push to Fly.io registry"
echo "  3. Run Prisma migrations"
echo "  4. Start your application"
echo ""
print_info "Estimated time: 3-5 minutes"
echo ""

read -p "Deploy now? (y/n): " deploy_now

if [[ $deploy_now == "y" || $deploy_now == "Y" ]]; then
    print_info "Deploying to Fly.io..."

    flyctl deploy

    print_success "Deployment complete!"
else
    print_warning "Skipping deployment. You can deploy later with: flyctl deploy"
fi

# Step 7: Summary
print_header "🎉 Setup Complete!"

echo "Your app is configured and ready!"
echo ""
echo "  ${GREEN}App Name:${NC} $APP_NAME"
echo "  ${GREEN}URL:${NC} https://$APP_NAME.fly.dev"
echo "  ${GREEN}API Base:${NC} https://$APP_NAME.fly.dev/api/v1"
echo "  ${GREEN}Health Check:${NC} https://$APP_NAME.fly.dev/api/v1/health"
echo ""

print_info "Next steps:"
echo ""
echo "  1. Test your deployment:"
echo "     ${BLUE}curl https://$APP_NAME.fly.dev/api/v1/health${NC}"
echo ""
echo "  2. View logs:"
echo "     ${BLUE}flyctl logs${NC}"
echo ""
echo "  3. Check status:"
echo "     ${BLUE}flyctl status${NC}"
echo ""
echo "  4. Update frontend API URL:"
echo "     ${BLUE}VITE_API_URL=https://$APP_NAME.fly.dev/api/v1${NC}"
echo ""
echo "  5. Deploy updates:"
echo "     ${BLUE}flyctl deploy${NC}"
echo ""

print_info "For detailed guide, see: ${GREEN}FLY_DEPLOY.md${NC}"
print_info "For troubleshooting: ${GREEN}flyctl logs${NC}"

echo ""
print_success "Happy deploying! 🚀"
echo ""
