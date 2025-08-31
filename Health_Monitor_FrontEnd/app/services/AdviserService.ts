type VitalKey = 'heartRate' | 'temperature' | 'roomTemperature' | 'humidity' | 'oxygen';

type SeverityLevel = 'critical' | 'warning' | 'mild' | 'good';

interface AdviceWithSeverity {
  criticalLow: string;
  warningLow: string;
  mildLow: string;
  good: string;
  mildHigh: string;
  warningHigh: string;
  criticalHigh: string;
}

const vitalRanges: Record<VitalKey, {
  criticalLow: number;
  warningLow: number;
  goodRange: [number, number];
  warningHigh: number;
  criticalHigh: number;
}> = {
  heartRate: {
    criticalLow: 40,
    warningLow: 50,
    goodRange: [60, 100],
    warningHigh: 120,
    criticalHigh: 140,
  },
  oxygen: {
    criticalLow: 88,
    warningLow: 92,
    goodRange: [95, 100],
    warningHigh: 100,
    criticalHigh: 100,
  },
  temperature: {
    criticalLow: 35.0,
    warningLow: 36.0,
    goodRange: [36.5, 37.5],
    warningHigh: 38.5,
    criticalHigh: 40.0,
  },
  roomTemperature: {
    criticalLow: 10,
    warningLow: 16,
    goodRange: [20, 25],
    warningHigh: 30,
    criticalHigh: 35,
  },
  humidity: {
    criticalLow: 10,
    warningLow: 20,
    goodRange: [30, 60],
    warningHigh: 80,
    criticalHigh: 90,
  },
};

const adviceData: Record<VitalKey, AdviceWithSeverity> = {
  heartRate: {
    criticalLow: 'CRITICAL: Extremely low heart rate. Seek immediate medical attention if you feel dizzy or weak.',
    warningLow: 'Heart rate is quite low. Monitor for dizziness or fatigue. Consider consulting a healthcare provider.',
    mildLow: 'Heart rate slightly below normal. Stay alert for unusual symptoms like weakness.',
    good: 'Heart rate is in the healthy range. Regular exercise helps maintain this level.',
    mildHigh: 'Heart rate slightly elevated. Could be due to activity, caffeine, or stress. Try deep breathing.',
    warningHigh: 'Heart rate is quite high. If not exercising, try to relax and hydrate.',
    criticalHigh: 'CRITICAL: Very high heart rate. Seek medical attention if experiencing chest pain or dizziness.',
  },
  oxygen: {
    criticalLow: 'CRITICAL: Dangerously low oxygen levels. Seek immediate medical attention.',
    warningLow: 'Low oxygen saturation. Sit upright, breathe deeply, ensure good ventilation.',
    mildLow: 'Oxygen levels slightly low. Take deep breaths in a well-ventilated area.',
    good: 'Oxygen saturation is excellent. Your cardiovascular system is working efficiently.',
    mildHigh: 'Oxygen levels are optimal. This is not a concern.',
    warningHigh: 'High oxygen levels are typically not problematic.',
    criticalHigh: 'Very high oxygen levels are rare and usually not concerning.',
  },
  temperature: {
    criticalLow: 'CRITICAL: Dangerously low body temperature. Seek medical attention and warm up gradually.',
    warningLow: 'Body temperature is low. Stay in a warm environment and wear appropriate clothing.',
    mildLow: 'Temperature slightly below normal. Make sure you stay warm.',
    good: 'Body temperature is normal. Your thermoregulation is working effectively.',
    mildHigh: 'Temperature slightly elevated. Stay hydrated and rest if needed.',
    warningHigh: 'Moderate fever detected. Rest, drink fluids, and monitor symptoms.',
    criticalHigh: 'CRITICAL: Very high fever. Seek immediate medical attention.',
  },
  roomTemperature: {
    criticalLow: 'CRITICAL: Extremely cold environment. Increase heating immediately.',
    warningLow: 'Room is quite cold. Consider increasing heating for comfort.',
    mildLow: 'Room is a bit cool. A warmer environment might improve comfort.',
    good: 'Perfect room temperature. This promotes good sleep and focus.',
    mildHigh: 'Room is getting warm. Consider improving ventilation.',
    warningHigh: 'Room is quite hot. Use air conditioning or fans to cool down.',
    criticalHigh: 'CRITICAL: Dangerously hot environment. Cool the room immediately.',
  },
  humidity: {
    criticalLow: 'CRITICAL: Extremely dry air. Use a humidifier immediately.',
    warningLow: 'Very low humidity. Can cause dry skin and irritated airways. Consider a humidifier.',
    mildLow: 'Air is a bit dry. A humidifier could help improve comfort.',
    good: 'Ideal humidity level. This supports respiratory health and comfort.',
    mildHigh: 'Humidity is getting high. Consider improving ventilation.',
    warningHigh: 'High humidity detected. Use a dehumidifier or improve ventilation.',
    criticalHigh: 'CRITICAL: Extremely high humidity. Address immediately to prevent health issues.',
  },
};

const getSeverityLevel = (vital: VitalKey, value: number): SeverityLevel => {
  const ranges = vitalRanges[vital];
  
  if (value <= ranges.criticalLow || value >= ranges.criticalHigh) {
    return 'critical';
  } else if (value <= ranges.warningLow || value >= ranges.warningHigh) {
    return 'warning';
  } else if (value < ranges.goodRange[0] || value > ranges.goodRange[1]) {
    return 'mild';
  } else {
    return 'good';
  }
};

export const getRuleBasedAdvice = (vital: VitalKey, value: number, goodRange: [number, number]): string => {
  const ranges = vitalRanges[vital];
  const advice = adviceData[vital];
  
  if (value <= ranges.criticalLow) {
    return advice.criticalLow;
  } else if (value >= ranges.criticalHigh) {
    return advice.criticalHigh;
  }
  
  else if (value <= ranges.warningLow) {
    return advice.warningLow;
  } else if (value >= ranges.warningHigh) {
    return advice.warningHigh;
  }
  
  else if (value < ranges.goodRange[0]) {
    return advice.mildLow;
  } else if (value > ranges.goodRange[1]) {
    return advice.mildHigh;
  }
  
  else {
    return advice.good;
  }
};

export const getAdviceSeverity = (vital: VitalKey, value: number): SeverityLevel => {
  return getSeverityLevel(vital, value);
};


