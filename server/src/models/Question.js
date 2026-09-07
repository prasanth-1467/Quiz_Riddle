import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    roundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Round',
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['MCQ', 'RIDDLE'],
      required: true,
    },
    options: [
      {
        type: String,
      },
    ],
    correctAnswer: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

questionSchema.index({ roundId: 1, order: 1 }, { unique: true });

export default mongoose.model('Question', questionSchema);
