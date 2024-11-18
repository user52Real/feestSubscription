import { beforeAll, afterEach, afterAll } from '@jest/globals';
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { server } from './src/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());