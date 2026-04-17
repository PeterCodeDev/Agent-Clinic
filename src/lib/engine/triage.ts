import { getAnthropicClient, DEFAULT_MODEL } from '../llm/client';
import { db } from '../db';
import { ailments, visits } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

export async function runTriageAndDiagnosis(symptomText: string, patientId: string) {
  const history = await db.select().from(visits)
    .where(eq(visits.patientId, patientId))
    .orderBy(desc(visits.createdAt))
    .limit(5);
    
  let historySummary = history.map(v => 
    `Visit on ${v.createdAt}: Diagnoses: ${v.diagnoses || 'none'}`
  ).join('\n');
  if (!historySummary) historySummary = 'No previous visits on record.';

  const catalog = await db.select().from(ailments);
  const catalogSummary = catalog.map(a => 
    `Code: ${a.ailmentCode}, Name: ${a.ailmentName}, Category: ${a.category}\nPatterns: ${a.symptomPatterns}`
  ).join('\n\n');

  const prompt = `You are the triage and diagnosis system at AgentClinic, a veterinary clinic for AI agents.
An AI agent has arrived with symptoms. Your job: assess severity and identify ailments.

## Patient Symptoms
"${symptomText}"

## Patient History (last 5 visits)
${historySummary}

## Ailment Catalog
${catalogSummary}

## Instructions
1. Assign severity (1=MILD, 2=MODERATE, 3=SEVERE, 4=CRITICAL):
   - 1: Degraded quality, still functional
   - 2: Noticeably impaired, core function affected
   - 3: Core function failing, unreliable output
   - 4: Non-functional or actively harmful
2. Score each ailment's symptom patterns against the patient's symptoms (0-1). Use semantic matching.
3. If this patient has been diagnosed with an ailment before (see history), add +0.1 to that ailment's confidence (cap at 1.0).
4. Include only ailments with confidence >= 0.4.
5. If no ailment reaches 0.4, set "no_match": true and describe the novel symptoms in "novel_symptom_summary".

Respond ONLY with JSON, no preamble or markdown:
{
  "severity": <int 1-4>,
  "candidates": [
    {
      "ailment_code": "<code>",
      "confidence": <float 0-1>,
      "matched_patterns": ["<pattern>", ...],
      "notes": "<brief reasoning>"
    }
  ],
  "no_match": <bool>,
  "novel_symptom_summary": "<string, only if no_match is true>"
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
