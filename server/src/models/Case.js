import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    date: { type: String, default: 'Undated' },
    time: { type: String, default: null },
    title: { type: String, required: true },
    description: { type: String, required: true },
    sourceType: {
      type: String,
      enum: ['Evidence', 'Metadata', 'Document content', 'User statement', 'Evidentiary Finding', 'Investigative Finding', 'AI observation'],
      default: 'Evidence',
    },
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evidence',
      default: null,
    },
    evidenceRefCode: { type: String, default: null }, // e.g. E-001
    sourceDetails: { type: String, default: '' },
  },
  { _id: false }
);

const evidenceProofSchema = new mongoose.Schema(
  {
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evidence',
      default: null,
    },
    evidenceRefCode: { type: String, default: '' },
    title: { type: String, default: '' },
    relevanceAndProof: { type: String, default: '' },
    verifiableElements: { type: [String], default: [] },
    probativeValue: { type: String, default: 'Direct Corroboration' },
  },
  { _id: false }
);

const aiAnalysisSchema = new mongoose.Schema(
  {
    caseTitle: { type: String, default: '' },
    issueSummary: { type: String, default: '' },
    executiveBrief: { type: String, default: '' },
    legalClaims: { type: [String], default: [] },
    userAccount: { type: String, default: '' },
    timeline: { type: [timelineEventSchema], default: [] },
    evidenceObservations: { type: [String], default: [] },
    evidenceProofAssessments: { type: [evidenceProofSchema], default: [] },
    missingInformation: { type: [String], default: [] },
    questionsForUser: { type: [String], default: [] },
    caseAdvice: {
      strengths: { type: [String], default: [] },
      vulnerabilities: { type: [String], default: [] },
      recommendations: { type: [String], default: [] },
      credibilityScore: {
        score: { type: Number, default: 75 },
        rating: { type: String, default: 'Moderate' },
        rationale: { type: String, default: '' },
      },
      legalPreparationTips: { type: [String], default: [] },
    },
    generatedAt: { type: Date, default: null },
    provider: { type: String, default: 'local' },
    status: {
      type: String,
      enum: ['none', 'generating', 'completed', 'failed'],
      default: 'none',
    },
    errorMessage: { type: String, default: null },
  },
  { _id: false }
);

const caseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Case title is required'],
      trim: true,
      maxlength: 200,
    },
    issueType: {
      type: String,
      enum: [
        'Employment',
        'Housing',
        'Consumer',
        'Payment',
        'Fraud',
        'Contract',
        'Other',
      ],
      default: 'Employment',
    },
    userDescription: {
      type: String,
      required: [true, 'User situation description is required'],
      maxlength: 5000,
    },
    incidentDate: {
      type: String,
      default: '',
    },
    evidenceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
    aiAnalysis: {
      type: aiAnalysisSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

caseSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Case', caseSchema);
