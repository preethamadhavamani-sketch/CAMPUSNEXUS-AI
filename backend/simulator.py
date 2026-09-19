import json
import random
import os
from datetime import datetime

DATA_FILE = os.path.join(os.path.dirname(__file__), '../data/campus_data.json')

BUILDINGS = [
    {"name": "Main Block", "baseline_energy": 400, "baseline_occupancy": 60, "baseline_waste": 50},
    {"name": "ECE Block", "baseline_energy": 350, "baseline_occupancy": 60, "baseline_waste": 50},
    {"name": "CSE Block", "baseline_energy": 380, "baseline_occupancy": 60, "baseline_waste": 50},
    {"name": "Library", "baseline_energy": 250, "baseline_occupancy": 50, "baseline_waste": 40},
    {"name": "Laboratory Block", "baseline_energy": 450, "baseline_occupancy": 40, "baseline_waste": 60},
    {"name": "Hostel", "baseline_energy": 500, "baseline_occupancy": 80, "baseline_waste": 70},
]

def generate_simulated_data():
    current_hour = datetime.now().hour
    is_operating_hours = 8 <= current_hour <= 18
    
    campus_data = []
    
    for building in BUILDINGS:
        # Base variations
        occupancy_variation = random.randint(-30, 40)
        
        if not is_operating_hours and building["name"] != "Hostel":
            occupancy = random.randint(5, 20)
        else:
            occupancy = building["baseline_occupancy"] + occupancy_variation
            
        occupancy = max(0, min(100, occupancy))
        
        # Energy generally correlates with occupancy, but with some randomness to create anomalies
        energy_variation = (occupancy - building["baseline_occupancy"]) * 2 + random.randint(-50, 150)
        energy = building["baseline_energy"] + energy_variation
        energy = max(100, energy)
        
        # Waste generally correlates with occupancy
        waste_variation = (occupancy - building["baseline_occupancy"]) * 0.5 + random.randint(-20, 30)
        waste = building["baseline_waste"] + waste_variation
        waste = max(0, min(100, waste))
        
        b_data = {
            "name": building["name"],
            "energy_kwh": int(energy),
            "baseline_energy": building["baseline_energy"],
            "occupancy_percent": int(occupancy),
            "baseline_occupancy": building["baseline_occupancy"],
            "waste_fill_percent": int(waste),
            "baseline_waste": building["baseline_waste"],
            "status": "Normal" # Will be updated by analyzer
        }
        campus_data.append(b_data)
        
    data_payload = {
        "timestamp": datetime.now().isoformat(),
        "buildings": campus_data
    }
    
    with open(DATA_FILE, 'w') as f:
        json.dump(data_payload, f, indent=4)
        
    return data_payload

def get_current_data():
    if not os.path.exists(DATA_FILE):
        return generate_simulated_data()
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

if __name__ == "__main__":
    print(generate_simulated_data())
