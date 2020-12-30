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
  const header = `<tr>${Object.keys(rows[0]).map(col => `<td><b>${col}<b></td>`).join("")}</tr>`;

  let tableRows: string = "";

  for (let i = 1; i < rows.length; i++) {
    tableRows += `<tr>${Object.values(rows[i]).map(col => `<td>${typeof col === 'object' ? JSON.stringify(col) : col }</td>`).join("")}</tr>`
  }

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${label}</title>
    </head>
    <body>
    <h3><b>${label}</b></h3>
    <table>
    ${header}
    ${tableRows}
    </table>
    </body>
    </html>`;
}
