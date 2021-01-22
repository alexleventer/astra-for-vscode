import * as vscode from 'vscode';
import { loadCSV } from '../astra/dataApi';


export const LoadCSVCommand= async (item, context) => {
  const { database, keyspace} = item;
  const { id, username, password, region } = context.globalState.get('astra');

  let script : string = `function loadData() {
  }`;

  const label: string = `${keyspace} `;
  const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
    `${database} - ${keyspace}`,
    label,
    vscode.ViewColumn.One,
    {
      enableScripts: true
    }
  );
  panel.webview.onDidReceiveMessage(async message => {
    if (message.command === 'loadCSV') {
      const isValid = validateInput(message.body);

      if (isValid) {
        context.globalState.update('loader', message.body);
        const result: any = await loadCSV(context);
        console.log(result)
        panel.dispose();
      }
    }
  });
  panel.webview.html = webview(script);
}

const webview = (script) => {

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
    <script>
      const vscode = acquireVsCodeApi();
      function loadData(){
      const fileName = document.getElementById('fileName').value;
      console.log(fileName)
      vscode.postMessage({
        command: 'loadCSV',
        body: { 
          fileName: fileName,
        },
      })
    }
    </script>
    
    <label for="fileName">Load sample data:</label>
    <select id="fileName" name="fileName">
      <option value="Restaurants">restaurants</option>
      <option value="Reviews">reviews</option>
    </select>
    <button id="load" onclick="loadData()"><b>Load Data</button>
    </body>
    </html>`;
}

export async function validateInput(body) {
  const errors = [];
  if (!body.fileName) {
    errors.push('Missing file name.');
  }

  if (errors && errors.length === 0) {
    return true;
  }
  vscode.window.showErrorMessage(`ERROR: ${errors.join('\n')}`);
  return false;
}