'use strict';

import * as vscode from 'vscode';
import { getToken } from './astra/dataApi';
import { ClustersProvider } from './clusters';
import * as path from 'path';
import * as fs from 'fs';
import { ViewTableCommand } from './commands/viewtable';

export async function activate(context: vscode.ExtensionContext) {
  const astraStorage: any = context.globalState.get('astra');

  // TODO: clear storage
  // await context.globalState.update('astra', null);

  if (astraStorage && astraStorage.id) {
    const { authToken }: any = await getToken(context);
    const clusterProvider = new ClustersProvider(authToken, context);

    vscode.window.registerTreeDataProvider('clusters', clusterProvider);
    vscode.window.createTreeView('clusters', { treeDataProvider: clusterProvider });
    vscode.commands.registerCommand('clusters.viewTable', ViewTableCommand);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('astra.start', async () => {
      const panel = vscode.window.createWebviewPanel('astra', 'Connect to Astra', vscode.ViewColumn.One, {
        enableScripts: true
      });
      panel.webview.onDidReceiveMessage(async message => {
        if (message.command === 'credentials') {
          context.globalState.update('astra',  message.body);
        }
      });
      const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'src', 'ui', 'addDatabase.html'));
      panel.webview.html = fs.readFileSync(filePath.fsPath, 'utf8');
    })
  );
}
