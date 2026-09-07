import Question from '../models/Question.js';
import Team from '../models/Team.js';
import Round from '../models/Round.js';

export const getQuestions = async (req, res) => {
  try {
    const projection = req.user.role === 'ADMIN' ? '' : '-correctAnswer';
    if (req.user.role !== 'ADMIN' && !req.user.teamId) {
      return res.status(403).json({ message: 'Join a team before accessing questions' });
    }
    const team = req.user.role === 'ADMIN'
      ? null
      : await Team.findById(req.user.teamId).select('currentRoundOrder currentQuestionOrder');
    if (req.user.role !== 'ADMIN' && !team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    const filter = req.user.role === 'ADMIN'
      ? {}
      : { order: team.currentQuestionOrder, roundId: (await Round.findOne({ order: team.currentRoundOrder }))?._id };
    const questions = await Question.find(filter).select(projection).populate('roundId', 'title order passingMark').sort({ order: 1 });
    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
};

export const getQuestionByOrder = async (req, res) => {
  try {
    const { order } = req.params;
    const requestedOrder = Number(order);
    if (!Number.isInteger(requestedOrder) || requestedOrder < 1) {
      return res.status(400).json({ message: 'Invalid question order' });
    }

    if (req.user.role !== 'ADMIN') {
      if (!req.user.teamId) {
        return res.status(403).json({ message: 'Join a team before accessing questions' });
      }
      const team = await Team.findById(req.user.teamId).select('currentRoundOrder currentQuestionOrder');
      const round = team && await Round.findOne({ order: team.currentRoundOrder });
      if (!team || !round || requestedOrder !== team.currentQuestionOrder) {
        return res.status(403).json({ message: 'This question is still locked for your team' });
      }
      req.roundId = round._id;
    }

    const question = await Question.findOne({ order: requestedOrder, ...(req.roundId ? { roundId: req.roundId } : {}) }).select('-correctAnswer').populate('roundId', 'title order passingMark');
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ question });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching question', error: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { roundId, order, title, description, type, options, correctAnswer, points } = req.body;

    if (!roundId || !(await Round.exists({ _id: roundId }))) {
      return res.status(400).json({ message: 'A valid round is required' });
    }

    const existing = await Question.findOne({ roundId, order });
    if (existing) {
      return res.status(400).json({ message: `Question with order ${order} already exists` });
    }

    const question = await Question.create({
      order,
      roundId,
      title,
      description,
      type,
      options: options || [],
      correctAnswer,
      points: points || 10,
    });

    res.status(201).json({ message: 'Question created successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Error creating question', error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { roundId, order, title, description, type, options, correctAnswer, points } = req.body;
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { roundId, order, title, description, type, options: options || [], correctAnswer, points },
      { new: true, runValidators: true }
    );
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json({ message: 'Question updated successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Error updating question', error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
};
