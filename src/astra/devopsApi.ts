import { get, post } from 'request';
import * as fs from 'fs';

export const downloadSecureConnectBundle = (token: string, databaseId: string) => {
  return new Promise((resolve, reject) => {
    const req = post(`https://api.astra.datastax.com/v2/databases/${databaseId}/secureBundleURL`, {
      headers: {
        'content-type': 'application/json',
        'Authentication': `Bearer ${token}`
      },
    });
    req.on('response', (response) => {
      if (response.statusCode !== 200) {
        reject(response);
      }
      const file = fs.createWriteStream('secure-connect-bundle.zip');
      resolve(req.pipe(file));
    });
  });
};