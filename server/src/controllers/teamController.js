import Team from '../models/Team.js';
import User from '../models/User.js';

// Utility helper to generate unique 6-character uppercase code
const generateTeamCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createTeam = async (req, res) => {
  try {
    const { name, teammateNames = [] } = req.body;
    const userId = req.user._id;

    if (req.user.teamId) {
      return res.status(400).json({ message: 'User already belongs to a team' });
    }

    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name is already taken' });
    }

    const cleanedTeammateNames = Array.isArray(teammateNames)
      ? teammateNames.map((teammateName) => String(teammateName).trim()).filter(Boolean)
      : [];

    let code = generateTeamCode();
    let isUnique = false;
    while (!isUnique) {
      const codeCheck = await Team.findOne({ code });
      if (!codeCheck) isUnique = true;
      else code = generateTeamCode();
    }

    const team = await Team.create({
      name,
      code,
      members: [userId],
      teammateNames: cleanedTeammateNames,
    });

    await User.findByIdAndUpdate(userId, { teamId: team._id });

    res.status(201).json({ message: 'Team created successfully', team });
  } catch (error) {
    res.status(500).json({ message: 'Error creating team', error: error.message });
  }
};

export const joinTeam = async (req, res) => {
  try {
    const code = typeof req.body.code === 'string' ? req.body.code.trim().toUpperCase() : '';
    const userId = req.user._id;

    if (!/^[A-Z0-9]{6}$/.test(code)) {
      return res.status(400).json({ message: 'Team code must be exactly 6 letters or numbers' });
    }

    if (req.user.teamId) {
      return res.status(400).json({ message: 'User already belongs to a team' });
    }

    const team = await Team.findOne({ code: code.toUpperCase() });
    if (!team) {
      return res.status(404).json({ message: 'Invalid team code' });
    }

    if (team.members.some((memberId) => String(memberId) === String(userId))) {
      return res.status(400).json({ message: 'You are already a member of this team' });
    }

    team.members.push(userId);
    await team.save();

    await User.findByIdAndUpdate(userId, { teamId: team._id });

    res.status(200).json({ message: 'Joined team successfully', team });
  } catch (error) {
    res.status(500).json({ message: 'Error joining team', error: error.message });
  }
};

export const joinIndividual = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.teamId) {
      return res.status(400).json({ message: 'User already belongs to a team or individual session' });
    }

    const team = await Team.create({
      name: `Individual - ${req.user.name} (${String(userId).slice(-6)})`,
      mode: 'INDIVIDUAL',
      code: generateTeamCode(),
      members: [userId],
    });
    await User.findByIdAndUpdate(userId, { teamId: team._id });

    res.status(201).json({ message: 'Individual quiz started', team });
  } catch (error) {
    res.status(500).json({ message: 'Error starting individual quiz', error: error.message });
  }
};

export const getTeamDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'ADMIN' && String(req.user.teamId) !== String(id)) {
      return res.status(403).json({ message: 'You can only view your own team' });
    }
    const team = await Team.findById(id).populate('members', 'name email role');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(200).json({ team });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team details', error: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const teams = await Team.find()
      .select('name score lastCorrectAt currentQuestionOrder currentRoundOrder roundResults')
      .sort({ score: -1, lastCorrectAt: 1 });

    const leaderboard = teams.map((team) => {
      const data = team.toObject();
      if (req.user?.role !== 'ADMIN') {
        const latestResult = [...(data.roundResults || [])].sort(
          (first, second) => new Date(second.completedAt) - new Date(first.completedAt)
        )[0];
        data.roundResults = latestResult ? [latestResult] : [];
      }
      return data;
    });

    res.status(200).json({ leaderboard });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
};
