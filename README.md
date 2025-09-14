# 🎲 Poker Game

A full-stack multiplayer **Poker Game** with backend (FastAPI), frontend (Next.js), and database (PostgreSQL), all orchestrated with Docker. The project also integrates **LLM bots** to automatically simulate other players, making the game interactive even in single-player mode.

---

## 🚀 Tech Stack

- **Backend:** FastAPI (Python)  
- **Frontend:** Next.js (React)  
- **Database:** PostgreSQL  
- **Orchestration:** Docker & Docker Compose  
- **AI Players:** LLM-based bots (via `.env` configs)  

---

## ✨ Features

- Multiplayer Texas Hold’em style poker.  
- REST API endpoints for creating games, dealing cards, and making player actions.  
- Automatic LLM-powered bots to simulate opponents.  
- Frontend built with Next.js for smooth gameplay experience.  
- Dockerized for easy deployment (single command setup).  

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Ola-je/poker-game.git
cd poker-game
```

### 2. Configure environment variables

A `.env` file is included in the repo (to support the LLM bots).  
- If you are running this in a **course / test environment**, no changes are needed.  
- If you want to run your own LLM bots, update the `.env` file with your API keys and configuration.  

Example `.env`:

```env
OPENAI_API_KEY=your_api_key_here
BOT_DIFFICULTY=medium
```

### 3. Start with Docker

```bash
docker-compose up --build
```

This will start:  
- **Backend** → http://localhost:8000  
- **Frontend** → http://localhost:3000  
- **Database** → localhost:5432  

### 4. Local (without Docker)

If you prefer to run services separately:  

#### Backend

```bash
cd poker-backend
poetry install
poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd poker-frontend
npm install
npm run dev
```

---

## 🎮 How to Play

1. Open the frontend at: [http://localhost:3000](http://localhost:3000).  
2. Create a new hand → `/hands` (backend endpoint).  
3. Add players (you + bots).  
4. Start the game → cards will be dealt, actions available.  
5. Play your moves, bots will respond automatically.  

---

## 📌 Notes

- Since LLM bots are used, `.env` variables are **pushed in this repo** for transparency and testing.  
- In a production environment, `.env` should not be committed (contains sensitive keys).  
- Make sure to restart the backend if you change `.env` values:  

```bash
docker-compose restart poker-backend
```

---

## 🧪 Running Tests

Backend unit tests are written with **pytest**.

```bash
cd poker-backend
poetry run pytest
```

---

## 👤 Author

Eyerusalem Gebrekirstos – kidanejerry523@gmail.com
