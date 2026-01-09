# Makefile for lulutracy.com
# Provides common commands for development, testing, and CI

.PHONY: help install dev build serve clean test test-watch test-coverage \
        lint lint-fix format format-check typecheck validate ci ci-fast \
        prepare hooks-install

# Default target
.DEFAULT_GOAL := help

# Colors for terminal output
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

#------------------------------------------------------------------------------
# Help
#------------------------------------------------------------------------------

help: ## Show this help message
	@echo "$(BLUE)lulutracy.com Development Commands$(RESET)"
	@echo ""
	@echo "$(GREEN)Usage:$(RESET) make [target]"
	@echo ""
	@echo "$(YELLOW)Development:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2}'

#------------------------------------------------------------------------------
# Setup & Installation
#------------------------------------------------------------------------------

install: ## Install dependencies
	npm ci

prepare: install hooks-install ## Full setup: install deps and git hooks

hooks-install: ## Install git hooks (husky)
	npx husky install || true

#------------------------------------------------------------------------------
# Development
#------------------------------------------------------------------------------

dev: ## Start development server with hot reload
	npm run develop

start: dev ## Alias for dev

build: ## Build production site
	npm run build

build-clean: clean build ## Clean and build

serve: ## Serve production build locally
	npm run serve

clean: ## Clean Gatsby cache and build artifacts
	npm run clean
	rm -rf coverage/

#------------------------------------------------------------------------------
# Code Quality
#------------------------------------------------------------------------------

typecheck: ## Run TypeScript type checking
	npm run typecheck

lint: ## Run ESLint
	npm run lint

lint-fix: ## Run ESLint with auto-fix
	npm run lint:fix

format: ## Format code with Prettier
	npm run format

format-check: ## Check code formatting
	npm run format:check

#------------------------------------------------------------------------------
# Testing
#------------------------------------------------------------------------------

test: ## Run tests
	npm run test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-coverage: ## Run tests with coverage report
	npm run test:coverage

#------------------------------------------------------------------------------
# Validation & CI
#------------------------------------------------------------------------------

validate: ## Run all validation checks (typecheck, lint, format, test)
	npm run validate

ci: ## Run full CI pipeline locally (mirrors GitHub Actions)
	@echo "$(BLUE)Running full CI pipeline...$(RESET)"
	@echo ""
	@echo "$(YELLOW)Step 1/5: Type checking...$(RESET)"
	@npm run typecheck
	@echo "$(GREEN)✓ Type check passed$(RESET)"
	@echo ""
	@echo "$(YELLOW)Step 2/5: Linting...$(RESET)"
	@npm run lint
	@echo "$(GREEN)✓ Lint passed$(RESET)"
	@echo ""
	@echo "$(YELLOW)Step 3/5: Format check...$(RESET)"
	@npm run format:check
	@echo "$(GREEN)✓ Format check passed$(RESET)"
	@echo ""
	@echo "$(YELLOW)Step 4/5: Running tests...$(RESET)"
	@npm run test -- --coverage --ci
	@echo "$(GREEN)✓ Tests passed$(RESET)"
	@echo ""
	@echo "$(YELLOW)Step 5/5: Building site...$(RESET)"
	@npm run build
	@echo "$(GREEN)✓ Build completed$(RESET)"
	@echo ""
	@echo "$(GREEN)======================================$(RESET)"
	@echo "$(GREEN)  CI Pipeline completed successfully!$(RESET)"
	@echo "$(GREEN)======================================$(RESET)"

ci-fast: ## Run fast CI checks (no build) - good for pre-push
	@echo "$(BLUE)Running fast CI checks...$(RESET)"
	@npm run typecheck && \
	npm run lint && \
	npm run format:check && \
	npm run test -- --ci && \
	echo "$(GREEN)✓ All fast checks passed$(RESET)"

#------------------------------------------------------------------------------
# Utilities
#------------------------------------------------------------------------------

outdated: ## Check for outdated dependencies
	npm outdated || true

audit: ## Run security audit
	npm audit || true

size: ## Show build output size
	@if [ -d "public" ]; then \
		echo "$(BLUE)Build output size:$(RESET)"; \
		du -sh public/; \
		echo ""; \
		echo "$(BLUE)Breakdown:$(RESET)"; \
		du -sh public/*/ 2>/dev/null | sort -rh | head -10; \
	else \
		echo "$(RED)No build found. Run 'make build' first.$(RESET)"; \
	fi

loc: ## Count lines of code
	@echo "$(BLUE)Lines of code:$(RESET)"
	@find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1
	@echo ""
	@echo "$(BLUE)By file type:$(RESET)"
	@echo "TypeScript/TSX:"
	@find src -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | tail -1 || echo "  0"
	@echo "CSS:"
	@find src -name "*.css" | xargs wc -l 2>/dev/null | tail -1 || echo "  0"
