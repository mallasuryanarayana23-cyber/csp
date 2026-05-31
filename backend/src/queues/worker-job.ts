import { env } from '../config/env';
import { ReportRepository } from '../repositories/report.repository';
import fetch from 'node-fetch';

export const executeJob = async (data: any) => {
  const { studentId, payload, type } = data;
  console.log(`[Worker-Job] Executing AI inference for student: ${studentId}`);
  
  let endpoint = '';
  if (type === 'DYSLEXIA') endpoint = '/ai/predict/dyslexia';
  else if (type === 'ADHD') endpoint = '/ai/predict/adhd';
  else if (type === 'SPEECH') endpoint = '/ai/predict/speech-whisper';

  try {
    const response = await fetch(`${env.AI_SERVICE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`AI Service failed with status ${response.status}`);
    }

    const result: any = await response.json();
    console.log(`[Worker-Job] AI inference complete:`, result);

    const report = await ReportRepository.createAIReport({
      studentId,
      dyslexiaRisk: result.prediction === 'DYSLEXIA_SCREENING' ? result.risk_tier : 'LOW',
      dyslexiaProb: result.probability || 0,
      adhdRisk: result.prediction === 'ADHD_FOCUS_SCREENING' ? result.risk_tier : 'LOW',
      adhdProb: result.probability || 0,
      speechFluencyScore: result.fluency_score || 100,
      typingRhythmConsistency: result.cognitive_engagement_score || 100,
      attentionSpanMin: (payload.session_duration_s || 900) / 60.0,
      recommendations: JSON.stringify([
        `Automated recommendation based on ${result.risk_tier || 'normal'} findings.`,
      ]),
      cognitiveStress:
        result.risk_tier === 'HIGH'
          ? 'SEVERE'
          : result.risk_tier === 'MEDIUM'
            ? 'MODERATE'
            : 'LOW',
    });

    if (result.explainability) {
      await ReportRepository.createExplainabilityLog({
        aiModelVersion: 'ensemble-v2.0',
        predictionType: result.prediction,
        confidenceScore: 0.95,
        explanationText: result.explainability.reasoning || 'No reasoning provided.',
        featureWeights:
          result.explainability.shap_contributions ||
          result.explainability.temporal_variance ||
          {},
        aiReportId: report.id,
      });
    }

    console.log(`[Worker-Job] Saved AI Report ${report.id} to database.`);
    return report;
  } catch (err: any) {
    console.error(`[Worker-Job] Job processing failed:`, err.message);
    throw err;
  }
};
