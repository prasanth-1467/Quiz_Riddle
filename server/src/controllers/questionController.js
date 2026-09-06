import Question from '../models/Question.js';
import Team from '../models/Team.js';

export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().select('-correctAnswer').sort({ order: 1 });
    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
};

export const getQuestionByOrder = async (req, res) => {
  try {
    const { order } = req.params;
    const question = await Question.findOne({ order: Number(order) }).select('-correctAnswer');
    
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
