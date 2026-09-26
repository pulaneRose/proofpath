import mongoose from 'mongoose';

const metadataSchema = new mongoose.Schema(
  {
    dateTimeOriginal: { type: String, default: null },
    createDate: { type: String, default: null },
    gpsLatitude: { type: Number, default: null },
    gpsLongitude: { type: Number, default: null },
    make: { type: String, default: null },
    model: { type: String, default: null },
    orientation: { type: mongoose.Schema.Types.Mixed, default: null },
    imageWidth: { type: Number, default: null },
    imageHeight: { type: Number, default: null },
    hasGps: { type: Boolean, default: false },
    hasExif: { type: Boolean, default: false },
    rawFieldsFound: { type: [String], default: [] },
  },
  { _id: false }
);

const evidenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Evidence title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Attendance',
        'Employment',
        'Communication',
        'Payment',
        'Contract',
        'Workplace Conditions',
        'Housing',
        'Consumer',
        'Fraud',
        'Personal',
        'Other',
      ],
      default: 'Other',
    },
    tags: {
      type: [String],
      default: [],
    },
    originalFilename: {
      type: String,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
      unique: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    sha256: {
      type: String,
      required: true,
      index: true,
    },
    uploadTimestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: metadataSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

evidenceSchema.index({ userId: 1, category: 1 });
evidenceSchema.index({ userId: 1, title: 'text', description: 'text' });

export default mongoose.model('Evidence', evidenceSchema);
