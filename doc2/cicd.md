# 🚀 Trinity Inventory - CI/CD Pipeline (GitHub Actions)

## 📋 Overview

Dokumentasi lengkap CI/CD Pipeline menggunakan GitHub Actions untuk automated testing, building, dan deployment Trinity Asset Management System. Pipeline ini mencakup CI untuk frontend dan backend, serta automated deployment ke production.

---

## 🎯 Pipeline Features

- ✅ **Automated Testing** - Unit tests untuk frontend (Vitest) dan backend (Jest)
- ✅ **Code Quality** - ESLint, TypeScript type checking
- ✅ **Docker Build & Push** - Multi-stage builds ke GitHub Container Registry
- ✅ **Multi-Environment** - CI on all PRs, deploy on main branch
- ✅ **Artifact Upload** - Build artifacts tersimpan 7 hari
- ✅ **Concurrency Control** - Cancel in-progress runs untuk branch yang sama

---

## 📁 Workflow Files

```
.github/workflows/
├── ci.yml                    # CI Pipeline - runs on all PRs and pushes
└── deploy-production.yml     # Production deployment - runs on main branch
```

---

## 🔄 A. CI Pipeline

### File: `.github/workflows/ci.yml`

Pipeline ini berjalan untuk setiap push dan pull request ke branch `main` dan `develop`.

```yaml
# =============================================================================
# CI Pipeline - Runs on all PRs and pushes to main/develop
# =============================================================================
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ===========================================================================
  # Frontend CI
  # ===========================================================================
  frontend:
    name: Frontend CI
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      - name: 📦 Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
          cache-dependency-path: ./frontend/pnpm-lock.yaml

      - name: 📥 Install dependencies
        run: pnpm install

      - name: 🔍 Lint
        run: pnpm lint

      - name: 📝 Type check
        run: pnpm typecheck

      - name: 🧪 Run tests
        run: pnpm test

      - name: 🏗️ Build
        run: pnpm build
        env:
          VITE_USE_MOCK: "false"
          VITE_API_URL: "http://localhost:3001/api"

      - name: 📤 Upload build artifacts
        uses: actions/upload-artifact@v4
        if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
        with:
          name: frontend-dist
          path: ./frontend/dist
          retention-days: 7

  # ===========================================================================
  # Backend CI
  # ===========================================================================
  backend:
    name: Backend CI
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      - name: 📦 Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
          cache-dependency-path: ./backend/pnpm-lock.yaml

      - name: 📥 Install dependencies
        run: pnpm install

      - name: 🗄️ Generate Prisma Client
        run: pnpm prisma:generate

      - name: 🔍 Lint
        run: pnpm lint

      - name: 🧪 Run tests
        run: pnpm test

      - name: 🏗️ Build
        run: pnpm build

      - name: 📤 Upload build artifacts
        uses: actions/upload-artifact@v4
        if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
        with:
          name: backend-dist
          path: ./backend/dist
          retention-days: 7

  # ===========================================================================
  # CI Success Check
  # ===========================================================================
  ci-success:
    name: CI Success
    runs-on: ubuntu-latest
    needs: [frontend, backend]
    if: always()

    steps:
      - name: ✅ Check CI status
        run: |
          if [ "${{ needs.frontend.result }}" == "success" ] && [ "${{ needs.backend.result }}" == "success" ]; then
            echo "✅ All CI checks passed!"
            exit 0
          else
            echo "❌ CI checks failed"
            exit 1
          fi
```

### CI Jobs Summary

| Job            | Purpose                 | Steps                                                           |
| -------------- | ----------------------- | --------------------------------------------------------------- |
| **frontend**   | Frontend quality checks | Checkout → pnpm install → Lint → TypeCheck → Test → Build       |
| **backend**    | Backend quality checks  | Checkout → pnpm install → Prisma Generate → Lint → Test → Build |
| **ci-success** | Aggregate status        | Check all jobs passed                                           |

---

## 🚀 B. Production Deployment

### File: `.github/workflows/deploy-production.yml`

Pipeline ini berjalan saat code di-push/merge ke branch `main`, atau dapat di-trigger manual.

```yaml
# =============================================================================
# Deploy to Production - Runs when code is pushed/merged to main
# =============================================================================
name: Deploy Production

on:
  push:
    branches: [main]
  workflow_dispatch: # Allow manual trigger

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ===========================================================================
  # Build Docker Images
  # ===========================================================================
  build:
    name: Build Docker Images
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    outputs:
      frontend-image: ${{ steps.meta-frontend.outputs.tags }}
      backend-image: ${{ steps.meta-backend.outputs.tags }}
      sha-short: ${{ steps.vars.outputs.sha_short }}

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      - name: 🔧 Set output variables
        id: vars
        run: echo "sha_short=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT

      - name: 🐳 Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: 🔐 Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # ----- Frontend Image -----
      - name: 📋 Extract metadata (Frontend)
        id: meta-frontend
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend
          tags: |
            type=sha,prefix=
            type=raw,value=latest
            type=raw,value=${{ github.run_number }}

      - name: 🏗️ Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: ${{ steps.meta-frontend.outputs.tags }}
          labels: ${{ steps.meta-frontend.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            VITE_USE_MOCK=false
            VITE_API_URL=/api

      # ----- Backend Image -----
      - name: 📋 Extract metadata (Backend)
        id: meta-backend
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend
          tags: |
            type=sha,prefix=
            type=raw,value=latest
            type=raw,value=${{ github.run_number }}

      - name: 🏗️ Build and push Backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: ${{ steps.meta-backend.outputs.tags }}
          labels: ${{ steps.meta-backend.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ===========================================================================
  # Deploy to Production VM
  # ===========================================================================
  deploy:
    name: Deploy to Production
    needs: build
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      - name: 🔐 Setup SSH Key
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.VM_SSH_PRIVATE_KEY }}

      - name: 🔑 Add VM to known hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ secrets.VM_HOST }} >> ~/.ssh/known_hosts

      - name: 📤 Copy deployment files
        run: |
          scp docker-compose.yml ${{ secrets.VM_USER }}@${{ secrets.VM_HOST }}:${{ secrets.DEPLOY_PATH }}/

      - name: 🚀 Deploy to VM
        run: |
          ssh ${{ secrets.VM_USER }}@${{ secrets.VM_HOST }} << 'ENDSSH'
            set -e
            
            echo "📂 Navigating to deployment directory..."
            cd ${{ secrets.DEPLOY_PATH }}
            
            echo "🔐 Logging in to GitHub Container Registry..."
            echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            
            echo "📥 Pulling latest images..."
            docker compose pull
            
            echo "🔄 Stopping existing containers..."
            docker compose down --remove-orphans
            
            echo "🚀 Starting new containers..."
            docker compose up -d
            
            echo "⏳ Waiting for services to be healthy..."
            sleep 15
            
            echo "🔍 Health check..."
            docker compose ps
            
            echo "🧹 Cleaning up old images..."
            docker image prune -af --filter "until=168h"
            
            echo "✅ Deployment completed successfully!"
          ENDSSH

  # ===========================================================================
  # Notify on Failure
  # ===========================================================================
  notify-failure:
    name: Notify on Failure
    needs: [build, deploy]
    runs-on: ubuntu-latest
    if: failure()

    steps:
      - name: ❌ Deployment Failed Notification
        run: |
          echo "## ❌ Deployment Failed!" >> $GITHUB_STEP_SUMMARY
          echo "The deployment to production has failed." >> $GITHUB_STEP_SUMMARY
          echo "**Action required:** Check the workflow logs for details." >> $GITHUB_STEP_SUMMARY
```

### Deployment Jobs Summary

| Job                | Purpose              | Description                                |
| ------------------ | -------------------- | ------------------------------------------ |
| **build**          | Build Docker images  | Build frontend & backend, push to ghcr.io  |
| **deploy**         | Deploy to production | SSH to VM, pull images, restart containers |
| **notify-failure** | Failure notification | Post summary if deployment fails           |

---

## 🔐 C. Required Secrets

Secrets yang perlu dikonfigurasi di GitHub repository settings:

| Secret               | Description                   | Example                 |
| -------------------- | ----------------------------- | ----------------------- |
| `VM_HOST`            | Production server hostname/IP | `192.168.1.100`         |
| `VM_USER`            | SSH username                  | `deploy`                |
| `VM_SSH_PRIVATE_KEY` | SSH private key               | `-----BEGIN OPENSSH...` |
| `DEPLOY_PATH`        | Deployment directory on VM    | `/opt/trinity`          |
| `GITHUB_TOKEN`       | Auto-generated by GitHub      | (automatic)             |

### Setting Up Secrets

```bash
# 1. Go to repository Settings > Secrets and variables > Actions
# 2. Add each secret with appropriate values

# Generate SSH key for deployment
ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key

# Add public key to VM
cat deploy_key.pub >> ~/.ssh/authorized_keys

# Add private key content to GitHub Secret VM_SSH_PRIVATE_KEY
```

---

## 🌍 D. Environments

### Production Environment

Configure di GitHub Settings → Environments → production:

| Setting             | Value                         |
| ------------------- | ----------------------------- |
| Name                | `production`                  |
| Protection rules    | Required reviewers (optional) |
| Deployment branches | `main` only                   |

---

## 📊 E. Pipeline Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CI/CD Pipeline Flow                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Push/PR to main/develop                                                 │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │                    CI Workflow (ci.yml)                  │           │
│  │  ┌─────────────┐         ┌─────────────┐                │           │
│  │  │  Frontend   │         │   Backend   │                │           │
│  │  │ - Install   │         │ - Install   │                │           │
│  │  │ - Lint      │         │ - Prisma    │                │           │
│  │  │ - TypeCheck │         │ - Lint      │                │           │
│  │  │ - Test      │         │ - Test      │                │           │
│  │  │ - Build     │         │ - Build     │                │           │
│  │  └──────┬──────┘         └──────┬──────┘                │           │
│  │         │                       │                        │           │
│  │         └───────────┬───────────┘                       │           │
│  │                     │                                    │           │
│  │               ┌─────▼─────┐                             │           │
│  │               │ CI Success │                             │           │
│  │               └───────────┘                             │           │
│  └─────────────────────────────────────────────────────────┘           │
│                                                                          │
│  Push to main (only)                                                     │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │           Deploy Workflow (deploy-production.yml)        │           │
│  │                                                          │           │
│  │  ┌─────────────────────────────────────────┐            │           │
│  │  │              Build Images                │            │           │
│  │  │  - Frontend Docker → ghcr.io            │            │           │
│  │  │  - Backend Docker → ghcr.io             │            │           │
│  │  └─────────────────┬───────────────────────┘            │           │
│  │                    │                                     │           │
│  │                    ▼                                     │           │
│  │  ┌─────────────────────────────────────────┐            │           │
│  │  │           Deploy to Production           │            │           │
│  │  │  - SSH to VM                            │            │           │
│  │  │  - Pull images                          │            │           │
│  │  │  - docker compose up -d                 │            │           │
│  │  │  - Health check                         │            │           │
│  │  └─────────────────────────────────────────┘            │           │
│  └─────────────────────────────────────────────────────────┘           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ F. Local Development Commands

### Running Tests Locally

```bash
# Frontend
cd frontend
pnpm install
pnpm lint          # ESLint
pnpm typecheck     # TypeScript
pnpm test          # Vitest

# Backend
cd backend
pnpm install
pnpm prisma:generate
pnpm lint          # ESLint
pnpm test          # Jest
```

### Building Docker Images Locally

```bash
# Frontend
docker build -t trinity-frontend:local ./frontend

# Backend
docker build -t trinity-backend:local ./backend

# Run locally
docker compose -f docker-compose.dev.yml up -d
```

---

## 📋 G. Workflow Status Badges

Add these badges to your README.md:

```markdown
![CI](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/deploy-production.yml/badge.svg)
```

---

## 🔧 H. Troubleshooting

### Common Issues

| Issue                        | Solution                                     |
| ---------------------------- | -------------------------------------------- |
| CI fails on pnpm install     | Check pnpm-lock.yaml is committed            |
| Docker build fails           | Check Dockerfile syntax, verify context path |
| SSH connection refused       | Verify VM_HOST, VM_USER, and SSH key         |
| Container health check fails | Check service logs: `docker compose logs`    |
| Permission denied            | Check SSH key permissions (600)              |

### Debugging Steps

```bash
# View workflow run logs
# Go to Actions tab → Select workflow run → View logs

# Test SSH connection locally
ssh -i deploy_key user@host "echo 'Connection successful'"

# Test Docker build locally
docker build -t test-image ./backend 2>&1 | tee build.log

# Check container logs on VM
ssh user@host "cd /opt/trinity && docker compose logs -f"
```

---

## 📈 I. Metrics & Monitoring

### GitHub Actions Insights

- Go to **Actions** → **Usage report** for:
  - Total workflow runs
  - Success/failure rate
  - Average duration
  - Billable time

### Recommended Additions

```yaml
# Add to workflows for better observability

# Slack notification on failure
- name: Notify Slack on Failure
  if: failure()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "CHANNEL_ID"
    slack-message: "❌ Deployment failed: ${{ github.workflow }}"
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}

# Performance timing
- name: Report build time
  run: echo "Build completed in ${{ job.duration }} seconds"
```

---

## 📋 Quick Reference

| Command                                 | Description               |
| --------------------------------------- | ------------------------- |
| `gh workflow run ci.yml`                | Trigger CI manually       |
| `gh workflow run deploy-production.yml` | Trigger deploy manually   |
| `gh run list`                           | List recent workflow runs |
| `gh run view <run-id>`                  | View specific run details |
| `gh run watch`                          | Watch running workflow    |

---

**© 2026 Trinity Asset Management System**
