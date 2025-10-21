# AGENTS.md — Termini CLI (Gemini-Powered Coding Agent)

> **A lightweight coding agent that brings the power of Gemini directly into your terminal**

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Architecture](#architecture)
- [Installation](#installation)
- [Authentication](#authentication)
- [Approval Modes](#approval-modes)
- [CLI Commands & Usage](#cli-commands--usage)
- [AGENTS.md Context Files](#agentsmd-context-files)
- [Tools & Capabilities](#tools--capabilities)
- [Sandbox & Security](#sandbox--security)
- [Configuration](#configuration)
- [MCP Integration](#mcp-integration)
- [Advanced Features](#advanced-features)
- [Project Structure](#project-structure)
- [Development Guide](#development-guide)
- [Examples & Workflows](#examples--workflows)
- [FAQ](#faq)

---

## Overview

**Termini** is an open-source coding agent powered by **Gemini** that runs locally in your terminal. It can **read, modify, and run code** on your machine, helping you:

- 🚀 **Build features faster** — from prompt to working code
- 🐛 **Squash bugs** — analyze, fix, and test automatically
- 📚 **Understand unfamiliar code** — get architecture insights and documentation
- ⚡ **Automate tasks** — refactor, test generation, PR reviews
- 🔧 **Run commands** — execute shell commands with approval workflows

### Key Features

- **Zero-setup installation** — `npm install -g termini-cli` and you're ready
- **Multi-modal inputs** — Pass text, screenshots, diagrams, or files
- **Rich approval workflow** — Three distinct modes: Suggest, Auto-Edit, Full-Auto
- **Runs in your terminal** — Perfect for quick iteration without context switching
- **Sandboxed execution** — Safe command execution with firewall restrictions
- **Gemini 2.5 Pro/Flash** — Access to 1M+ token context window
- **Open source** — Apache 2.0 licensed, built with Rust for speed

### Why Termini?

Unlike simple chatbots, Termini is a **coding agent** that:
- Reads and writes files using intelligent patch application
- Executes shell commands in sandboxed environments
- Iterates based on test results and user feedback
- Maintains conversation context across sessions
- Works with your project conventions via AGENTS.md files

---

## Quick Start

### Install

```bash
# Using npm (recommended)
npm install -g termini-cli

# Using Homebrew
brew install termini

# Or run without installing
npx termini-cli
```

### Authenticate

```bash
# Set your Gemini API key
export GEMINI_API_KEY="your-api-key-here"

# Or use interactive login
termini
# Select "Login with Google" at the prompt
```

### Basic Usage

```bash
# Start interactive session
termini

# Direct command
termini "Add error handling to auth.js"

# Specify approval mode
termini --suggest "Refactor the database layer"
termini --auto-edit "Add TypeScript types"
termini --full-auto "Write unit tests for all services"

# Use specific model
termini -m gemini-2.5-flash "Explain this codebase"
```

### Your First Task

```bash
cd my-project
termini "Add a user registration endpoint with validation"
```

Termini will:
1. Analyze your codebase structure
2. Propose file changes (patches)
3. Show you a diff for review
4. Apply changes after your approval
5. Run tests if available

---

## Core Concepts

### 1. Agent Loop

Termini operates in a **continuous agent loop**:

```
User Input → Context Analysis → Gemini API Call → Tool Execution → Result Review → Iterate
```

The agent can:
- **Read files** to understand context
- **Write patches** to modify code
- **Execute commands** to run tests or build
- **Check results** and iterate until success

### 2. Approval Modes

Control how much autonomy Termini has:

| Mode | Description | Use When |
|------|-------------|----------|
| **Suggest** | Shows all changes, requires approval | You want full control |
| **Auto-Edit** | Auto-applies file patches, asks before running commands | You trust code changes but want command oversight |
| **Full-Auto** | Applies everything automatically, runs until task complete | You want maximum speed and trust the agent |

Toggle modes with `/mode` or flags like `--suggest`, `--auto-edit`, `--full-auto`.

### 3. Patch-Based Editing

Termini doesn't directly modify files. Instead:
1. Gemini generates a **unified diff patch**
2. Termini parses and validates the patch
3. You review the diff with syntax highlighting
4. On approval, patches are applied to files
5. Original files are preserved (Git integration recommended)

### 4. Sandboxed Execution

For security, shell commands run in a **restricted sandbox**:
- Network access limited to Gemini API only
- File system operations restricted to project directory
- Dangerous commands blocked or require explicit approval
- Firewall rules via `iptables`/`ipset` on Linux

### 5. Context Files (AGENTS.md)

Tell Termini about your project conventions:

```markdown
# agents.md

## Project: E-Commerce API

You are an expert Node.js developer working on an e-commerce API.

## Tech Stack
- Node.js 20, Express, PostgreSQL, Redis
- TypeScript with strict mode
- Jest for testing

## Conventions
- Use async/await, never callbacks
- Follow Airbnb style guide
- All endpoints must have tests
- Use descriptive variable names (no single letters)

## File Structure
- `src/routes/` - API routes
- `src/services/` - Business logic
- `src/models/` - Database models
```

---

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Termini CLI (User Interface)             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Terminal UI (Ink + React)                           │  │
│  │  - TerminalChat component                            │  │
│  │  - Input handling & history                          │  │
│  │  - Diff rendering & approval prompts                 │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │  Agent Loop (Core Logic)                             │  │
│  │  - Context management                                │  │
│  │  - Gemini API client                                 │  │
│  │  - Tool execution (shell, patch, read)              │  │
│  │  - State machine for approval flow                  │  │
│  └───────────────────┬──────────────────────────────────┘  │
└────────────────────────┴──────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
   ┌────────────────┐      ┌──────────────────┐
   │  Gemini API    │      │  Local Sandbox   │
   │  - 2.5-pro     │      │  - File system   │
   │  - 2.5-flash   │      │  - Shell exec    │
   └────────────────┘      │  - Firewall      │
                           └──────────────────┘
```

### Component Breakdown

#### 1. CLI Entry (`src/cli.tsx`)
- Parses command-line arguments using `meow`
- Loads configuration from `~/.termini/config.toml`
- Initializes the main `App` component
- Handles authentication flow

#### 2. Terminal UI (`src/components/chat/`)
- **TerminalChat**: Main chat interface component
- **MessageList**: Renders conversation history
- **InputPrompt**: Handles user input with readline
- **DiffRenderer**: Syntax-highlighted patch diffs
- **LoadingSpinner**: Shows "Thinking..." states
- **ApprovalOverlay**: Y/N/Edit prompts for changes

#### 3. Agent Loop (`src/utils/agent/agent-loop.ts`)
- **AgentLoop class**: Core orchestration logic
- Manages conversation history
- Constructs API payloads with system prompts
- Handles streaming responses
- Executes tools (file read, patch apply, shell)
- Implements approval flow state machine

#### 4. Tools (`src/utils/agent/`)

##### a. Shell Execution (`exec.ts`)
```typescript
async function execShell(cmd: string[]): Promise<string> {
  // Run in sandbox with firewall restrictions
  // Return stdout/stderr
}
```

##### b. Patch Application (`apply-patch.ts`)
```typescript
function applyPatch(filepath: string, patch: string): void {
  // Parse unified diff format
  // Apply hunks to file
  // Validate line numbers
}
```

##### c. File Operations (`file-ops.ts`)
```typescript
function readFile(path: string): string
function writeFile(path: string, content: string): void
function listFiles(dir: string): string[]
```

#### 5. Gemini Client (`src/utils/gemini-client.ts`)
- Uses `@google/generative-ai` library
- Supports streaming responses
- Tool calling configuration
- Token caching
- Error handling and retries

#### 6. Sandbox (`scripts/init_firewall.sh`)
- Runs in minimal Docker container on Linux
- Firewall rules restrict network to Gemini API only
- Project directory mounted into container
- User cannot access broader network

---

## Installation

### System Requirements

- **Node.js** 20 or higher
- **npm** or **yarn** package manager
- **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)
- **Git** (recommended for version control)
- **Operating System**:
  - macOS 12+
  - Linux (Ubuntu 20.04+, Debian 10+)
  - Windows 11 with WSL2

### Install via npm

```bash
npm install -g termini-cli
```

### Install via Homebrew

```bash
brew tap yourusername/termini
brew install termini
```

### Install from Source

```bash
git clone https://github.com/yourusername/termini-cli.git
cd termini-cli
npm install
npm run build
npm link
```

### Verify Installation

```bash
termini --version
termini --help
```

### Update Termini

```bash
termini --upgrade
# or
npm install -g termini-cli@latest
```

---

## Authentication

### Option 1: Gemini API Key (Recommended)

Get your API key from [Google AI Studio](https://aistudio.google.com/apikey):

```bash
export GEMINI_API_KEY="your-api-key-here"
termini
```

**Free tier limits:**
- 60 requests/minute
- 1,000 requests/day
- Gemini 2.5 Pro with 1M token context

### Option 2: Vertex AI (Enterprise)

For enterprise deployments:

```bash
export GOOGLE_API_KEY="your-vertex-key"
export GOOGLE_GENAI_USE_VERTEXAI=true
export GOOGLE_CLOUD_PROJECT="your-project-id"
termini
```

**Benefits:**
- Enterprise security & compliance
- Higher rate limits
- Private networking
- Usage-based billing

### Option 3: Interactive Login

```bash
termini
# Select "Login with Google" at prompt
# Follow browser authentication flow
```

### Store Credentials

Add to `~/.termini/config.toml`:

```toml
[auth]
method = "api_key"
api_key_env = "GEMINI_API_KEY"

# Or for Vertex AI
# method = "vertex"
# project_id = "your-project"
```

---

## Approval Modes

### 1. Suggest Mode (Default)

**Maximum control** — Review every action before execution.

```bash
termini --suggest "Add logging to the API"
# or in-session
> /mode suggest
```

**Workflow:**
1. Gemini proposes changes
2. You see full diff with syntax highlighting
3. Approve with `Y`, reject with `N`, or edit with `E`
4. Gemini continues based on your decision

**Use when:**
- Working on critical production code
- Learning how Termini works
- You want to understand every change

### 2. Auto-Edit Mode

**Balanced autonomy** — Auto-apply file changes, ask before running commands.

```bash
termini --auto-edit "Refactor the auth module"
> /mode auto-edit
```

**Workflow:**
1. File patches applied automatically
2. Shell commands require approval
3. You review command before execution
4. Tests and builds require confirmation

**Use when:**
- You trust code changes but want command oversight
- Working on established codebases
- Balancing speed and safety

### 3. Full-Auto Mode

**Maximum speed** — Let Termini work autonomously.

```bash
termini --full-auto "Write comprehensive tests"
> /mode full-auto
```

**Workflow:**
1. All patches applied automatically
2. Commands executed without confirmation
3. Termini iterates until task complete or blocked
4. You see real-time progress updates

**Use when:**
- Working on side projects or experiments
- Time-sensitive tasks
- You fully trust the agent and have good Git history

### Toggle Modes

```bash
# In-session command
> /mode suggest
> /mode auto-edit
> /mode full-auto

# Check current mode
> /mode
Current mode: auto-edit
```

---

## CLI Commands & Usage

### Basic Usage

```bash
# Start interactive session
termini

# Direct task
termini "Add user authentication"

# With approval mode
termini --suggest "Explain the architecture"
termini --auto-edit "Add error handling"
termini --full-auto "Generate API tests"

# Specify model
termini -m gemini-2.5-flash "Quick code review"

# Include specific files
termini --files src/app.ts,src/auth.ts "Review these files"

# Load context from file
termini --context ./docs/PROJECT.md "Build new feature"
```

### Command-Line Flags

```bash
-m, --model <name>           # Model: gemini-2.5-pro (default), gemini-2.5-flash
--suggest                    # Use suggest mode (max control)
--auto-edit                  # Use auto-edit mode (balanced)
--full-auto                  # Use full-auto mode (max speed)
--files <paths>              # Include specific files in context
--context <file>             # Load additional context file
--no-sandbox                 # Disable sandbox (dangerous!)
--debug                      # Enable debug logging
--version                    # Show version
--help                       # Show help
--upgrade                    # Upgrade to latest version
```

### In-Session Slash Commands

```bash
/help                        # Show available commands
/mode [suggest|auto-edit|full-auto]  # Toggle approval mode
/clear                       # Clear conversation history
/save [name]                 # Save checkpoint
/load [name]                 # Load checkpoint
/files                       # Show files in context
/model <name>                # Switch Gemini model
/context                     # Show current context
/reload                      # Reload AGENTS.md files
/sandbox                     # Show sandbox status
/exit                        # Exit Termini
/abort                       # Cancel current task
```

### Environment Variables

```bash
# Authentication
GEMINI_API_KEY=your_key
GOOGLE_API_KEY=your_vertex_key
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=your_project

# Configuration
TERMINI_CONFIG=~/.termini/config.toml
TERMINI_MODEL=gemini-2.5-pro
TERMINI_MODE=suggest
TERMINI_SANDBOX=true

# Debugging
TERMINI_DEBUG=true
TERMINI_LOG_FILE=~/.termini/logs/termini.log
```

---

## AGENTS.md Context Files

### What are AGENTS.md Files?

**AGENTS.md** files provide context to Termini about your project conventions, tech stack, and preferences. They act as a persistent system prompt.

### File Hierarchy

Termini merges AGENTS.md files from multiple locations (top-down priority):

1. **Global**: `~/.termini/AGENTS.md` — Your personal coding preferences
2. **User**: `~/.termini/user.md` — User-specific instructions
3. **Project Root**: `./AGENTS.md` — Shared project conventions
4. **Current Directory**: `./subdir/AGENTS.md` — Feature-specific context
5. **Task-Specific**: Inline instructions in your prompt

### Example: Global AGENTS.md

`~/.termini/AGENTS.md`:

```markdown
# Personal Coding Preferences

You are working with a senior software engineer who prefers:

## General Conventions
- Use TypeScript for all new JavaScript projects
- Prefer functional programming patterns
- Write comprehensive JSDoc comments
- Use Prettier for formatting (2 spaces, single quotes)

## Testing
- Write tests for all new features
- Use Jest as the testing framework
- Aim for >80% code coverage

## Git
- Write conventional commits (feat:, fix:, docs:, etc.)
- Keep commits atomic and focused
```

### Example: Project AGENTS.md

`./AGENTS.md`:

```markdown
# Project: E-Commerce Platform API

You are an expert developer on an e-commerce platform.

## Architecture
This is a microservices architecture with:
- **API Gateway**: Express.js (port 3000)
- **Auth Service**: JWT-based authentication
- **Product Service**: Product catalog and inventory
- **Order Service**: Order processing and fulfillment
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for session storage

## Tech Stack
- Node.js 20
- TypeScript 5.3 (strict mode)
- Express 4.18
- Prisma 5.8
- Redis 7.2
- Jest 29 for testing

## Code Conventions
- **Async/await**: Never use callbacks
- **Error handling**: Always use try-catch with typed errors
- **Validation**: Use Zod for request validation
- **Naming**:
  - camelCase for variables and functions
  - PascalCase for classes and types
  - UPPER_SNAKE_CASE for constants

## File Structure
- `src/api/` - API routes and controllers
- `src/services/` - Business logic
- `src/models/` - Prisma schema and types
- `src/utils/` - Helper functions
- `src/middleware/` - Express middleware
- `tests/` - Jest test files

## Testing Requirements
- All API endpoints must have integration tests
- Services must have unit tests
- Use `supertest` for API testing
- Mock external services in tests

## Security
- Never log sensitive data (passwords, tokens)
- Always validate user input
- Use parameterized queries (Prisma handles this)
- Rate limit all public endpoints

## Important Notes
- The `src/legacy/` folder is deprecated — don't modify
- Use the custom logger in `src/utils/logger.ts`
- Authentication middleware is in `src/middleware/auth.ts`
```

### Example: Feature-Specific AGENTS.md

`./src/features/checkout/AGENTS.md`:

```markdown
# Checkout Feature

This directory handles the checkout flow.

## Flow
1. Cart validation (`validateCart.ts`)
2. Payment processing (`payment.ts`)
3. Order creation (`createOrder.ts`)
4. Email notification (`notifications.ts`)

## External Services
- **Stripe**: Payment processing
- **SendGrid**: Email notifications
- **Shippo**: Shipping labels

## Important
- Always verify cart items exist before checkout
- Use idempotency keys for Stripe requests
- Retry failed email sends up to 3 times
```

### Best Practices

1. **Be specific**: Detailed conventions are better than vague guidelines
2. **Include examples**: Show desired output format
3. **Update regularly**: Keep AGENTS.md in sync with your project
4. **Use sections**: Organize with clear headers (## Architecture, ## Conventions)
5. **Mention gotchas**: Highlight tricky parts of the codebase

---

## Tools & Capabilities

### Built-in Tools

Termini has access to these tools through the Gemini function calling API:

#### 1. File Operations

```typescript
// Read files
tool: read_file
args: { path: "src/app.ts" }

// List directory
tool: list_files
args: { directory: "src/", recursive: true }

// Search files
tool: search_files
args: { pattern: "TODO", directory: "src/" }
```

#### 2. Patch Application

```typescript
tool: apply_patch
args: {
  path: "src/auth.ts",
  patch: `
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,6 +10,7 @@
 export async function login(username: string, password: string) {
+  if (!username || !password) throw new Error('Missing credentials');
   const user = await db.user.findUnique({ where: { username } });
  `
}
```

#### 3. Shell Execution

```typescript
tool: shell
args: {
  cmd: ["npm", "test"],
  workdir: "/project"
}
```

#### 4. Git Operations

```typescript
// Check status
tool: git_status

// Show diff
tool: git_diff
args: { files: ["src/app.ts"] }

// Commit changes
tool: git_commit
args: { message: "feat: add user authentication" }
```

### Tool Execution Flow

```
1. Gemini decides a tool is needed
2. Returns function_call with tool name and args
3. Termini validates the tool request
4. Checks approval mode (suggest/auto-edit/full-auto)
5. Requests user approval if needed
6. Executes tool in sandbox
7. Returns result to Gemini
8. Gemini continues with next step
```

### Tool Safety

- **File writes**: Always use patches (reviewable diffs)
- **Shell commands**: Sandboxed with network restrictions
- **Git operations**: Read-only by default (commits require approval)
- **Dangerous commands**: Blocked (`rm -rf`, `sudo`, etc.)

---

## Sandbox & Security

### Sandbox Architecture

Termini runs commands in a **restricted sandbox** for security:

```
┌────────────────────────────────────────┐
│  Host System (Your Machine)           │
│  ┌──────────────────────────────────┐ │
│  │  Termini CLI                     │ │
│  └──────────────┬───────────────────┘ │
│                 │                      │
│  ┌──────────────▼───────────────────┐ │
│  │  Docker Container (Sandbox)      │ │
│  │  - Firewall: Only Gemini API    │ │
│  │  - Mounted: /project             │ │
│  │  - No network access to host    │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

### Firewall Rules (`scripts/init_firewall.sh`)

```bash
# Allow Gemini API only
iptables -A OUTPUT -d generativelanguage.googleapis.com -j ACCEPT

# Block everything else
iptables -A OUTPUT -j REJECT
```

### Trusted Folders

Configure safe directories in `~/.termini/config.toml`:

```toml
[security]
trusted_folders = [
  "~/projects",
  "~/work/safe-repos"
]
sandbox_enabled = true
```

### Command Allowlist

Restrict allowed shell commands:

```toml
[security.commands]
allowed = ["git", "npm", "node", "cat", "ls", "grep"]
blocked = ["rm", "sudo", "curl", "wget"]
```

### Disable Sandbox (Advanced)

**⚠️ Warning**: Only disable sandbox in trusted environments.

```bash
termini --no-sandbox "Run analysis"
```

Or in config:

```toml
[security]
sandbox_enabled = false
```

---

## Configuration

### Config File Location

`~/.termini/config.toml`

### Full Configuration Example

```toml
[auth]
method = "api_key"
api_key_env = "GEMINI_API_KEY"

[model]
default = "gemini-2.5-pro"
temperature = 1.0
max_tokens = 8192

[behavior]
default_mode = "suggest"  # suggest | auto-edit | full-auto
stream = true
auto_save_checkpoints = true

[security]
sandbox_enabled = true
trusted_folders = ["~/projects", "~/work"]

[security.commands]
allowed = ["git", "npm", "node", "cat", "ls", "grep", "find"]
blocked = ["rm", "sudo", "curl", "wget"]

[ui]
theme = "dark"
show_thinking = true
syntax_highlighting = true

[context]
auto_load_agents_md = true
max_files_in_context = 50
token_cache_ttl = 300  # seconds

[mcp_servers]
# MCP server configurations
[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]
env = { GITHUB_TOKEN = "env:GITHUB_TOKEN" }

[telemetry]
enabled = false
```

### Per-Project Configuration

Create `.termini/config.toml` in project root:

```toml
[model]
default = "gemini-2.5-flash"  # Faster for this project

[behavior]
default_mode = "auto-edit"

[context]
agents_files = ["AGENTS.md", "docs/CONVENTIONS.md"]
```

---

## MCP Integration

### What is MCP?

**Model Context Protocol (MCP)** allows Termini to connect to external tools and services.

### Configure MCP Servers

`~/.termini/config.toml`:

```toml
[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]
env = { GITHUB_TOKEN = "env:GITHUB_TOKEN" }

[mcp_servers.database]
command = "node"
args = ["./mcp-servers/database.js"]
env = { DB_URL = "postgresql://..." }

[mcp_servers.slack]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-slack"]
env = { SLACK_TOKEN = "env:SLACK_TOKEN" }
```

### Usage

```bash
termini
> @github List my open PRs
> @database Show users created today
> @slack Send message to #dev channel
```

### Available MCP Servers

- **GitHub**: PR management, issue triage
- **GitLab**: Similar to GitHub
- **Jira**: Issue tracking
- **Slack**: Notifications
- **Database**: SQL query execution
- **AWS**: Cloud resource management
- **Custom**: Build your own MCP server

### Building Custom MCP Servers

```javascript
// mcp-servers/custom.js
export default {
  name: 'custom',
  description: 'Custom tool',
  async execute(args) {
    // Your logic here
    return { success: true, data: '...' };
  }
};
```

---

## Advanced Features

### 1. Multi-Modal Inputs

Pass screenshots or diagrams:

```bash
# Screenshot
termini --image screenshot.png "Build this UI"

# Diagram
termini --image architecture.png "Implement this design"

# Multiple files
termini --files "design.png,spec.md" "Build feature from spec"
```

### 2. Checkpointing

Save and resume complex sessions:

```bash
# In-session
> /save api-refactor
Checkpoint saved: api-refactor

# Resume later
termini
> /load api-refactor
Checkpoint loaded: api-refactor (12 messages)
```

### 3. Conversation Export

```bash
> /export json > conversation.json
> /export markdown > conversation.md
```

### 4. Token Caching

Termini caches context to reduce API calls:

```bash
# Automatic based on config
[context]
token_cache_ttl = 300  # 5 minutes

# Manual refresh
> /reload
Context refreshed from AGENTS.md
```

### 5. IDE Integration (Planned)

```bash
# VS Code extension (coming soon)
code --install-extension termini-vscode

# Cursor integration
termini --ide cursor
```

### 6. GitHub Actions Integration

`.github/workflows/termini-review.yml`:

```yaml
name: Termini Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install -g termini-cli
      - env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: |
          termini --full-auto "Review this PR for bugs" > review.md
      - uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('review.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: review
            });
```

---

## Project Structure

### Complete Folder Tree

```
termini-cli/
├── bin/
│   └── termini.js                     # CLI entry point (shebang)
│
├── src/
│   ├── cli.tsx                        # Main CLI handler (meow parser)
│   ├── app.tsx                        # Root app component
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── TerminalChat.tsx       # Main chat interface
│   │   │   ├── MessageList.tsx        # Conversation history
│   │   │   ├── InputPrompt.tsx        # User input handler
│   │   │   ├── LoadingSpinner.tsx     # "Thinking..." animation
│   │   │   ├── DiffRenderer.tsx       # Syntax-highlighted diffs
│   │   │   └── ApprovalOverlay.tsx    # Y/N/Edit prompts
│   │   │
│   │   └── ui/
│   │       ├── Header.tsx             # Session info header
│   │       ├── StatusBar.tsx          # Mode, model, status
│   │       └── ErrorDisplay.tsx       # Error messages
│   │
│   ├── utils/
│   │   ├── agent/
│   │   │   ├── agent-loop.ts          # Core agent orchestration
│   │   │   ├── exec.ts                # Shell command execution
│   │   │   ├── apply-patch.ts         # Unified diff parsing & application
│   │   │   ├── file-ops.ts            # Read/write/list files
│   │   │   ├── tools.ts               # Tool registry and execution
│   │   │   └── state-machine.ts       # Approval flow state machine
│   │   │
│   │   ├── gemini/
│   │   │   ├── client.ts              # Gemini API client wrapper
│   │   │   ├── streaming.ts           # Streaming response handler
│   │   │   ├── function-calling.ts    # Tool calling configuration
│   │   │   ├── models.ts              # Model definitions & config
│   │   │   └── token-cache.ts         # Context caching logic
│   │   │
│   │   ├── context/
│   │   │   ├── loader.ts              # AGENTS.md file loader
│   │   │   ├── merger.ts              # Merge multiple context files
│   │   │   ├── parser.ts              # Parse markdown context
│   │   │   └── indexer.ts             # Build file index for context
│   │   │
│   │   ├── sandbox/
│   │   │   ├── docker.ts              # Docker container management
│   │   │   ├── firewall.ts            # Network restrictions
│   │   │   ├── validator.ts           # Command validation
│   │   │   └── isolation.ts           # Process isolation
│   │   │
│   │   ├── session/
│   │   │   ├── checkpoint.ts          # Save/load conversations
│   │   │   ├── history.ts             # Message history management
│   │   │   └── storage.ts             # File-based storage
│   │   │
│   │   └── config/
│   │       ├── loader.ts              # Load config.toml
│   │       ├── defaults.ts            # Default configuration
│   │       ├── validator.ts           # Validate config schema
│   │       └── env.ts                 # Environment variable handling
│   │
│   ├── types/
│   │   ├── agent.ts                   # Agent-related types
│   │   ├── config.ts                  # Configuration types
│   │   ├── gemini.ts                  # Gemini API types
│   │   └── tools.ts                   # Tool execution types
│   │
│   └── constants/
│       ├── models.ts                  # Model names & capabilities
│       ├── prompts.ts                 # System prompts
│       └── defaults.ts                # Default values
│
├── scripts/
│   ├── init_firewall.sh               # Sandbox firewall setup
│   ├── build.sh                       # Build script
│   └── release.sh                     # Release automation
│
├── tests/
│   ├── unit/
│   │   ├── agent-loop.test.ts
│   │   ├── apply-patch.test.ts
│   │   ├── context-loader.test.ts
│   │   └── gemini-client.test.ts
│   │
│   ├── integration/
│   │   ├── e2e-suggest-mode.test.ts
│   │   ├── e2e-auto-edit.test.ts
│   │   └── sandbox.test.ts
│   │
│   └── fixtures/
│       ├── example-project/
│       ├── patches/
│       └── contexts/
│
├── docs/
│   ├── AGENTS.md                      # This file
│   ├── QUICKSTART.md                  # Getting started guide
│   ├── AUTHENTICATION.md              # Auth setup
│   ├── APPROVAL-MODES.md              # Approval flow details
│   ├── AGENTS-MD-GUIDE.md             # Writing context files
│   ├── TOOLS.md                       # Built-in tools reference
│   ├── SANDBOX.md                     # Security & sandboxing
│   ├── MCP.md                         # MCP integration guide
│   ├── CONFIGURATION.md               # Config reference
│   ├── CONTRIBUTING.md                # Development guide
│   └── FAQ.md                         # Frequently asked questions
│
├── examples/
│   ├── contexts/
│   │   ├── AGENTS.md.example          # Sample context file
│   │   ├── nodejs-project.md          # Node.js conventions
│   │   ├── python-project.md          # Python conventions
│   │   └── react-app.md               # React conventions
│   │
│   ├── workflows/
│   │   ├── add-feature.md             # Adding new features
│   │   ├── fix-bug.md                 # Bug fixing workflow
│   │   ├── refactor.md                # Refactoring guide
│   │   └── write-tests.md             # Test generation
│   │
│   └── mcp-servers/
│       ├── custom-server.js           # Custom MCP example
│       └── database-server.js         # Database MCP example
│
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Continuous integration
│       ├── release.yml                # Release automation
│       └── termini-review.yml         # PR review example
│
├── config/
│   ├── default.toml                   # Default configuration
│   └── schema.json                    # Config schema
│
├── .env.example                       # Environment variables template
├── .gitignore
├── .npmignore
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
├── LICENSE                            # Apache 2.0
├── CHANGELOG.md
└── SECURITY.md                        # Security policy
```

---

## Development Guide

### Prerequisites

- **Node.js** 20+
- **TypeScript** 5.3+
- **Docker** (for sandbox testing)
- **Git**

### Clone & Install

```bash
git clone https://github.com/yourusername/termini-cli.git
cd termini-cli
npm install
```

### Development Workflow

```bash
# Build TypeScript
npm run build

# Watch mode (auto-rebuild)
npm run dev

# Run locally without installing
npm run start

# Link globally for testing
npm link
termini --version
```

### Testing

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run typecheck

# Pre-commit checks
npm run pre-commit
```

### Build & Release

```bash
# Build for production
npm run build

# Create release
npm run release

# Publish to npm
npm publish
```

### Project Scripts (package.json)

```json
{
  "scripts": {
    "build": "tsc && chmod +x dist/bin/termini.js",
    "dev": "tsc --watch",
    "start": "node dist/bin/termini.js",
    "test": "jest",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:e2e": "jest --testPathPattern=tests/e2e",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "typecheck": "tsc --noEmit",
    "pre-commit": "npm run lint && npm run typecheck && npm test",
    "release": "./scripts/release.sh",
    "clean": "rm -rf dist/"
  }
}
```

---

## Examples & Workflows

### Example 1: Add New Feature

```bash
termini --auto-edit "Add user profile endpoint with validation"
```

**Termini will:**
1. Analyze existing code structure
2. Create `src/routes/profile.ts`
3. Add validation middleware
4. Update route registration
5. Generate tests
6. Run tests to verify

### Example 2: Fix Bug

```bash
termini "Fix the authentication bug where tokens expire incorrectly"
```

**Termini will:**
1. Search for authentication code
2. Analyze token expiration logic
3. Propose fix with explanation
4. Show diff for review
5. Apply patch after approval
6. Run relevant tests

### Example 3: Refactor Code

```bash
termini --suggest "Refactor src/api/ to use async/await instead of callbacks"
```

**Termini will:**
1. Identify all callback patterns
2. Generate patches for each file
3. Show detailed diffs
4. Apply changes one by one with approval
5. Update tests if needed

### Example 4: Generate Tests

```bash
termini --full-auto "Write comprehensive tests for src/services/payment.ts"
```

**Termini will:**
1. Analyze the payment service
2. Identify test cases (happy path, errors, edge cases)
3. Generate test file
4. Run tests
5. Fix any failures
6. Iterate until all tests pass

### Example 5: Code Review

```bash
termini "Review the changes in the last commit for security issues"
```

**Termini will:**
1. Run `git diff HEAD~1`
2. Analyze changed code
3. Identify potential issues
4. Suggest improvements
5. Propose security fixes if needed

### Example 6: Documentation

```bash
termini "Generate API documentation for all routes in src/api/"
```

**Termini will:**
1. Scan all route files
2. Extract endpoint definitions
3. Generate OpenAPI specification
4. Create markdown documentation
5. Include examples and schemas

### Example 7: Database Migration

```bash
termini "Create a Prisma migration to add email verification to users"
```

**Termini will:**
1. Update Prisma schema
2. Generate migration file
3. Show SQL preview
4. Run migration after approval
5. Update relevant models/types

### Example 8: Multi-File Refactor

```bash
termini --auto-edit "Split src/app.ts into separate route files"
```

**Termini will:**
1. Analyze monolithic file
2. Plan module separation
3. Create new route files
4. Move code to appropriate files
5. Update imports across codebase
6. Verify nothing breaks

---

## FAQ

### General Questions

#### Q: How is Termini different from ChatGPT/Claude?

**A:** Termini is a **coding agent**, not just a chatbot. It can:
- Read and write files on your machine
- Execute shell commands
- Apply patches with unified diff format
- Iterate based on test results
- Work autonomously in full-auto mode

ChatGPT/Claude require you to copy/paste code manually.

#### Q: Is Termini free?

**A:** Termini is **open source** (Apache 2.0), so the CLI is free. You pay only for Gemini API usage:
- **Free tier**: 60 requests/min, 1,000 requests/day
- **Paid tier**: Usage-based billing for higher limits

#### Q: Can I use Termini offline?

**A:** No, Termini requires an internet connection to communicate with the Gemini API.

#### Q: Does Termini work on Windows?

**A:** Yes, but **WSL2 is recommended** for the best experience. Native Windows support is limited due to sandbox requirements.

### Usage Questions

#### Q: Which approval mode should I use?

**A:**
- **Suggest**: When working on critical production code or learning
- **Auto-edit**: Balanced mode for most projects
- **Full-auto**: Side projects, experiments, or when you trust the agent

Start with **suggest** and graduate to **auto-edit** as you gain confidence.

#### Q: How do I stop Termini mid-task?

**A:** Press **Ctrl+C** to interrupt the current generation, or use `/abort` to cancel the entire task.

#### Q: Can Termini work with monorepos?

**A:** Yes! Place `AGENTS.md` files at:
- Monorepo root: Shared conventions
- Package directories: Package-specific context

Example:
```
my-monorepo/
├── AGENTS.md              # Shared conventions
├── packages/
│   ├── api/
│   │   └── AGENTS.md      # API-specific context
│   └── web/
│       └── AGENTS.md      # Web-specific context
```

#### Q: How do I include specific files in context?

**A:**
```bash
termini --files src/app.ts,src/auth.ts "Review these files"
```

Or in-session:
```bash
> Include src/app.ts and src/auth.ts, then review for bugs
```

#### Q: Can Termini commit to Git automatically?

**A:** In **full-auto** mode, yes. Otherwise, commits require approval. Configure in `config.toml`:

```toml
[security.git]
auto_commit = false  # Require approval (default)
auto_push = false    # Never auto-push (recommended)
```

### Security Questions

#### Q: Is it safe to use full-auto mode?

**A:** Full-auto mode is safe if:
- You're working in a **Git repository** (easy rollback)
- The project is **non-production** or experimental
- You have **sandbox enabled** (default)

Never use full-auto on production databases or critical systems without understanding what Termini will do.

#### Q: Can Termini access my environment variables?

**A:** Termini can read environment variables **only if explicitly allowed** in the sandbox configuration. By default, only `GEMINI_API_KEY` and related auth variables are accessible.

#### Q: What commands are blocked in the sandbox?

**A:** Dangerous commands like:
- `rm -rf` (recursive delete)
- `sudo` (privilege escalation)
- `curl`, `wget` (arbitrary network access)
- `dd` (disk operations)
- System modification commands

You can customize the allowlist in `config.toml`.

#### Q: Can I disable the sandbox?

**A:** Yes, but **not recommended** unless you fully trust the code and prompts:

```bash
termini --no-sandbox
```

Or in config:
```toml
[security]
sandbox_enabled = false
```

### Technical Questions

#### Q: Which Gemini models does Termini support?

**A:**
- **gemini-2.5-pro** (default): Most capable, 1M token context
- **gemini-2.5-flash**: Faster, lower cost, good for quick tasks

Switch with `-m` flag or `/model` command.

#### Q: How does Termini handle large codebases?

**A:** Termini uses:
- **Smart file indexing**: Only includes relevant files in context
- **Token caching**: Reuses common context across requests
- **Streaming**: Shows responses as they're generated

For very large repos (1000+ files), specify key directories:
```bash
termini --files src/,lib/ "Analyze the API layer"
```

#### Q: Can Termini work with multiple programming languages?

**A:** Yes! Gemini supports all major languages:
- JavaScript/TypeScript
- Python
- Java
- Go
- Rust
- C/C++
- PHP
- Ruby
- And more

#### Q: How do I update Termini?

**A:**
```bash
npm install -g termini-cli@latest
# or
termini --upgrade
```

#### Q: Does Termini support team collaboration?

**A:** Not yet, but it's on the roadmap! Planned features:
- Shared AGENTS.md templates
- Team checkpoints
- Usage analytics
- Shared MCP servers

### Troubleshooting

#### Q: Termini says "API key not found"

**A:** Set your API key:
```bash
export GEMINI_API_KEY="your-key-here"
termini
```

Or add to `~/.termini/config.toml`:
```toml
[auth]
method = "api_key"
api_key_env = "GEMINI_API_KEY"
```

#### Q: Patches fail to apply

**A:** This usually happens when:
- The file has changed since context was loaded
- Line numbers in the diff are incorrect

Solution:
```bash
> /reload           # Refresh context
> Try the patch again
```

#### Q: Sandbox commands fail

**A:** Check sandbox status:
```bash
> /sandbox
```

Ensure Docker is running:
```bash
docker ps
```

Disable sandbox temporarily (not recommended):
```bash
termini --no-sandbox
```

#### Q: Out of memory errors

**A:** Reduce context size:
```bash
# Limit files in context
termini --files src/api/,src/services/ "Task"

# Use smaller model
termini -m gemini-2.5-flash "Task"
```

---

## Contributing

We welcome contributions! Termini is fully open source (Apache 2.0).

### Ways to Contribute

1. **Report bugs**: Use `/bug` command or [GitHub Issues](https://github.com/yourusername/termini-cli/issues)
2. **Suggest features**: Open a feature request
3. **Improve docs**: Fix typos, add examples
4. **Submit code**: Fix bugs, add features
5. **Share examples**: Contribute AGENTS.md templates

### Development Setup

See [Development Guide](#development-guide) above.

### Pull Request Guidelines

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow code style guidelines
4. **Add tests**: Ensure >80% coverage
5. **Update docs**: Keep AGENTS.md in sync
6. **Commit**: Use conventional commits (feat:, fix:, docs:)
7. **Push**: `git push origin feature/amazing-feature`
8. **Open PR**: Provide clear description and context

### Code Style

- **TypeScript**: Strict mode, no `any`
- **Formatting**: Prettier with 2 spaces, single quotes
- **Linting**: ESLint with recommended rules
- **Naming**: camelCase for functions, PascalCase for classes
- **Comments**: JSDoc for public APIs

### Testing Requirements

- **Unit tests**: All utility functions
- **Integration tests**: Agent loop, tool execution
- **E2E tests**: Full workflows (suggest, auto-edit, full-auto)
- **Coverage**: Aim for >80%

---

## Roadmap

### Phase 1: Core Features ✅ (Complete)
- [x] Basic agent loop
- [x] Gemini API integration
- [x] Patch-based editing
- [x] Approval modes (suggest/auto-edit/full-auto)
- [x] AGENTS.md context files
- [x] Sandbox execution
- [x] Checkpoint system

### Phase 2: Advanced Features 🚧 (In Progress)
- [x] MCP server support
- [x] Multi-modal inputs (images, screenshots)
- [ ] IDE integration (VS Code, Cursor)
- [ ] Git workflow automation
- [ ] Multi-model support (Gemini 2.0, 1.5)

### Phase 3: Collaboration 📋 (Planned)
- [ ] Team shared contexts
- [ ] Usage analytics dashboard
- [ ] Shared checkpoints
- [ ] Enterprise SSO
- [ ] Audit logging

### Phase 4: AI Enhancements 🔮 (Future)
- [ ] Multi-agent orchestration
- [ ] Autonomous debugging
- [ ] Voice interface
- [ ] Code generation from designs
- [ ] Performance optimization agent

---

## Resources

- **GitHub Repository**: https://github.com/yourusername/termini-cli
- **NPM Package**: https://www.npmjs.com/package/termini-cli
- **Gemini API Docs**: https://ai.google.dev/docs
- **MCP Protocol**: https://modelcontextprotocol.io
- **Issue Tracker**: https://github.com/yourusername/termini-cli/issues
- **Discussions**: https://github.com/yourusername/termini-cli/discussions

---

## License

**Apache License 2.0** - see [LICENSE](LICENSE) file for details.

You are free to:
- Use Termini commercially
- Modify and distribute
- Patent use
- Private use

Under these conditions:
- Include copyright notice
- Include license text
- State changes made
- Include NOTICE file if provided

---

## Acknowledgments

Built with ❤️ by the open source community.

**Inspired by:**
- [Google Gemini CLI](https://github.com/google-gemini/gemini-cli) - Architecture patterns
- The terminal-first development philosophy
- The agentic AI movement

**Special Thanks:**
- Google Gemini team for the excellent API
- The Node.js and TypeScript communities
- All contributors and early adopters
- Open source maintainers everywhere

**Powered by:**
- [Gemini API](https://ai.google.dev) - Language model
- [Ink](https://github.com/vadimdemedes/ink) - Terminal UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Docker](https://www.docker.com/) - Sandboxing

---

## Ready to Start Coding?

```bash
# Install Termini
npm install -g termini-cli

# Set your API key
export GEMINI_API_KEY="your-key-here"

# Start building
cd your-project
termini "Let's build something amazing!"
```

🚀 **Happy coding with Termini!**

---

## Complete Implementation Files

Now I'll provide all the core implementation files you need to get Termini running. These are production-ready TypeScript files that you can drop into your project.

### File 1: `package.json`

```json
{
  "name": "termini-cli",
  "version": "0.1.0",
  "description": "A Gemini-powered coding agent for your terminal",
  "type": "module",
  "bin": {
    "termini": "./dist/bin/termini.js"
  },
  "scripts": {
    "build": "tsc && chmod +x dist/bin/termini.js",
    "dev": "tsc --watch",
    "start": "node dist/bin/termini.js",
    "test": "jest",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist/"
  },
  "keywords": [
    "ai",
    "gemini",
    "cli",
    "coding-agent",
    "terminal",
    "automation"
  ],
  "author": "Your Name",
  "license": "Apache-2.0",
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "chalk": "^5.3.0",
    "commander": "^12.1.0",
    "dotenv": "^16.4.5",
    "inquirer": "^10.0.0",
    "ink": "^5.0.1",
    "ink-text-input": "^6.0.0",
    "meow": "^13.2.0",
    "ora": "^8.0.1",
    "react": "^18.3.1",
    "toml": "^3.0.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.3",
    "@typescript-eslint/eslint-plugin": "^7.13.0",
    "@typescript-eslint/parser": "^7.13.0",
    "eslint": "^8.57.0",
    "jest": "^29.7.0",
    "prettier": "^3.3.2",
    "ts-jest": "^29.1.5",
    "typescript": "^5.5.2"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### File 2: `bin/termini.js`

```javascript
#!/usr/bin/env node

import('../dist/cli.js')
  .then(({ main }) => main())
  .catch((error) => {
    console.error('Failed to start Termini:', error);
    process.exit(1);
  });
```

### File 3: `src/cli.ts`

```typescript
import meow from 'meow';
import { render } from 'ink';
import React from 'react';
import App from './app.js';
import { loadConfig } from './utils/config/loader.js';
import { authenticate } from './utils/gemini/auth.js';

const cli = meow(
  `
  Usage
    $ termini [prompt]

  Options
    -m, --model <name>        Gemini model (default: gemini-2.5-pro)
    --suggest                 Use suggest mode (review all changes)
    --auto-edit               Use auto-edit mode (auto-apply patches)
    --full-auto               Use full-auto mode (fully autonomous)
    --files <paths>           Include specific files (comma-separated)
    --context <file>          Load additional context file
    --no-sandbox              Disable sandbox (dangerous!)
    --debug                   Enable debug logging
    --version                 Show version
    --help                    Show help

  Examples
    $ termini
    $ termini "Add user authentication"
    $ termini --auto-edit "Refactor the API layer"
    $ termini --files src/app.ts "Review this file"
`,
  {
    importMeta: import.meta,
    flags: {
      model: {
        type: 'string',
        shortFlag: 'm',
        default: 'gemini-2.5-pro',
      },
      suggest: {
        type: 'boolean',
        default: false,
      },
      autoEdit: {
        type: 'boolean',
        default: false,
      },
      fullAuto: {
        type: 'boolean',
        default: false,
      },
      files: {
        type: 'string',
      },
      context: {
        type: 'string',
      },
      sandbox: {
        type: 'boolean',
        default: true,
      },
      debug: {
        type: 'boolean',
        default: false,
      },
    },
  }
);

export async function main() {
  try {
    const config = await loadConfig();
    await authenticate(config);

    const initialPrompt = cli.input.join(' ');

    let mode: 'suggest' | 'auto-edit' | 'full-auto' = 'suggest';
    if (cli.flags.fullAuto) mode = 'full-auto';
    else if (cli.flags.autoEdit) mode = 'auto-edit';
    else if (cli.flags.suggest) mode = 'suggest';
    else mode = config.behavior.default_mode || 'suggest';

    render(
      React.createElement(App, {
        config,
        initialPrompt,
        mode,
        model: cli.flags.model,
        files: cli.flags.files?.split(','),
        contextFile: cli.flags.context,
        sandboxEnabled: cli.flags.sandbox,
        debug: cli.flags.debug,
      })
    );
  } catch (error) {
    console.error('Error starting Termini:', error);
    process.exit(1);
  }
}
```

### File 4: `src/app.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import TerminalChat from './components/chat/TerminalChat.js';
import Header from './components/ui/Header.js';
import StatusBar from './components/ui/StatusBar.js';
import { AgentLoop } from './utils/agent/agent-loop.js';
import { loadContext } from './utils/context/loader.js';
import type { Config } from './types/config.js';

interface AppProps {
  config: Config;
  initialPrompt?: string;
  mode: 'suggest' | 'auto-edit' | 'full-auto';
  model: string;
  files?: string[];
  contextFile?: string;
  sandboxEnabled: boolean;
  debug: boolean;
}

const App: React.FC<AppProps> = ({
  config,
  initialPrompt,
  mode,
  model,
  files,
  contextFile,
  sandboxEnabled,
  debug,
}) => {
  const [agentLoop, setAgentLoop] = useState<AgentLoop | null>(null);
  const [context, setContext] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      try {
        // Load context from AGENTS.md files
        const loadedContext = await loadContext({
          additionalFiles: contextFile ? [contextFile] : [],
          includeFiles: files,
        });
        setContext(loadedContext);

        // Initialize agent loop
        const agent = new AgentLoop({
          config,
          mode,
          model,
          context: loadedContext,
          sandboxEnabled,
          debug,
        });
        setAgentLoop(agent);

        setLoading(false);
      } catch (error) {
        console.error('Initialization error:', error);
        process.exit(1);
      }
    }

    initialize();
  }, []);

  if (loading || !agentLoop) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="cyan">🚀 Initializing Termini...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height="100%">
      <Header mode={mode} model={model} />
      <Box flexGrow={1}>
        <TerminalChat
          agentLoop={agentLoop}
          initialPrompt={initialPrompt}
          mode={mode}
        />
      </Box>
      <StatusBar mode={mode} model={model} sandboxEnabled={sandboxEnabled} />
    </Box>
  );
};

export default App;
```

Would you like me to continue with more implementation files? I can provide:
- The complete agent loop implementation
- Gemini client with streaming
- Patch application logic
- Context loading system
- Tool execution
- All React components
- Configuration system
- Sandbox setup

Let me know which files you'd like to see next!
