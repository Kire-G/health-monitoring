type VitalKey = 'heartRate' | 'temperature' | 'roomTemperature' | 'humidity' | 'oxygen';

interface Advice {
  low: string;
  good: string;
  high: string;
}

const adviceData: Record<VitalKey, Advice> = {
  heartRate: {
    low: 'A low heart rate can be normal for athletes. If you feel dizzy or weak, consider talking to a doctor.',
    good: 'Your heart rate is in a healthy range. Regular exercise helps maintain a strong heart.',
    high: 'A high heart rate can be caused by stress or exercise. Try some deep breathing exercises to help it return to normal.',
  },
  oxygen: {
    low: 'Low oxygen levels can be serious. Ensure good ventilation or try some deep, slow breaths. Seek medical attention if it persists.',
    good: 'Your oxygen saturation is excellent. Keep up the healthy habits!',
    high: 'High oxygen levels are generally not a concern unless using supplemental oxygen.',
  },
  temperature: {
    low: 'Low body temperature? Make sure you are in a warm environment and wearing enough layers.',
    good: 'Your body temperature is normal. Your body is effectively regulating its internal thermostat.',
    high: 'A high body temperature may indicate a fever. Rest and drink plenty of fluids.',
  },
  roomTemperature: {
    low: 'The room is a bit cool. A stable, comfortable room temperature can improve sleep quality.',
    good: 'The room temperature is ideal. A comfortable environment is great for relaxation and focus.',
    high: 'The room is a bit warm. Consider improving ventilation for better comfort and air quality.',
  },
  humidity: {
    low: 'Low humidity can dry out your skin and airways. A humidifier can help add moisture to the air.',
    good: 'The humidity level is in a comfortable range. This helps maintain respiratory health.',
    high: 'High humidity can make a room feel stuffy. A dehumidifier or air conditioning can improve comfort.',
  },
};

export const getRuleBasedAdvice = (vital: VitalKey, value: number, goodRange: [number, number]): string => {
  if (value < goodRange[0]) {
    return adviceData[vital].low;
  } else if (value > goodRange[1]) {
    return adviceData[vital].high;
  } else {
    return adviceData[vital].good;
  }
};


