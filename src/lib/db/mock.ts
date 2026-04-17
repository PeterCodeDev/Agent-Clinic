import { db } from './index';
import { patients, visits, ailments } from './schema';
import { v4 as uuidv4 } from 'uuid';

async function seedMocks() {
  const patientData = [
    { name: "Asistente Financiero", model: "GPT-4" },
    { name: "Chatbot de Soporte", model: "Claude-3-Sonnet" },
    { name: "Generador de Código", model: "GPT-3.5-Turbo" },
    { name: "Agente de Ventas", model: "Llama-3-70b" }
  ];

  const pIds = [];
  for (const p of patientData) {
    const pId = 'p_' + uuidv4().replace(/-/g, '').substring(0, 10);
    pIds.push(pId);
    await db.insert(patients).values({
      patientId: pId,
      agentName: p.name,
      model: p.model,
      status: 'active',
      registeredAt: new Date(Date.now() - 30 * 24*60*60*1000).toISOString(),
    });
  }

  const allAilments = await db.select().from(ailments);

  for (let i = 0; i < 25; i++) {
    const pId = pIds[Math.floor(Math.random() * pIds.length)];
    const vId = 'v_' + uuidv4().replace(/-/g, '').substring(0, 10);
    const date = new Date(Date.now() - Math.random() * 10 * 24*60*60*1000).toISOString();
    
    const states = ['RESOLVED', 'RESOLVED', 'RESOLVED', 'UNRESOLVED', 'EXPIRED', 'AWAITING_FOLLOWUP', 'DIAGNOSED'];
    const state = states[Math.floor(Math.random() * states.length)];
    
    const severity = Math.floor(Math.random() * 4) + 1; 
    
    const numAilments = Math.random() > 0.8 ? 2 : 1;
    const diags = [];
    for(let j=0; j<numAilments; j++) {
        const a = allAilments[Math.floor(Math.random() * allAilments.length)];
        diags.push({
            ailment_code: a.ailmentCode,
            ailment_name: a.ailmentName,
            confidence: parseFloat((0.5 + Math.random() * 0.4).toFixed(2))
        });
    }

    await db.insert(visits).values({
      visitId: vId,
      patientId: pId,
      state: state,
      createdAt: date,
      updatedAt: date,
      symptomText: "Mi modelo se distrae con facilidad del system prompt inicial.",
      severity: severity,
      diagnoses: JSON.stringify(diags),
    });
  }

  console.log("Mock data inserted successfully!");
}

seedMocks().catch(err => {
  console.error(err);
  process.exit(1);
});
