import * as path from 'path';
import mongoose from 'mongoose';
import { Context } from 'aws-lambda';
import { CustomAPIEvent } from '../types/Generic';

const env = process.env;

export default class Database {
  public event: CustomAPIEvent = null;
  public context: Context = null;

  constructor(event?: CustomAPIEvent, context?: Context) {
    this.event = event || null;
    this.context = context || null;
    if (this.context) this.context.callbackWaitsForEmptyEventLoop = false;

    this.Connect();
  }

  private async Connect() {
    try {
      mongoose.connect(`mongodb://${env.DB_HOST}:${env.DB_PORT}`, {
        user: env.DB_USER,
        pass: env.DB_PASS,
        authMechanism: 'DEFAULT',
        authSource: env.DB_DATABASE,
        serverSelectionTimeoutMS: 10000,
        dbName: env.DB_DATABASE,
        retryWrites: false,
      });

      mongoose.connection.once('open', function () {
        console.log('INFO', 'DB Connection successful');
      });
      mongoose.connection.on('error', function (error) {
        console.log('ERROR', 'DB Connection is lost', error);
      });
    } catch (error) {
      console.error('Database.Connect Error', error);
    }
  }
}
