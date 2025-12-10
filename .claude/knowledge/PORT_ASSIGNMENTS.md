# Port Assignments

**Last Updated:** 2025-12-10
**Purpose:** Prevent port conflicts when running multiple dev servers

---

## MNGR-replit Port Assignment

| Project | Default Port | Notes |
|---------|-------------|-------|
| **MNGR-replit** | 3002 | Unified Express + Vite server |

---

## Global Port Assignments (from Loop project)

| Project | Default Port | Notes |
|---------|-------------|-------|
| **Loop** | 3000 | Main platform |
| **IntellEvent** | 5173 | Vite default |
| **Blaise POC** | 3001 | |
| **MNGR-replit** | 3002 | This project |
| *Available* | 3003-3010 | Use for new projects |

---

## Rule for Claude Agents

**MANDATORY:** Before running `npm run dev` or starting any dev server:

1. Check `lsof -i :3002` to verify port is free
2. If occupied, kill or use next available port
3. NEVER assume any port is available

---

## This Project's Configuration

- `.env`: PORT=3002
- `.replit`: localPort = 3002
- Unified server: Express API + Vite middleware on single port
