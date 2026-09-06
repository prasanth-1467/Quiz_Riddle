import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
  },
  { timestamps: true }
);

export default mongoose.model('Team', teamSchema);
