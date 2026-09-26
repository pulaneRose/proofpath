import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      default: 'Counterparty',
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    relationship: {
      type: String,
      trim: true,
      default: 'Dispute Party',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Contact = mongoose.model('Contact', ContactSchema);
