import { MongoClient, Db } from 'mongodb';
import { MongoRepository } from './repositories/MongoRepository';
import logger from '@/lib/logger';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'magic';

if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
  throw new Error(
    'Invalid MongoDB connection string. Must start with mongodb:// or mongodb+srv://',
  );
}

class MongoDBConnection {
  private static instance: MongoDBConnection;
  private client: MongoClient;
  private db: Db | null = null;

  private constructor() {
    this.client = new MongoClient(uri);
    logger.debug('MongoDB connection initialized');
  }

  public static async getInstance(): Promise<MongoDBConnection> {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
      await MongoDBConnection.instance.connect();
    }
    return MongoDBConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(dbName);
      logger.debug('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public getDatabase(): Db {
    if (!this.db) {
      throw new Error('MongoDB not connected');
    }
    return this.db;
  }

  public async close(): Promise<void> {
    try {
      await this.client.close();
      logger.debug('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }
}

const initDB = async () => {
  const connection = await MongoDBConnection.getInstance();
  return connection.getDatabase();
};

export const DB = await initDB();
export const RepoCls = MongoRepository;
