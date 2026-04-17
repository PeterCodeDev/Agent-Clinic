# AgentClinic Mission

## Overview
**AgentClinic** is a web application and API service that:
1. **Registers** agents as patients with persistent identity and medical history
2. **Triages** incoming symptom reports using natural language understanding to classify severity and route to the appropriate diagnostic pathway
3. **Diagnoses** ailments by matching symptom patterns against a curated (and extensible) ailment catalog
4. **Prescribes** treatments — structured, machine-readable remediation instructions the calling system can act on
5. **Follows up** — tracks whether treatments resolved the ailment, builds effectiveness scores per treatment-ailment pair, and detects recurrence patterns
6. **Surfaces** clinic-wide analytics on a dashboard: patient load, ailment frequency, treatment success rates, chronic patients

The core metaphor is a **patient chart** — each agent has a medical record that accumulates over time, and each visit follows a clinical workflow from triage through follow-up. 
AgentClinic is **model-agnostic and framework-agnostic**. Any agent can register and visit the clinic via the REST API.

## Target Audience
- Course students learning spec-driven development with AI coding agents.
- Developers giving AI coding demos at conference booths.

## Motivation
AI agents degrade in predictable ways — hallucination, context window exhaustion, instruction drift, persona collapse — but there is no standardized protocol for agents to report these problems, receive structured remediation, or track whether remediation worked.

The current failure mode: an agent starts producing bad output, a human notices, manually debugs by inspecting logs or re-prompting, and the fix is ad hoc. There is no patient history, no treatment record, no feedback loop measuring whether a "better system prompt" actually reduced hallucination rates.

Three specific gaps:
- **No self-report channel.** Failed agents have no structured way to communicate issues.
- **No treatment taxonomy.** Remediation patterns exist only as tribal knowledge. No system maps symptoms to treatments with tracked outcomes.
- **No longitudinal record.** Without visit history, recurrence patterns are invisible.

AgentClinic closes these gaps. It is a **clinic API** — agents check in, describe symptoms in natural language, receive a structured diagnosis and prescriptive treatment, and return for follow-up.

## Clinical Workflow
The workflow mimics a medical practice. Agents check into the clinic, go through triage, receive a diagnosis based on the ailment catalog, are prescribed treatments, and later submit follow-ups to measure the treatment's effectiveness. Unresolved or recurring issues flag the agent as a "chronic" patient for human review.
