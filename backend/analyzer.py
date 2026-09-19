def analyze_energy(building):
    energy = building["energy_kwh"]
    baseline = building["baseline_energy"]
    diff = ((energy - baseline) / baseline) * 100
    
    if diff > 25:
        return {
            "title": "High Energy Consumption",
            "severity": "HIGH",
            "reason": f"{building['name']} is consuming {int(diff)}% more energy than its normal baseline.",
            "evidence": f"Current: {energy} kWh | Baseline: {baseline} kWh",
            "impact": "Higher energy consumption may increase daily operating cost.",
            "recommendation": "Check HVAC, lighting and equipment usage."
        }
    return None

def analyze_occupancy(building):
    occupancy = building["occupancy_percent"]
    
    if occupancy > 85:
        return {
            "title": "High Occupancy",
            "severity": "HIGH",
            "reason": f"Current occupancy in {building['name']} has exceeded the configured 85% threshold.",
            "evidence": f"Current: {occupancy}% | Threshold: 85%",
            "impact": "Possible classroom crowding and reduced comfort.",
            "recommendation": "Consider moving a session to an available nearby room."
        }
    return None

def analyze_waste(building):
    waste = building["waste_fill_percent"]
    
    if waste > 90:
        return {
            "title": "Waste Bin Critical",
            "severity": "HIGH",
            "reason": f"Waste bin in {building['name']} is critically full.",
            "evidence": f"Fill level: {waste}%",
            "impact": "Overflow imminent.",
            "recommendation": "Immediate waste collection required."
        }
    elif waste > 80:
        return {
            "title": "Waste Bin Nearly Full",
            "severity": "MEDIUM",
            "reason": f"Waste bin in {building['name']} has crossed the configured 80% fill threshold.",
            "evidence": f"Fill level: {waste}%",
            "impact": "Possible overflow if collection is delayed.",
            "recommendation": "Schedule waste collection."
        }
    return None

def analyze_relationships(building):
    occupancy = building["occupancy_percent"]
    energy = building["energy_kwh"]
    baseline_energy = building["baseline_energy"]
    
    if occupancy < 40 and energy > baseline_energy:
        return {
            "title": "Low Occupancy with High Energy Usage",
            "severity": "MEDIUM",
            "reason": f"{building['name']} occupancy is low while energy consumption remains above the expected level.",
            "evidence": f"Occupancy: {occupancy}% | Energy: {energy} kWh (Baseline: {baseline_energy} kWh)",
            "impact": "Possible inefficient use of lighting or HVAC.",
            "recommendation": "Consider reducing unnecessary lighting and HVAC usage."
        }
    return None

def generate_alerts(data):
    alerts = []
    from datetime import datetime
    
    for b in data.get("buildings", []):
        energy_alert = analyze_energy(b)
        if energy_alert: alerts.append(energy_alert)
        
        occ_alert = analyze_occupancy(b)
        if occ_alert: alerts.append(occ_alert)
        
        waste_alert = analyze_waste(b)
        if waste_alert: alerts.append(waste_alert)
        
        rel_alert = analyze_relationships(b)
        if rel_alert: alerts.append(rel_alert)
        
    for a in alerts:
        a["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
    return alerts

def generate_insights(data, alerts):
    insights = []
    
    for b in data.get("buildings", []):
        energy = b["energy_kwh"]
        baseline = b["baseline_energy"]
        diff = ((energy - baseline) / baseline) * 100
        
        if diff > 20:
            insights.append({
                "category": "Energy Insights",
                "problem": f"{b['name']} energy consumption is {int(diff)}% above its baseline.",
                "evidence": f"Consuming {energy} kWh versus {baseline} kWh baseline.",
                "action": "Investigate HVAC and lighting schedules.",
                "benefit": "Lower operating costs and reduce carbon footprint."
            })
            
        occ = b["occupancy_percent"]
        if occ < 30 and energy > (baseline * 0.8):
             insights.append({
                "category": "Occupancy Insights",
                "problem": f"{b['name']} occupancy is low while energy consumption remains moderate to high.",
                "evidence": f"Occupancy is {occ}% but energy is {energy} kWh.",
                "action": "Automate lighting and AC to turn off in empty zones.",
                "benefit": "Immediate energy savings."
            })
             
        waste = b["waste_fill_percent"]
        if waste > 75:
            insights.append({
                "category": "Waste Insights",
                "problem": f"Waste bins in {b['name']} are approaching the collection threshold.",
                "evidence": f"Bin is {waste}% full.",
                "action": "Route maintenance staff to clear bins soon.",
                "benefit": "Maintain campus hygiene and prevent overflow."
            })
            
    if not insights:
        insights.append({
            "category": "Resource Recommendations",
            "problem": "All systems operating within normal parameters.",
            "evidence": "No significant deviations detected.",
            "action": "Continue monitoring.",
            "benefit": "Stable campus operations."
        })
        
    return insights

def calculate_efficiency_score(data, alerts):
    # Base score is 100
    score = 100
    
    # Deduct points for alerts
    for a in alerts:
        if a["severity"] == "HIGH":
            score -= 10
        elif a["severity"] == "MEDIUM":
            score -= 5
            
    score = max(0, min(100, score))
    
    explanation = "Campus is operating efficiently."
    if score < 60:
        explanation = "Multiple high-severity inefficiencies detected."
    elif score < 80:
        explanation = "Moderate inefficiencies. Attention recommended."
        
    return {
        "score": score,
        "explanation": explanation
    }
