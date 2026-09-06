import Question from '../models/Question.js';
import Team from '../models/Team.js';

export const getQuestions = async (req, res) => {
  try {
    const projection = req.user.role === 'ADMIN' ? '' : '-correctAnswer';
    if (req.user.role !== 'ADMIN' && !req.user.teamId) {
      return res.status(403).json({ message: 'Join a team before accessing questions' });
    }
    const team = req.user.role === 'ADMIN'
      ? null
      : await Team.findById(req.user.teamId).select('currentQuestionOrder');
    if (req.user.role !== 'ADMIN' && !team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    const filter = req.user.role === 'ADMIN' ? {} : { order: team.currentQuestionOrder };
    const questions = await Question.find(filter).select(projection).sort({ order: 1 });
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
      const team = await Team.findById(req.user.teamId).select('currentQuestionOrder');
      if (!team || requestedOrder !== team.currentQuestionOrder) {
        return res.status(403).json({ message: 'This question is still locked for your team' });
      }
    }

    const question = await Question.findOne({ order: requestedOrder }).select('-correctAnswer');
    
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
    const { order, title, description, type, options, correctAnswer, points } = req.body;

    const existing = await Question.findOne({ order });
    if (existing) {
      return res.status(400).json({ message: `Question with order ${order} already exists` });
    }

    const question = await Question.create({
      order,
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
    const { order, title, description, type, options, correctAnswer, points } = req.body;
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { order, title, description, type, options: options || [], correctAnswer, points },
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
