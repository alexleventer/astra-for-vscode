import * as vscode from 'vscode';
import { get, post } from 'request';
const fetch = require('node-fetch');

export const loadCSV = async (context: vscode.ExtensionContext, keyspace: string): Promise<string> => {
  const { fileName }: any = await context.globalState.get('loader');
  const { id, region, username, password }: any = await context.globalState.get('astra');

  console.log("ready to fetch")
  let datasetData = await fetch("https://dev.cloud.datastax.com/api/v2/dataset", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9,es-CO;q=0.8,es;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/json;charset=UTF-8",
    },
    "body": "{\"database\":{\"id\":\""+id+"\",\"name\":\"free\"},\"orgId\":\"3374ce8e-00d9-4075-b2f0-afb8c839a7aa\",\"keyspace\":\""+keyspace+"\",\"password\":\""+password+"\",\"tableName\":\"chipotle_stores\",\"meta\":[{\"key\":\"state\",\"label\":\"state\",\"type\":\"text\",\"category\":\"\",\"format\":\"\"},{\"key\":\"location\",\"label\":\"location\",\"type\":\"text\",\"category\":\"\",\"format\":\"\"},{\"key\":\"address\",\"label\":\"address\",\"type\":\"text\",\"category\":\"\",\"format\":\"\"},{\"key\":\"latitude\",\"label\":\"latitude\",\"type\":\"decimal\",\"category\":\"\",\"format\":\"\"},{\"key\":\"longitude\",\"label\":\"longitude\",\"type\":\"decimal\",\"category\":\"\",\"format\":\"\"}],\"partitionKeys\":[\"state\"],\"clusteringColumns\":[],\"fileName\":\"chipotle_stores.csv\",\"userId\":\"388def78-0040-4dfe-b235-d67806939c8f\"}",
    "method": "POST",
    "mode": "cors"
  })
  let datasetText = await datasetData.text();
  return datasetText
};


export const getToken = async (context: vscode.ExtensionContext): Promise<{ authToken: string }> => {
  const { id, region, username, password }: any = await context.globalState.get('astra');
  return new Promise((resolve, reject) => {
    post(`https://${id}-${region}.apps.astra.datastax.com/api/rest/v1/auth`, {
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        // @ts-ignore
        username,
        // @ts-ignore
        password
      })
    }, (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(body));
    })
  });
};

export const listKeyspaces = async (token: string, context: vscode.ExtensionContext) => {
  const { id, region, username, password }: any = context.globalState.get('astra');
  return new Promise((resolve, reject) => {
    get(`https://${id}-${region}.apps.astra.datastax.com/api/rest/v2/schemas/keyspaces`, {
      headers: {
        'X-Cassandra-Token': token,
        'content-type': 'application/json'
      }
    }, (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(body));
    })
  });
};

export const listTables = async (token: string, keyspaceName: string, context: vscode.ExtensionContext) => {
  const { id, region, username, password }: any = await context.globalState.get('astra');
  return new Promise((resolve, reject) => {
    get(`https://${id}-${region}.apps.astra.datastax.com/api/rest/v1/keyspaces/${keyspaceName}/tables`, {
      headers: {
        'X-Cassandra-Token': token,
        'content-type': 'application/json'
      }
    }, (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(body));
    })
  });
};

export const searchTable = async (token: string, keyspaceName: string, tableName: string, context: vscode.ExtensionContext) => {
  const { id, region }: any = await context.globalState.get('astra');
  return new Promise((resolve, reject) => {
    get(`https://${id}-${region}.apps.astra.datastax.com/api/rest/v2/keyspaces/${keyspaceName}/${tableName}?raw=true&where=${JSON.stringify({ $exists: {} })}`, {
      headers: {
        'X-Cassandra-Token': token,
        'content-type': 'application/json'
      }
    }, (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(body));
    })
  });
};