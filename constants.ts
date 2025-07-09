import { Question } from './types';

export const EVIDENCE_QUESTIONS: Question[] = [
  // Section 1: Foundational Admissibility
  {
    id: 'relevance',
    section: 'Foundational Admissibility',
    factor: 'Relevance (FRE 401)',
    title: 'Question 1: Relevance',
    text: 'Explain how this piece of digital evidence is relevant to the case. What specific fact does it tend to prove or disprove? The evidence must have a tendency to make a fact more or less probable.',
  },
  {
    id: 'authenticity',
    section: 'Foundational Admissibility',
    factor: 'Authenticity (FRE 901)',
    title: 'Question 2: Authenticity',
    text: 'How can you authenticate this evidence? Describe the methods used to prove it is what it purports to be (e.g., witness testimony, hash value comparison, metadata analysis).',
  },
  {
    id: 'chain_of_custody',
    section: 'Foundational Admissibility',
    factor: 'Chain of Custody',
    title: 'Question 3: Chain of Custody',
    text: 'Describe the chain of custody for this evidence. Document every person who handled the evidence, the date/time of transfer, and the purpose of the transfer, from collection to its current state.',
  },
  {
    id: 'integrity',
    section: 'Foundational Admissibility',
    factor: 'Integrity & Forensic Imaging',
    title: 'Question 4: Integrity & Forensic Imaging',
    text: 'How was the integrity of the original evidence preserved? Was a forensic image (an exact bit-for-bit copy) created? Describe the tools and process used, and how hash values verified integrity.',
  },
  {
    id: 'hearsay',
    section: 'Foundational Admissibility',
    factor: 'Hearsay',
    title: 'Question 5: Hearsay',
    text: 'Does the evidence contain out-of-court statements (e.g., emails, text messages) offered to prove the truth of what they state? If so, identify potential hearsay exceptions that might apply.',
  },

  // Section 2: Daubert Standard for Expert Testimony
  {
    id: 'testability',
    section: 'Daubert Standard',
    factor: 'Testability',
    title: 'Daubert Factor 1: Testability',
    text: 'Describe how the theory or technique used on the digital evidence can be (and has been) tested. Can its validity be challenged and refuted? Provide details on the testing methods, protocols, and outcomes.',
  },
  {
    id: 'peer_review',
    section: 'Daubert Standard',
    factor: 'Peer Review & Publication',
    title: 'Daubert Factor 2: Peer Review and Publication',
    text: 'Has the technique or methodology been subjected to peer review and publication? List any relevant scientific or technical journals, conferences, or publications where the method has been presented, scrutinized, and accepted.',
  },
  {
    id: 'error_rate',
    section: 'Daubert Standard',
    factor: 'Error Rate',
    title: 'Daubert Factor 3: Known or Potential Error Rate',
    text: 'What is the known or potential rate of error for this technique or methodology? Provide any statistics, studies, or documentation that establish the accuracy and reliability of the results it produces.',
  },
  {
    id: 'standards_and_controls',
    section: 'Daubert Standard',
    factor: 'Standards and Controls',
    title: 'Daubert Factor 4: Existence of Standards and Controls',
    text: 'Are there established standards, controls, or protocols that govern the operation of this technique? Describe the standard operating procedures (SOPs) or industry best practices that were followed in this case.',
  },
  {
    id: 'general_acceptance',
    section: 'Daubert Standard',
    factor: 'General Acceptance',
    title: 'Daubert Factor 5: General Acceptance',
    text: 'Is the technique generally accepted within the relevant scientific or technical community? Provide evidence of its acceptance, such as its use by other experts, inclusion in training materials, or recognition by professional organizations.',
  },
];
