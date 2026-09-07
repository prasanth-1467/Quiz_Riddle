import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    mode: {
      type: String,
      enum: ['TEAM', 'INDIVIDUAL'],
      default: 'TEAM',
    },
    code: {
      type: String,
      required: true,
      unique: true,
      length: 6,
      uppercase: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    teammateNames: {
      type: [String],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    lastCorrectAt: {
      type: Date,
      default: null,
    },
    currentQuestionOrder: {
      type: Number,
      default: 1,
    },
    currentRoundOrder: {
      type: Number,
      default: 1,
    },
    completedRounds: {
      type: [Number],
      default: [],
    },
    roundResults: {
      type: [
        {
          roundOrder: { type: Number, required: true },
          correctAnswers: { type: Number, required: true },
          totalQuestions: { type: Number, required: true },
          score: { type: Number, default: 0 },
          passed: { type: Boolean, default: true },
          completedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Team', teamSchema);
