# Regulated Healthcare AI

## Trigger Conditions

[client] is navigating AI deployment in a context that touches clinical data, patient information, healthcare regulations, or multi-jurisdiction compliance. Questions like "can we connect Zendesk to Claude given patient data," "what are the PHI implications of meeting transcripts," "how does the acquisition affect our data governance."

## Marty-Specific Lens

> **Context hook:** [Describe your own situation here — e.g. a digital health company operating across multiple jurisdictions (say, Australia and the UK), with several brands serving patients, recently acquired by a larger US-based, publicly traded company.]

An AI rollout in this kind of context must navigate:
- Patient data protection across multiple jurisdictions
- Clinical workflow integration where errors have real health consequences
- Regulatory bodies that may not have caught up to AI-in-healthcare
- An acquisition that introduces new regulatory requirements (e.g. HIPAA) alongside existing obligations (e.g. Australian Privacy Act and APPs, UK GDPR and Data Protection Act 2018)

[client]'s values that shape this:
- **Data validates intuition** — privacy risk is not solved by gut feel. It requires specific analysis of data flows.
- **Honesty and directness** — if a use case can't be done safely, say so. Don't promise "we'll figure it out."

## Required Source Material

- Your AI adoption strategy document (specifically: its sensitive data section, support-ticket scoping, clinical audit use cases, meeting recording governance)
- Any risk audit of the program (especially where clinical/PHI data remains an unresolved technical risk)

## Core Knowledge

### The PHI Line

Any data that can identify a patient combined with information about their health condition, treatment, or interaction with a health service is protected health information. This includes:
- Names, dates of birth, contact details, Medicare numbers
- Consultation notes, prescriptions, clinical records
- Support tickets that reference a patient's condition or treatment
- Meeting transcripts that discuss specific patient cases

The line is not "obviously medical data." It includes anything that, in combination, could identify a patient and reveal something about their health.

### The Zendesk Problem

Zendesk tickets in a health company almost certainly contain PHI. A support ticket saying "my medication hasn't arrived" combined with customer details is PHI. Connecting Zendesk to Claude without a data classification and access control layer is a regulatory risk. Adoption strategies often acknowledge this ("design details to follow in a separate working session") while the design never actually gets done.

This is not a reason to block the use case. It is a reason to scope it carefully: what data is exposed, what classification rules apply, who has access to the AI output, and what audit trail exists.

### Meeting Recording Governance

Recording all meetings by default is the most invasive change in the adoption strategy. It requires:
- Clear opt-out policy with published exceptions (clinical consults, 1:1s, HR matters, PHI discussions)
- Informed consent mechanism (not just "recording is on by default")
- Transcript storage with access controls
- Retention policy (how long are transcripts kept?)
- Cross-jurisdiction compliance (Australian vs UK vs potentially US privacy law)

This is a change management challenge as much as a technical one. People will resist. The resistance is legitimate if governance isn't clear.

### Multi-Jurisdiction Complexity

A company operating across multiple jurisdictions (e.g. Australia and the UK), with an acquisition introducing a third (e.g. the US), faces regimes with different:
- Data protection frameworks (Privacy Act + APPs, UK GDPR, HIPAA)
- Consent requirements
- Data residency expectations
- Breach notification obligations
- Regulatory bodies and enforcement postures

AI tools that process data across jurisdictions must comply with the most restrictive applicable regime for that data category.

### The "We'll Figure It Out Later" Risk

The most dangerous pattern in regulated healthcare AI: deploying the tool now and designing the governance later. If patient data flows through Claude before classification and access controls exist, the regulatory exposure is created in the gap — even if governance is added later. Retroactive compliance doesn't undo the exposure.

## Out of Scope

- Specific legal advice on regulatory compliance (escalate to legal/compliance team)
- Clinical AI safety (model accuracy, clinical decision support regulations)
- Detailed technical architecture of data classification systems
- Specific parent-company integration requirements (these need direct investigation)
