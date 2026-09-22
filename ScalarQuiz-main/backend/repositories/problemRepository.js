import Problem from '../models/Problem.js';
import TestCase from '../models/TestCase.js';

export const problemRepository = {
  async findAll() {
    return Problem.find({}).select('-description -starterCode');
  },
  
  async findById(id) {
    return Problem.findById(id);
  },

  async findBySlug(slug) {
    return Problem.findOne({ slug });
  },

  async getTestCases(problemId, includeHidden = false) {
    const query = { problemId };
    if (!includeHidden) {
      query.hidden = false;
    }
    return TestCase.find(query);
  }
};
