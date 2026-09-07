import Round from '../models/Round.js';
import Question from '../models/Question.js';

export const getRounds = async (req, res) => {
	try {
		const rounds = await Round.find().sort({ order: 1 }).lean();
		const questions = await Question.find().select('-correctAnswer').sort({ order: 1 }).lean();
		res.status(200).json({ rounds: rounds.map((round) => ({
			...round,
			questions: questions.filter((question) => String(question.roundId) === String(round._id)),
		})) });
	} catch (error) {
		res.status(500).json({ message: 'Error fetching rounds', error: error.message });
	}
};

export const createRound = async (req, res) => {
	try {
		const { title, order, passingMark = 1, isOpen = true } = req.body;
		const numericOrder = Number(order);
		const numericPassingMark = Number(passingMark);
		if (!title?.trim() || !Number.isInteger(numericOrder) || numericOrder < 1 || !Number.isFinite(numericPassingMark) || numericPassingMark < 0) {
			return res.status(400).json({ message: 'Title, positive order, and a non-negative passing mark are required' });
		}
		const round = await Round.create({ title, order: numericOrder, passingMark: numericPassingMark, isOpen });
		res.status(201).json({ message: 'Round created successfully', round });
	} catch (error) {
		res.status(400).json({ message: error.code === 11000 ? 'Round order already exists' : error.message });
	}
};

export const updateRound = async (req, res) => {
	try {
		const numericOrder = Number(req.body.order);
		const numericPassingMark = Number(req.body.passingMark);
		if (!req.body.title?.trim() || !Number.isInteger(numericOrder) || numericOrder < 1 || !Number.isFinite(numericPassingMark) || numericPassingMark < 0) {
			return res.status(400).json({ message: 'Title, positive order, and a non-negative passing mark are required' });
		}
		const round = await Round.findByIdAndUpdate(req.params.id, {
			title: req.body.title,
			order: numericOrder,
			passingMark: numericPassingMark,
			isOpen: req.body.isOpen,
		}, { new: true, runValidators: true });
		if (!round) return res.status(404).json({ message: 'Round not found' });
		res.status(200).json({ round });
	} catch (error) {
		res.status(400).json({ message: error.code === 11000 ? 'Round order already exists' : error.message });
	}
};

export const deleteRound = async (req, res) => {
	try {
		const questionCount = await Question.countDocuments({ roundId: req.params.id });
		if (questionCount) return res.status(400).json({ message: 'Delete or move the round questions first' });
		const round = await Round.findByIdAndDelete(req.params.id);
		if (!round) return res.status(404).json({ message: 'Round not found' });
		res.status(200).json({ message: 'Round deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Error deleting round', error: error.message });
	}
};
