import { Client } from 'cassandra-driver';
import * as  path from 'path';

export default class Cassandra {
  private client: Client;
  constructor(options) {
    this.client = new Client({
      cloud: {
        secureConnectBundle: path.join(__dirname, './secure-connect.zip'),
      },
      credentials: {
        username: options.username,
        password: options.password,
      }
    });
  }
  public async query(statement: string, variables?: any[]) {
    try {
      return await this.client.execute(statement, variables, { prepare: true });
    } catch (e) {
      console.log(e);
    }
  }
}