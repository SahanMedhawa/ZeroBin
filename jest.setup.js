import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file before tests run
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Set NODE_ENV to 'test' for all Jest tests
process.env.NODE_ENV = 'test';

// Increase Jest timeout for slower tests
jest.setTimeout(10000);
