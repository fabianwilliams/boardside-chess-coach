import '@testing-library/jest-dom';

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = jest.fn();
