import json
import uuid
import random
import os
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.types import TypeDecorator

# Create the FastAPI application
app = FastAPI(title="GeoGuess API", description="Geography quiz game API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DB_PATH = "sqlite:///./geo_quiz.db"
db_engine = create_engine(DB_PATH)
SessionFactory = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
ModelBase = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionFactory()
    try:
        yield db
    finally:
        db.close()

# Custom JSON field handler
class JSONField(TypeDecorator):
    """Stores and retrieves JSON objects as TEXT."""
    impl = Text

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return None

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return None

# Database models
class LocationModel(ModelBase):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    location_name = Column(String(100), nullable=False, index=True)
    nation = Column(String(100), nullable=False)
    hints = Column(JSONField, nullable=False)
    interesting_facts = Column(JSONField, nullable=False)
    knowledge_bits = Column(JSONField, nullable=False)

class PlayerModel(ModelBase):
    __tablename__ = "players"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    player_name = Column(String(50), unique=True, nullable=False, index=True)
    referral_code = Column(String(20), unique=True, nullable=False)
    best_score = Column(Integer, default=0)

# Pydantic schemas for request/response
class LocationOut(BaseModel):
    id: int
    location_name: str
    nation: str
    
class QuizQuestion(BaseModel):
    id: int
    hints: List[str]
    options: List[LocationOut]
    correct_id: int
    interesting_fact: str
    knowledge_bit: str

class PlayerCreate(BaseModel):
    player_name: str = Field(..., min_length=3, max_length=50)

class PlayerOut(BaseModel):
    id: int
    player_name: str
    referral_code: str
    best_score: int

class ScoreUpdate(BaseModel):
    player_name: str
    score: int

class LeaderboardEntry(BaseModel):
    player_name: str
    best_score: int

# Data loading functions
def read_json_data(filepath):
    """Reads data from a JSON file and returns it as a list."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"[Error] File not found: {filepath}")
        return []
    except json.JSONDecodeError:
        print(f"[Error] Invalid JSON format in file: {filepath}")
        return []

def load_locations_from_json(filepath, db_session):
    """Load location data from JSON file into database"""
    locations_data = read_json_data(filepath)
    locations_added = 0
    
    for data in locations_data:
        # Map the old field names to our new model field names
        location = LocationModel(
            location_name=data.get("city"),
            nation=data.get("country"),
            hints=data.get("clues", []),
            interesting_facts=data.get("fun_fact", []),
            knowledge_bits=data.get("trivia", [])
        )
        db_session.add(location)
        locations_added += 1
        print(f"Added location: {location.location_name}, {location.nation}")
    
    if locations_added > 0:
        db_session.commit()
        print(f"Successfully added {locations_added} locations to database")
    
    return locations_added

# Database initialization
def initialize_database():
    ModelBase.metadata.create_all(bind=db_engine)
    
    # Check if database is empty and data file exists
    with SessionFactory() as session:
        if session.query(LocationModel).count() == 0:
            # Try to load from data.json in current directory
            data_file = "data.json"
            if os.path.exists(data_file):
                print(f"Loading initial data from {data_file}")
                load_locations_from_json(data_file, session)
            else:
                print(f"Warning: {data_file} not found. Database is empty.") 
                print("You can add data by running the data importer script separately.")

@app.on_event("startup")
def on_startup():
    initialize_database()

# API Endpoints
@app.get("/api/quiz/question", response_model=QuizQuestion)
def generate_quiz_question(db: Session = Depends(get_db)):
    """Generate a random quiz question with multiple choice options."""
    locations = db.query(LocationModel).all()
    
    if not locations:
        raise HTTPException(status_code=404, detail="No locations available in database")
    
    # Select target location and alternatives
    target = random.choice(locations)
    alternatives = random.sample([loc for loc in locations if loc.id != target.id], 
                              min(3, len(locations)-1))
    
    # Create options list and shuffle
    all_options = [target] + alternatives
    random.shuffle(all_options)
    
    # Select random hints and facts
    selected_hints = random.sample(target.hints, min(2, len(target.hints)))
    selected_fact = random.choice(target.interesting_facts)
    selected_knowledge = random.choice(target.knowledge_bits)
    
    return {
        "id": target.id,
        "hints": selected_hints,
        "options": [{"id": opt.id, "location_name": opt.location_name, "nation": opt.nation} 
                   for opt in all_options],
        "correct_id": target.id,
        "interesting_fact": selected_fact,
        "knowledge_bit": selected_knowledge
    }

@app.get("/api/quiz/verify/{question_id}/{answer_id}")
def verify_answer(question_id: int, answer_id: int):
    """Verify if the provided answer matches the question."""
    return {"is_correct": question_id == answer_id}

@app.post("/api/players", response_model=PlayerOut)
def register_player(player: PlayerCreate, db: Session = Depends(get_db)):
    """Register a new player."""
    existing = db.query(PlayerModel).filter(PlayerModel.player_name == player.player_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Player name already registered")
    
    # Generate unique referral code
    referral_code = f"{uuid.uuid4().hex[:8]}"
    
    new_player = PlayerModel(
        player_name=player.player_name,
        referral_code=referral_code,
        best_score=0
    )
    
    db.add(new_player)
    db.commit()
    db.refresh(new_player)
    
    return new_player

@app.get("/api/players/name/{player_name}", response_model=PlayerOut)
def get_player_by_name(player_name: str, db: Session = Depends(get_db)):
    """Retrieve player profile by player name."""
    player = db.query(PlayerModel).filter(PlayerModel.player_name == player_name).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@app.get("/api/players/code/{referral_code}", response_model=PlayerOut)
def get_player_by_code(referral_code: str, db: Session = Depends(get_db)):
    """Retrieve player profile by referral code."""
    player = db.query(PlayerModel).filter(PlayerModel.referral_code == referral_code).first()
    if not player:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    return player

@app.put("/api/players/score", response_model=Dict[str, Any])
def update_player_score(score_data: ScoreUpdate, db: Session = Depends(get_db)):
    """Update a player's score."""
    player = db.query(PlayerModel).filter(PlayerModel.player_name == score_data.player_name).first()
    
    if not player:
        # Auto-create player if not found
        referral_code = f"{uuid.uuid4().hex[:8]}"
        player = PlayerModel(
            player_name=score_data.player_name,
            referral_code=referral_code,
            best_score=score_data.score
        )
        db.add(player)
        db.commit()
        db.refresh(player)
        return {
            "player_name": player.player_name,
            "best_score": player.best_score,
            "is_personal_best": True
        }
    
    # Check if this is a new personal best
    is_personal_best = score_data.score > player.best_score
    if is_personal_best:
        player.best_score = score_data.score
        db.commit()
    
    return {
        "player_name": player.player_name,
        "best_score": player.best_score,
        "is_personal_best": is_personal_best
    }

@app.get("/api/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    """Get the top players by score."""
    top_players = db.query(PlayerModel).order_by(PlayerModel.best_score.desc()).limit(limit).all()
    
    return [
        {"player_name": player.player_name, "best_score": player.best_score}
        for player in top_players
    ]

# For development/admin purposes
@app.get("/api/admin/locations", response_model=List[Dict[str, Any]])
def list_all_locations(db: Session = Depends(get_db)):
    """List all locations in the database (admin only)."""
    locations = db.query(LocationModel).all()
    
    return [
        {
            "id": location.id,
            "location_name": location.location_name,
            "nation": location.nation,
            "hints": location.hints,
            "interesting_facts": location.interesting_facts,
            "knowledge_bits": location.knowledge_bits
        }
        for location in locations
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)