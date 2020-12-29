import * as vscode from 'vscode';
import { getToken, searchTable } from '../astra/dataApi';

export const ViewTableCommand = async (item) => {
  const { keyspace, table, context} = item;
  const { id, username, password, region } = context.globalState.get('astra');

  const label = `${keyspace}: ${table}`;
  const panel = vscode.window.createWebviewPanel(
    `${keyspace}/${table}`,
    label,
    vscode.ViewColumn.One,
    {}
  );
  const { authToken } = await getToken(context);
  const rows = await searchTable(authToken, keyspace, table, context);
  panel.webview.html = webview(label, rows);
}

const webview = (label: string, rows: any) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test</title>
    </head>
    <body>
    <p><b>${label}</b></p>

  
    <p>${JSON.stringify(rows)}</p>
    </body>
    </html>`;
}