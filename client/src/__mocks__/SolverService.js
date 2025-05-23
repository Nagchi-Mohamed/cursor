export const solveProblem = jest.fn().mockResolvedValue({
  solution: 'x = 5',
  steps: [
    { title: 'Step 1', explanation: '2x = 10', image: null },
    { title: 'Step 2', explanation: 'x = 5', image: null }
  ],
});
export const getHistory = jest.fn().mockResolvedValue({
  history: [],
});
export const processImage = jest.fn().mockResolvedValue({
  latex: '2x+3=13',
});
export const processVoiceInput = jest.fn().mockResolvedValue({
  text: '2 plus 2',
});
export const uploadImageToGCS = jest.fn();
