import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema(
	{
		order: {
			type: Number,
			required: true,
			unique: true,
			min: 1,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		passingMark: {
			type: Number,
			required: true,
			min: 0,
			default: 1,
		},
		isOpen: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

export default mongoose.model('Round', roundSchema);
