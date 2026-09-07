import Submission from '../models/Submission.js';
import Question from '../models/Question.js';
import Team from '../models/Team.js';
import EventState from '../models/EventState.js';
import Round from '../models/Round.js';

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
    const round = await Round.findById(question.roundId);
    if (!round || round.order !== team.currentRoundOrder || !round.isOpen || question.order !== team.currentQuestionOrder) {
      return res.status(403).json({ message: 'This question is locked or already completed' });
    }

    const existingSubmission = await Submission.findOne({ teamId: team._id, questionId });
    if (existingSubmission) {
      return res.status(409).json({ message: 'You have already answered this question' });
    }

    const isCorrect = question.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase();
    const pointsAwarded = isCorrect ? question.points : 0;

    const submission = await Submission.create({
      teamId: req.user.teamId,
      questionId,
      roundId: round._id,
      submittedBy: userId,
      submittedAnswer: answer,
      isCorrect,
      pointsAwarded,
      timestamp: new Date(),
    });

    const io = req.app.get('io');

    const updatedTeam = await Team.findOneAndUpdate(
      { _id: team._id, currentQuestionOrder: question.order },
      {
        $inc: { score: isCorrect ? question.points : 0, currentQuestionOrder: 1 },
        ...(isCorrect ? { $set: { lastCorrectAt: new Date() } } : {}),
      },
      { new: true }
    );
    if (!updatedTeam) {
      await Submission.findByIdAndDelete(submission._id);
      return res.status(409).json({ message: 'This question was already completed by your team' });
    }
    team.score = updatedTeam.score;
    team.currentQuestionOrder = updatedTeam.currentQuestionOrder;
    team.lastCorrectAt = updatedTeam.lastCorrectAt;

    if (isCorrect) {
      const correctQuestionIds = await Submission.distinct('questionId', {
        teamId: team._id,
        roundId: round._id,
        isCorrect: true,
      });
      const roundScore = await Submission.aggregate([
        { $match: { teamId: team._id, roundId: round._id, isCorrect: true } },
        { $group: { _id: null, total: { $sum: '$pointsAwarded' } } },
      ]);
      const earnedPoints = roundScore[0]?.total || 0;
      const totalQuestions = await Question.countDocuments({ roundId: round._id });
      const passedRound = earnedPoints >= round.passingMark;
      if (passedRound) {
        const nextRound = await Round.findOne({ order: { $gt: round.order } }).sort({ order: 1 });
        const roundUpdate = {
          $addToSet: { completedRounds: round.order },
          $set: { currentRoundOrder: nextRound?.order || round.order, currentQuestionOrder: nextRound ? 1 : team.currentQuestionOrder },
          $push: { roundResults: { roundOrder: round.order, correctAnswers: correctQuestionIds.length, totalQuestions, score: team.score, passed: true, completedAt: new Date() } },
        };
        const progressedTeam = await Team.findOneAndUpdate(
          { _id: team._id, completedRounds: { $ne: round.order } },
          roundUpdate,
          { new: true }
        );
        if (!progressedTeam) return res.status(409).json({ message: 'This round was already completed by your team' });
        team.currentRoundOrder = progressedTeam.currentRoundOrder;
        team.currentQuestionOrder = progressedTeam.currentQuestionOrder;
        team.completedRounds = progressedTeam.completedRounds;
      }

    }

    // Emit updates for both correct and incorrect one-attempt submissions.
    if (io) {
      io.emit('submission:new');
      io.emit('leaderboard:update', { teamId: team._id });
      io.emit('question:unlock', { teamId: team._id, questionOrder: team.currentQuestionOrder });
      io.emit('progress:update', { teamId: team._id, currentRoundOrder: team.currentRoundOrder, currentQuestionOrder: team.currentQuestionOrder });
    }

    res.status(200).json({
      message: isCorrect ? 'Correct answer!' : 'Incorrect answer. Try again!',
      isCorrect,
      submission,
      teamScore: team.score,
      currentQuestionOrder: team.currentQuestionOrder,
      currentRoundOrder: team.currentRoundOrder,
      passedRound: Boolean(isCorrect && team.completedRounds?.includes(round.order)),
      correctAnswer: question.correctAnswer,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing submission', error: error.message });
  }
};
