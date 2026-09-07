import mongoose from 'mongoose';

const eventStateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'competition',
      unique: true,
    },
    isRoundOpen: {
      type: Boolean,
      default: true,
    },
    isLeaderboardFrozen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('EventState', eventStateSchema);
