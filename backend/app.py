import json
import uuid
import random
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

# Sample data for initialization
SAMPLE_LOCATIONS = [
    {
        "location_name": "New York City",
        "nation": "United States",
        "hints": [
            "Often referred to as 'The Big Apple'",
            "Home to a famous green statue in the harbor"
        ],
        "interesting_facts": [
            "The subway system has over 470 stations, the most in the world",
            "Before 1904, Times Square was called Longacre Square"
        ],
        "knowledge_bits": [
            "The Empire State Building was the tallest building in the world for nearly 40 years",
            "More than 800 languages are spoken in this city, making it the most linguistically diverse in the world"
        ]
    },
    {
        "location_name": "Tokyo",
        "nation": "Japan",
        "hints": [
            "World's largest metropolitan area by population",
            "Famous for its cherry blossoms and technology districts"
        ],
        "interesting_facts": [
            "Was previously known as Edo until 1868",
            "Has over 12,000 automated vending machines throughout the city"
        ],
        "knowledge_bits": [
            "The Tsukiji fish market handles over 2,000 tons of seafood daily",
            "Contains over 100 universities and colleges"
        ]
    },
    {
        "location_name": "Paris",
        "nation": "France",
        "hints": [
            "Known worldwide as the 'City of Love'",
            "Famous for its iron lattice tower visible throughout the city"
        ],
        "interesting_facts": [
            "The Eiffel Tower was built for the 1889 World's Fair and was meant to be temporary",
            "Has more than 470 parks and gardens within the city limits"
        ],
        "knowledge_bits": [
            "The Louvre museum would take approximately 100 days to see every piece of art",
            "There are over 6,100 streets in this city"
        ]
    },
    {
        "location_name": "Cairo",
        "nation": "Egypt",
        "hints": [
            "The largest city in Africa and the Middle East",
            "Located near some of the world's most famous ancient monuments"
        ],
        "interesting_facts": [
            "Known as 'The City of a Thousand Minarets' due to its Islamic architecture",
            "The metro system is one of only two in Africa"
        ],
        "knowledge_bits": [
            "The city was founded in 969 CE",
            "Ancient pyramids are visible from certain tall buildings in the city"
        ]
    },
    {
        "location_name": "Sydney",
        "nation": "Australia",
        "hints": [
            "Famous for its distinctive opera house designed to look like sails",
            "Built around one of the world's largest natural harbors"
        ],
        "interesting_facts": [
            "The iconic Opera House has over one million roof tiles",
            "The Sydney Harbour Bridge is nicknamed 'The Coathanger'"
        ],
        "knowledge_bits": [
            "The city has over 100 beaches including the famous Bondi Beach",
            "It was founded as a British penal colony in 1788"
        ]
    }
]

# Database initialization
def initialize_database():
    ModelBase.metadata.create_all(bind=db_engine)
    
    # Add sample data if database is empty
    with SessionFactory() as session:
        if session.query(LocationModel).count() == 0:
            for location_data in SAMPLE_LOCATIONS:
                location = LocationModel(
                    location_name=location_data["location_name"],
                    nation=location_data["nation"],
                    hints=location_data["hints"],
                    interesting_facts=location_data["interesting_facts"],
                    knowledge_bits=location_data["knowledge_bits"]
                )
                session.add(location)
            session.commit()

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