import { problemRepository } from '../repositories/problemRepository.js';

export const problemService = {
  async getAllProblems() {
    return await problemRepository.findAll();
  },

  async getProblemDetails(id) {
    const problem = await problemRepository.findById(id);
    if (!problem) {
      throw new Error('Problem not found');
    }
    
    const testCases = await problemRepository.getTestCases(id, false); // Only public test cases for the description
    
    return {
      ...problem.toObject(),
      testCases
    };
  }
};
