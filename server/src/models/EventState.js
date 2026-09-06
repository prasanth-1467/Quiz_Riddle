import mongoose from 'mongoose';

const eventStateSchema = new mongoose.Schema(
  {
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
