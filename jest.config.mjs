/** @type {import('jest').Config} */
import { jest } from '@jest/globals';

const config = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    "^.+\\.tsx?$": "babel-jest"
  },
  moduleNameMapper: {
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};

export default config;
