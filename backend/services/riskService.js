/**
 * Terrain-Aware Risk Service
 * Calculates erosion and landslide risks for hilly regions
 */

const calculateErosionRisk = (sensorData, user) => {
    const { soilMoisture, rainfall } = sensorData;
    const { slopeAngle = 0, soilType = 'Loamy' } = user.farmDetails || {};

    // Base risk calculation logic
    // Higher slope = Higher risk
    // Higher moisture + Higher rainfall = Critical risk on steep slopes

    let riskScore = 0;

    // 1. Slope Factor (0-40 points)
    // Risks start increasing significantly after 15 degrees
    if (slopeAngle > 15) {
        riskScore += Math.min(40, (slopeAngle - 15) * 1.5);
    }

    // 2. Moisture Factor (0-30 points)
    // Saturated soil on slopes is a primary trigger for landslides
    // Added base moisture sensitivity to show dynamic behavior at all moisture levels
    if (soilMoisture > 0) {
        riskScore += (soilMoisture / 100) * 15; // Base moisture risk
    }
    if (soilMoisture > 50) {
        riskScore += ((soilMoisture - 50) / 50) * 15; // Extra risk for high moisture
    }

    // 3. Rainfall Intensity Factor (0-30 points)
    // Recent heavy rainfall adds significant weight
    if (rainfall > 0) {
        riskScore += Math.min(30, rainfall * 2);
    }

    // 4. Soil Type Multiplier
    const soilMultipliers = {
        'Sandy': 1.2, // High erosion
        'Silty': 1.1,
        'Loamy': 1.0,
        'Clay': 0.8, // More stable but prone to slips when saturated
        'Peaty': 1.3, // Highly unstable
        'Saline': 1.0
    };

    riskScore = riskScore * (soilMultipliers[soilType] || 1.0);

    // Cap at 100
    riskScore = Math.min(100, Math.round(riskScore));

    // Determine Level
    let riskLevel = 'Low';
    if (riskScore > 80) riskLevel = 'Critical';
    else if (riskScore > 60) riskLevel = 'High';
    else if (riskScore > 30) riskLevel = 'Medium';

    return {
        score: riskScore,
        level: riskLevel,
        factors: {
            slope: slopeAngle,
            moisture: soilMoisture,
            rainfall: rainfall,
            soil: soilType
        }
    };
};

module.exports = {
    calculateErosionRisk
};
