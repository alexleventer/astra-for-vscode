import * as vscode from 'vscode';
import Cassandra from '../astra/cassandra';

export const ViewTableCommand = async (item) => {
  const label = `${item.keyspace}: ${item.table}`;
  const panel = vscode.window.createWebviewPanel(
    `${item.keyspace}/${item.table}`,
    label,
    vscode.ViewColumn.One,
    {}
  );
  const client = new Cassandra({
    username: 'test',
    password: 'test123'
  });
  const results: any = await client.query(`SELECT * FROM ${item.keyspace}.${item.table}`);
  panel.webview.html = webViewTest(label, results.rows);
}

const webViewTest = (label: string, rows: any) => {
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