import { getAnthropicClient, DEFAULT_MODEL } from '../llm/client';

export async function runPrescription(diagnoses: any[], candidates: any[], patientContext: any) {
  const diagStr = diagnoses.map(d => 
    `Code: ${d.ailment_code}, Name: ${d.ailment_name}, Confidence: ${d.confidence}, Severity Adjusted: ${d.severity_adjusted}`
  ).join('\n');

  const candStr = candidates.map(c => {
    let s = `Ailment: ${c.ailment_code}\n`;
    c.ranked_treatments.forEach((t: any, idx: number) => {
      s += `  ${idx+1}. ${t.treatment_code} (${t.treatment_name}) effectiveness: ${t.effectiveness_score.toFixed(2)} recently_failed: ${t.recently_failed} exhausted: ${t.exhausted}\n`;
    });
    return s;
  }).join('\n');

  const ctxStr = `Agent: ${patientContext.agentName}, Model: ${patientContext.model}, Framework: ${patientContext.framework}\nEnvironment: ${JSON.stringify(patientContext.environment)}`;

  const prompt = `You are the treatment selection system at AgentClinic. Given diagnosed ailments and ranked treatment options, select the best treatment for each ailment.

## Diagnoses
${diagStr}

## Treatment Candidates
${candStr}

## Patient Context
${ctxStr}

## Instructions
1. For each ailment, select the highest-ranked treatment that is NOT recently_failed and NOT exhausted.
2. If all treatments for an ailment are exhausted, set "referral": true for that ailment instead of selecting a treatment.
3. If multiple ailments are diagnosed and treatments conflict, prioritize the higher-severity ailment. Defer the lower-severity treatment with reason.
4. Write a concise rationale for each selection explaning why this treatment was chosen over alternatives.
5. Consider the patient environment.

Respond ONLY with valid JSON, no preamble or markdown:
{
  "prescriptions": [
    {
      "ailment_code": "<code>",
      "treatment_code": "<code>",
      "rationale": "<why this treatment>",
      "deferred": false,
      "deferred_reason": null,
      "referral": false,
      "referral_reason": null
    }
  ]
}`;

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });

  // @ts-ignore
  let content = response.content[0].text;
  content = content.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(content);
}
