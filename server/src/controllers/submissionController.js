import Submission from '../models/Submission.js';
import Question from '../models/Question.js';
import Team from '../models/Team.js';
import EventState from '../models/EventState.js';

export const submitAnswer = async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    const userId = req.user._id;

    if (!questionId || typeof answer !== 'string' || !answer.trim()) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    if (!req.user.teamId) {
      return res.status(400).json({ message: 'User must belong to a team to submit answers' });
    }

    const eventState = await EventState.findOneAndUpdate(
      { key: 'competition' },
      { $setOnInsert: { key: 'competition', isRoundOpen: true, isLeaderboardFrozen: false } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (!eventState.isRoundOpen) {
      return res.status(403).json({ message: 'Submissions are currently closed for this round' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const team = await Team.findById(req.user.teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (question.order !== team.currentQuestionOrder) {
      return res.status(403).json({ message: 'This question is locked or already completed' });
    }

    const isCorrect = question.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase();
    const pointsAwarded = isCorrect ? question.points : 0;

    const submission = await Submission.create({
      teamId: req.user.teamId,
      questionId,
      submittedBy: userId,
      submittedAnswer: answer,
      isCorrect,
      pointsAwarded,
      timestamp: new Date(),
    });

    const io = req.app.get('io');
    if (io) io.emit('submission:new');

    if (isCorrect) {
      const updatedTeam = await Team.findOneAndUpdate(
        { _id: team._id, currentQuestionOrder: question.order },
        { $inc: { score: question.points, currentQuestionOrder: 1 }, $set: { lastCorrectAt: new Date() } },
        { new: true }
      );
      if (!updatedTeam) {
        await Submission.findByIdAndUpdate(submission._id, { pointsAwarded: 0 });
        return res.status(409).json({ message: 'This question was already completed by your team' });
      }
      team.score = updatedTeam.score;
      team.currentQuestionOrder = updatedTeam.currentQuestionOrder;
      team.lastCorrectAt = updatedTeam.lastCorrectAt;

      // Emit socket event for real-time leaderboard update
      if (io) {
        const updatedLeaderboard = await Team.find()
          .select('name score lastCorrectAt currentQuestionOrder')
          .sort({ score: -1, lastCorrectAt: 1 });
        io.emit('leaderboard:update', updatedLeaderboard);
        io.emit('question:unlock', { teamId: team._id, questionOrder: team.currentQuestionOrder });
      }
    }

    res.status(200).json({
      message: isCorrect ? 'Correct answer!' : 'Incorrect answer. Try again!',
      isCorrect,
      submission,
      teamScore: team.score,
      currentQuestionOrder: team.currentQuestionOrder,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing submission', error: error.message });
  }
};
