import * as vscode from "vscode";
import { get, post } from "request";

export const getToken = async (
  context: vscode.ExtensionContext
): Promise<{ authToken: string }> => {
  const { id, region, username, password }: any = await context.globalState.get(
    "astra"
  );
  return new Promise((resolve, reject) => {
    post(
      `https://${id}-${region}.apps.astra.datastax.com/api/rest/v1/auth`,
      {
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      },
      (error, response, body) => {
        if (error) {
          reject(error);
        }
        resolve(JSON.parse(body));
      }
    );
  });
};

export const listKeyspaces = async (
  token: string,
  context: vscode.ExtensionContext
) => {
  const { id, region, username, password }: any =
    context.globalState.get("astra");
  return new Promise((resolve, reject) => {
    get(
      `https://${id}-${region}.apps.astra.datastax.com/api/rest/v2/schemas/keyspaces`,
      {
        headers: {
          "X-Cassandra-Token": token,
          "content-type": "application/json",
        },
      },
      (error, response, body) => {
        if (error) {
          reject(error);
        }
        resolve(JSON.parse(body));
      }
    );
  });
};

export const listTables = async (
  token: string,
  keyspaceName: string,
  context: vscode.ExtensionContext
) => {
  const { id, region, username, password }: any = await context.globalState.get(
    "astra"
  );
  return new Promise((resolve, reject) => {
    get(
      `https://${id}-${region}.apps.astra.datastax.com/api/rest/v1/keyspaces/${keyspaceName}/tables`,
      {
        headers: {
          "X-Cassandra-Token": token,
          "content-type": "application/json",
        },
      },
      (error, response, body) => {
        if (error) {
          reject(error);
        }
        resolve(JSON.parse(body));
      }
    );
  });
};

export const getIndexes = async (
  token: string,
  keyspaceName: string,
  tableName: string,
  context: vscode.ExtensionContext
) => {
  const { id, region }: any = await context.globalState.get("astra");
  return new Promise((resolve, reject) => {
    get(
      `https://${id}-${region}.apps.astra.datastax.com/api/rest/v2/keyspaces/${keyspaceName}/${tableName}/indexes`,
      {
        headers: {
          "X-Cassandra-Token": token,
          "content-type": "application/json",
        },
      },
      (error, response, body) => {
        if (error) {
          reject(error);
        }
        resolve(JSON.parse(body));
      }
    );
  });
};

export const getTable = async (
  token: string,
  keyspaceName: string,
  tableName: string,
  context: vscode.ExtensionContext
) => {
  const { id, region }: any = await context.globalState.get("astra");
  return new Promise((resolve, reject) => {
    get(
      `https://${id}-${region}.apps.astra.datastax.com/api/rest/v2/schemas/keyspaces/${keyspaceName}/tables/${tableName}`,
      {
        headers: {
          "X-Cassandra-Token": token,
          "content-type": "application/json",
        },
      },
      (error, response, body) => {
        if (error) {
          reject(error);
        }
        resolve(JSON.parse(body));
      }
    );
  });
};

export const searchTable = async (
  token: string,
  keyspaceName: string,
  tableName: string,
  context: vscode.ExtensionContext
) => {
  const { id, region }: any = await context.globalState.get("astra");
  const { data }: any = await getTable(token, keyspaceName, tableName, context);
  const pk = data?.primaryKey?.partitionKey[0];

  return new Promise((resolve, reject) => {
    get(
      `https://${id}-${region}.apps.astra.datastax.com/api/rest/v2/keyspaces/${keyspaceName}/${tableName}?raw=true&where=${JSON.stringify(
        {
          [pk]: {},
        }
      )}`,
      {
        headers: {
          "X-Cassandra-Token": token,
          "content-type": "application/json",
        },
      },
      (error, response, body) => {
        if (error) {
          reject(error);
        }
        resolve(JSON.parse(body));
      }
    );
  });
};
