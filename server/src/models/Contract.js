import mongoose from 'mongoose';

const ContractSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Contract title is required'],
      trim: true,
    },
    contractType: {
      type: String,
      default: 'Employment Agreement',
      trim: true,
    },
    counterpartyName: {
      type: String,
      trim: true,
      default: '',
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Draft', 'Expired', 'Disputed', 'Fulfilled', 'Terminated'],
      default: 'Active',
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    keyTerms: {
      type: String,
      default: '',
    },
    governingLaw: {
      type: String,
      default: 'State of New York',
    },
    contractBody: {
      type: String,
      default: '',
    },
    specialClauses: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    evidenceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Contract = mongoose.model('Contract', ContractSchema);
