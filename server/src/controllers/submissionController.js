import Submission from '../models/Submission.js';
import Question from '../models/Question.js';
import Team from '../models/Team.js';
import EventState from '../models/EventState.js';

export const submitAnswer = async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    const userId = req.user._id;

    if (!req.user.teamId) {
      return res.status(400).json({ message: 'User must belong to a team to submit answers' });
    }

    const eventState = await EventState.findOne();
    if (eventState && !eventState.isRoundOpen) {
      return res.status(403).json({ message: 'Submissions are currently closed for this round' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isCorrect = question.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase();

    const submission = await Submission.create({
      teamId: req.user.teamId,
      questionId,
      submittedBy: userId,
      submittedAnswer: answer,
      isCorrect,
      timestamp: new Date(),
    });

    const team = await Team.findById(req.user.teamId);

    if (isCorrect) {
      team.score += question.points;
      team.lastCorrectAt = new Date();
      team.currentQuestionOrder += 1;
      await team.save();

      // Emit socket event for real-time leaderboard update
      const io = req.app.get('io');
      if (io) {
        const updatedLeaderboard = await Team.find()
          .select('name score lastCorrectAt currentQuestionOrder')
          .sort({ score: -1, lastCorrectAt: 1 });
        io.emit('leaderboard:update', updatedLeaderboard);
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
