import EventState from '../models/EventState.js';
import Team from '../models/Team.js';
import Submission from '../models/Submission.js';
import Round from '../models/Round.js';
import Question from '../models/Question.js';

export const getEventState = async (req, res) => {
  try {
    const state = await EventState.findOneAndUpdate(
      { key: 'competition' },
      { $setOnInsert: { key: 'competition', isRoundOpen: true, isLeaderboardFrozen: false } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ eventState: state });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event state', error: error.message });
  }
};

export const updateEventState = async (req, res) => {
  try {
    const { isRoundOpen, isLeaderboardFrozen } = req.body;
    const updates = {};
    if (typeof isRoundOpen === 'boolean') updates.isRoundOpen = isRoundOpen;
    if (typeof isLeaderboardFrozen === 'boolean') updates.isLeaderboardFrozen = isLeaderboardFrozen;

    const state = await EventState.findOneAndUpdate(
      { key: 'competition' },
      { $set: updates, $setOnInsert: { key: 'competition', isRoundOpen: true, isLeaderboardFrozen: false } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

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

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members', 'name email')
      .select('name code members teammateNames score currentQuestionOrder currentRoundOrder completedRounds lastCorrectAt')
      .sort({ score: -1, lastCorrectAt: 1 });
    const rounds = await Round.find().sort({ order: 1 }).lean();
    const questionCounts = await Question.aggregate([{ $group: { _id: '$roundId', total: { $sum: 1 } } }]);
    const countByRound = Object.fromEntries(questionCounts.map((item) => [String(item._id), item.total]));
    const progress = await Promise.all(teams.map(async (team) => {
      const roundProgress = await Promise.all(rounds.map(async (round) => {
        const correctQuestions = await Submission.distinct('questionId', { teamId: team._id, roundId: round._id, isCorrect: true });
        const correctCount = correctQuestions.length;
        const scoreResult = await Submission.aggregate([
          { $match: { teamId: team._id, roundId: round._id, isCorrect: true } },
          { $group: { _id: null, total: { $sum: '$pointsAwarded' } } },
        ]);
        return {
        roundId: round._id,
        order: round.order,
        title: round.title,
        totalQuestions: countByRound[String(round._id)] || 0,
        correctQuestions: correctCount,
        earnedPoints: scoreResult[0]?.total || 0,
        passingMark: round.passingMark,
        passed: (team.completedRounds || []).includes(round.order),
        };
      }));
      return { ...team.toObject(), roundProgress };
    }));
    res.status(200).json({ teams: progress, rounds });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
};

export const resetTeamProgress = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { score: 0, currentQuestionOrder: 1, currentRoundOrder: 1, completedRounds: [], roundResults: [], lastCorrectAt: null },
      { new: true }
    );
    if (!team) return res.status(404).json({ message: 'Team not found' });
    await Submission.deleteMany({ teamId: team._id });

    const io = req.app.get('io');
    if (io) {
      const leaderboard = await Team.find()
        .select('name score lastCorrectAt currentQuestionOrder')
        .sort({ score: -1, lastCorrectAt: 1 });
      io.emit('leaderboard:update', leaderboard);
      io.emit('team:update', { teamId: team._id, score: team.score, currentQuestionOrder: team.currentQuestionOrder });
    }

    res.status(200).json({ message: 'Team progress reset', team });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting team progress', error: error.message });
  }
};
