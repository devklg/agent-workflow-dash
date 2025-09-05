// Validation middleware for agent dashboard

const validateAgent = (req, res, next) => {
  const { name, role, team } = req.body;
  
  if (!name || !role || !team) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, role, team' 
    });
  }
  
  const validTeams = ['atlas', 'aurora', 'phoenix', 'sentinel'];
  if (!validTeams.includes(team.toLowerCase())) {
    return res.status(400).json({ 
      error: 'Invalid team. Must be one of: atlas, aurora, phoenix, sentinel' 
    });
  }
  
  next();
};

const validateTask = (req, res, next) => {
  const { title, assignedTo } = req.body;
  
  if (!title || !assignedTo) {
    return res.status(400).json({ 
      error: 'Missing required fields: title, assignedTo' 
    });
  }
  
  next();
};

const validateProject = (req, res, next) => {
  const { name, description } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, description' 
    });
  }
  
  next();
};

module.exports = {
  validateAgent,
  validateTask,
  validateProject
};