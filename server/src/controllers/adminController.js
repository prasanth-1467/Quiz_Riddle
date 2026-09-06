import EventState from '../models/EventState.js';
import Team from '../models/Team.js';
import Submission from '../models/Submission.js';

export const getEventState = async (req, res) => {
  try {
    let state = await EventState.findOne();
    if (!state) {
      state = await EventState.create({ isRoundOpen: true, isLeaderboardFrozen: false });
    }
    res.status(200).json({ eventState: state });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event state', error: error.message });
  }
};

export const updateEventState = async (req, res) => {
  try {
    const { isRoundOpen, isLeaderboardFrozen } = req.body;
    let state = await EventState.findOne();
    
    if (!state) {
      state = new EventState();
    }

    if (typeof isRoundOpen === 'boolean') state.isRoundOpen = isRoundOpen;
    if (typeof isLeaderboardFrozen === 'boolean') state.isLeaderboardFrozen = isLeaderboardFrozen;

    await state.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('eventState:update', state);
    }

    res.status(200).json({ message: 'Event state updated', eventState: state });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event state', error: error.message });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('teamId', 'name')
      .populate('questionId', 'title order')
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ submissions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
};
