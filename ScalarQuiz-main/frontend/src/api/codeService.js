import { apiClient } from './api.js';

export const codeService = {
  async submitCode(problem, constraints, language, code) {
    return apiClient.post('/code/submit', {
      problem,
      constraints,
      language,
      code
    });
  }
};
