# Image Manager — Word Add-in
# Justfile for PowerShell (Windows)

set shell := ["powershell.exe", "-NoProfile", "-Command"]

node_path := "C:\\Program Files\\nodejs"

# Install npm dependencies
install:
    $env:PATH = "{{node_path}};$env:PATH"; npm install

# Generate HTTPS dev certificates (for local dev testing in Word)
certs:
    $env:PATH = "{{node_path}};$env:PATH"; npx office-addin-dev-certs install

# Start Vite dev server (HTTP — for browser testing)
dev:
    $env:PATH = "{{node_path}};$env:PATH"; npx vite --host

# Start Vite dev server with HTTPS (for testing inside Word locally)
dev-https:
    $env:PATH = "{{node_path}};$env:PATH"; npx vite --host --https

# Production build to dist/
build:
    $env:PATH = "{{node_path}};$env:PATH"; npx vite build

# Build and deploy to GitHub Pages
deploy: build
    Push-Location dist; \
    if (-not (Test-Path ".git")) { \
        git init; \
        git checkout -b gh-pages; \
        git remote add origin (git -C .. remote get-url origin 2>$null) \
    }; \
    git add -A; \
    git commit -m "Deploy add-in"; \
    git push -u origin gh-pages --force; \
    Pop-Location; \
    Write-Host "Deployed to GitHub Pages" -ForegroundColor Green

# Copy manifest to the Office sideload folder (Windows)
sideload:
    $manifestDir = "$env:USERPROFILE\Documents\OfficeAddins"; \
    if (-not (Test-Path $manifestDir)) { New-Item -ItemType Directory -Path $manifestDir -Force }; \
    Copy-Item -Path "manifest.xml" -Destination $manifestDir -Force; \
    Write-Host "Manifest copied to $manifestDir" -ForegroundColor Green; \
    Write-Host "In Word: File > Options > Trust Center > Trusted Add-in Catalogs" -ForegroundColor Yellow; \
    Write-Host "Add catalog URL: $manifestDir" -ForegroundColor Yellow

# Copy manifest to Mac sideload location
sideload-mac:
    $wefDir = "$env:HOME/Library/Containers/com.microsoft.Word/Data/Documents/wef"; \
    if (-not (Test-Path $wefDir)) { New-Item -ItemType Directory -Path $wefDir -Force }; \
    Copy-Item -Path "manifest.xml" -Destination $wefDir -Force; \
    Write-Host "Manifest copied to $wefDir — restart Word" -ForegroundColor Green

# First-time setup: install deps, build, copy manifest
setup: install build sideload

# Clean build artifacts
clean:
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }; \
    Write-Host "Cleaned dist/" -ForegroundColor Green

# Clean everything including node_modules
clean-all: clean
    if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }; \
    if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }; \
    Write-Host "Cleaned node_modules/ and package-lock.json" -ForegroundColor Green

# Rebuild from scratch
rebuild: clean build

# Show all available commands
help:
    Write-Host "Available commands:" -ForegroundColor Cyan; \
    Write-Host "" ; \
    Write-Host "  Production:" -ForegroundColor Yellow; \
    Write-Host "    just setup        — First-time: install, build, sideload manifest" -ForegroundColor White; \
    Write-Host "    just build        — Production build to dist/" -ForegroundColor White; \
    Write-Host "    just deploy       — Build + push to GitHub Pages" -ForegroundColor White; \
    Write-Host "    just sideload     — Copy manifest to Word sideload folder (Windows)" -ForegroundColor White; \
    Write-Host "    just sideload-mac — Copy manifest to Word sideload folder (Mac)" -ForegroundColor White; \
    Write-Host "" ; \
    Write-Host "  Development:" -ForegroundColor Yellow; \
    Write-Host "    just install      — Install npm dependencies" -ForegroundColor White; \
    Write-Host "    just dev          — Start HTTP dev server (browser testing)" -ForegroundColor White; \
    Write-Host "    just dev-https    — Start HTTPS dev server (Word testing)" -ForegroundColor White; \
    Write-Host "    just certs        — Generate HTTPS dev certificates" -ForegroundColor White; \
    Write-Host "" ; \
    Write-Host "  Maintenance:" -ForegroundColor Yellow; \
    Write-Host "    just clean        — Remove dist/" -ForegroundColor White; \
    Write-Host "    just clean-all    — Remove dist/ + node_modules/" -ForegroundColor White; \
    Write-Host "    just rebuild      — Clean + build" -ForegroundColor White
