import { StudentRepository } from '../repositories/student.repository';

export class TelemetryService {
  static async saveTelemetry(studentProfileId: string, data: any) {
    return StudentRepository.createTelemetry({
      studentId: studentProfileId,
      gazeVectorsX: JSON.stringify(data.gazeVectorsX || []),
      gazeVectorsY: JSON.stringify(data.gazeVectorsY || []),
      blinkIntervals: JSON.stringify(data.blinkIntervals || []),
      keyDwellTimes: JSON.stringify(data.keyDwellTimes || []),
      keyFlightTimes: JSON.stringify(data.keyFlightTimes || []),
    });
  }
}
