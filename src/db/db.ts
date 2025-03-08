import { MongoClient, Db } from 'mongodb';
import { MongoRepository } from './repositories/MongoRepository';

export class MongoDBConnection {
  private static instance: MongoDBConnection;
  private client: MongoClient;
  private connection: Db | null = null;

  private constructor(
    private uri: string,
    private dbName: string,
  ) {
    this.client = new MongoClient(this.uri);
  }

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      const dbName = process.env.MONGODB_DB || 'magic-collection';
      MongoDBConnection.instance = new MongoDBConnection(uri, dbName);
    }
    return MongoDBConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.connection = this.client.db(this.dbName);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public getDatabase(): Db {
    if (!this.connection) {
      throw new Error('MongoDB not connected');
    }
    return this.connection;
  }

  public async close(): Promise<void> {
    try {
      await this.client.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }
}

export const DB = MongoDBConnection.getInstance();
export const RepoCls = MongoRepository;
