export default interface HealthData {
  id?: string;
  roomTemperature: number;
  oxygen: number;
  humidity: number;
  temperature: number;
  heartRate: number;
  dateOfMeasurement: string;
}
