import { problemService } from '../services/problemService.js';

export const getProblems = async (req, res, next) => {
  try {
    const problems = await problemService.getAllProblems();
    res.json(problems);
  } catch (error) {
    next(error);
  }
};

export const getProblemById = async (req, res, next) => {
  try {
    const problem = await problemService.getProblemDetails(req.params.id);
    res.json(problem);
  } catch (error) {
    next(error);
  }
};
