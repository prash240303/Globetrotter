# 🌍 Globetrotter

Globetrotter is a full-stack geography quiz game that challenges users to guess locations based on hints, facts, and trivia. It features a FastAPI-powered backend with a React frontend styled using TailwindCSS and ShadCN.

---

## 🔧 Tech Stack

### Backend
- 🔥 FastAPI (Python)
- 📦 SQLite 
- 🌐 CORS support

### Frontend
- ⚛️ React
- 💨 TailwindCSS
- 🧩 ShadCN UI Components

---

## 📁 Project Structure

```
📦 globetrotter
├── backend
│   ├── main.py        # FastAPI app with database, routes, and scheduler
│   ├── data.json      # Initial location data (city, clues, trivia)
│   └── geo_quiz.db    # SQLite DB (auto-created)
└── frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── ...
    ├── tailwind.config.js
    └── ...
```

---

## 🚀 Getting Started

### Backend

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the server:

```bash
uvicorn app:app --reload
```

API available at: `http://localhost:8000`

### Frontend

1. Navigate to the frontend folder:

```bash
cd frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 📌 Features

- ✨ Random geography-based quiz questions
- 📊 Leaderboard with best scores
- 💡 Trivia, hints, and facts per location
- 🧠 Persistent player data with referral codes
- 🔄 Cron job to keep backend alive (for free-tier hosting on Render)

---


## 📬 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/quiz/question` | Get a new quiz question |
| GET    | `/api/quiz/verify/{question_id}/{answer_id}` | Verify answer |
| POST   | `/api/players` | Register a new player |
| PUT    | `/api/players/score` | Update a player's score |
| GET    | `/api/players/name/{player_name}` | Get player by name |
| GET    | `/api/leaderboard` | Get top scores |
| GET    | `/api/admin/locations` | Admin view: all locations |

---

## 📄 License

MIT License
