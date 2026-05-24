import '@testing-library/jest-dom';

// Silence console.error output in tests unless explicitly checked
jest.spyOn(console, 'error').mockImplementation(() => {});
