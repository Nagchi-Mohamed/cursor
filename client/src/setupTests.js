// client/src/setupTests.js

// Extends Jest's expect with DOM-specific matchers
import '@testing-library/jest-dom';

// Polyfill for MutationObserver if needed by components or testing library internals in JSDOM
import 'mutationobserver-shim';

// Make React available globally for JSX transformation if your setup needs it.
// This was the fix for "React is not defined".
import React from 'react';

// Mock for window.matchMedia (often needed by MUI components or responsive hooks)
global.matchMedia = global.matchMedia || function () {
  return {
    matches: false,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
};

// Mock for localStorage (if your app uses it and tests need to interact with it)
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    removeItem: function (key) {
        delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock for sessionStorage (similar to localStorage)
const sessionStorageMock = (function () {
    let store = {};
    return {
        getItem: function (key) {
            return store[key] || null;
        },
        setItem: function (key, value) {
            store[key] = value.toString();
        },
        removeItem: function (key) {
            delete store[key];
        },
        clear: function () {
            store = {};
        }
    };
})();
Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock
});

// Suppress specific console errors/warnings during tests if they are known and noisy
// (Use with caution, only for warnings you've investigated and deemed acceptable for tests)
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    // Suppress "Warning: ReactDOMTestUtils.act is deprecated..."
    if (typeof args[0] === 'string' && args[0].includes('ReactDOMTestUtils.act is deprecated')) {
      return;
    }
    originalConsoleError.call(console, ...args);
  });
  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    originalConsoleWarn.call(console, ...args);
  });
});

afterAll(() => {
  if (jest.isMockFunction(console.error)) {
    console.error.mockRestore();
  }
  if (jest.isMockFunction(console.warn)) {
    console.warn.mockRestore();
  }
});

// Any other global mocks or setup for Jest can go here.
// For example, if you were using enzyme:
// import Enzyme from 'enzyme';
// import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
// Enzyme.configure({ adapter: new Adapter() });

// The BrowserRouter component and other providers belong in `test-utils.jsx`'s `AllTheProviders` wrapper,
// NOT directly in setupTests.js globally wrapping things.
// The line `at BrowserRouter (C:\Users\Han\Desktop\MathSphere\client\src\setupTests.js:264:38)`
// from your previous error indicates that a <BrowserRouter> component was being used directly in this file.
// That JSX usage is what requires `import React from 'react';` at the top of this file.
// However, the BrowserRouter itself should be part of the wrapper in test-utils.jsx.
// Please ensure that around line 264 (or wherever the error pointed) in THIS file (setupTests.js),
// you are NOT trying to render React components directly.
