from flask import Flask, jsonify, request
from flask_cors import CORS
import simulator
import analyzer

app = Flask(__name__)
CORS(app)

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    data = simulator.get_current_data()
    alerts = analyzer.generate_alerts(data)
    score = analyzer.calculate_efficiency_score(data, alerts)
    
    total_energy = sum(b['energy_kwh'] for b in data['buildings'])
    avg_occupancy = sum(b['occupancy_percent'] for b in data['buildings']) / len(data['buildings']) if data['buildings'] else 0
    avg_waste = sum(b['waste_fill_percent'] for b in data['buildings']) / len(data['buildings']) if data['buildings'] else 0
    
    # 8 cents per kWh assumption
    estimated_cost = total_energy * 0.08
    
    return jsonify({
        "timestamp": data["timestamp"],
        "total_energy": total_energy,
        "campus_occupancy": int(avg_occupancy),
        "waste_level": int(avg_waste),
        "active_alerts": len(alerts),
        "efficiency_score": score["score"],
        "score_explanation": score["explanation"],
        "estimated_daily_cost": round(estimated_cost, 2),
        "monitored_buildings": len(data['buildings']),
        "buildings": data["buildings"]
    })

@app.route('/api/energy', methods=['GET'])
def get_energy():
    data = simulator.get_current_data()
    return jsonify({"buildings": data["buildings"]})

@app.route('/api/occupancy', methods=['GET'])
def get_occupancy():
    data = simulator.get_current_data()
    return jsonify({"buildings": data["buildings"]})

@app.route('/api/waste', methods=['GET'])
def get_waste():
    data = simulator.get_current_data()
    return jsonify({"buildings": data["buildings"]})

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    data = simulator.get_current_data()
    alerts = analyzer.generate_alerts(data)
    return jsonify({"alerts": alerts})

@app.route('/api/insights', methods=['GET'])
def get_insights():
    data = simulator.get_current_data()
    alerts = analyzer.generate_alerts(data)
    insights = analyzer.generate_insights(data, alerts)
    return jsonify({"insights": insights})

@app.route('/api/what-if', methods=['POST'])
def run_what_if():
    req_data = request.json or {}
    hvac_reduction = float(req_data.get("hvac_reduction", 0)) / 100.0
    lighting_reduction = float(req_data.get("lighting_reduction", 0)) / 100.0
    occupancy_change = float(req_data.get("occupancy_change", 0)) / 100.0
    
    data = simulator.get_current_data()
    current_energy = sum(b['energy_kwh'] for b in data['buildings'])
    
    # Simple assumption: 50% energy is HVAC, 30% is lighting, 20% is other
    hvac_energy = current_energy * 0.50
    lighting_energy = current_energy * 0.30
    other_energy = current_energy * 0.20
    
    new_hvac = hvac_energy * (1 - hvac_reduction)
    new_lighting = lighting_energy * (1 - lighting_reduction)
    
    # Occupancy change affects other energy slightly
    new_other = other_energy * (1 + occupancy_change * 0.5)
    
    estimated_energy = new_hvac + new_lighting + new_other
    energy_saved = current_energy - estimated_energy
    
    # Rate of $0.08 per kWh
    electricity_rate = 0.08
    estimated_cost_saved = energy_saved * electricity_rate
    
    return jsonify({
        "current_energy": int(current_energy),
        "estimated_energy": int(estimated_energy),
        "energy_saved": int(energy_saved),
        "estimated_cost_saved": round(estimated_cost_saved, 2)
    })

@app.route('/api/simulate', methods=['POST'])
def trigger_simulation():
    data = simulator.generate_simulated_data()
    return jsonify({"status": "success", "message": "Simulation updated", "timestamp": data["timestamp"]})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
