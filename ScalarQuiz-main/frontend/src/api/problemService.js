import { apiClient } from './api.js';

export const problemService = {
  async getProblems() {
    return apiClient.get('/problems');
  },
  
  async getProblemById(id) {
    return apiClient.get(`/problems/${id}`);
  }
};
