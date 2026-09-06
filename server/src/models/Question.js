import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      required: true,
      unique: true,
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

export default mongoose.model('Question', questionSchema);
