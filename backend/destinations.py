import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import Base, Destination

DB_URI = "sqlite:///./globetrotter.db"
engine = create_engine(DB_URI)
Session = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base.metadata.create_all(engine)

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

def insert_destinations(filepath):
    """Parses and inserts new locations to db ."""
    session = Session()
    destinations = read_json_data(filepath)

    for data in destinations:
        city_name = data.get("city")


        entry = Destination(
            city=city_name,
            country=data.get("country"),
            clues=data.get("clues"),
            fun_fact=data.get("fun_fact"),
            trivia=data.get("trivia")
        )

        session.add(entry)
        print(f"Inserted: {city_name}, {data.get('country')}")

    session.commit()
    session.close()
    print("All valid destinations have been added.")

if __name__ == "__main__":
    insert_destinations("data.json")
