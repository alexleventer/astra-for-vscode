import * as vscode from 'vscode';
import { getToken } from './astra/dataApi';
import { ClustersProvider } from './clusters';
import * as path from 'path';
import * as fs from 'fs';
import { ViewTableCommand } from './commands/ViewTableCommand';

export async function setUpTreeView(context: vscode.ExtensionContext) {
  const { authToken }: any = await getToken(context);
    const clusterProvider = new ClustersProvider(authToken, context);
    vscode.window.registerTreeDataProvider('clusters', clusterProvider);
    vscode.window.createTreeView('clusters', {treeDataProvider: clusterProvider});
    vscode.commands.registerCommand('clusters.viewTable', ViewTableCommand);
    vscode.commands.registerCommand('clusters.deleteEntry', async (item) => {
      console.log(item.label);
      await context.globalState.update('astra', null);
      console.log(await context.globalState.get('astra'));
      await clusterProvider.refresh();
    });
};

export async function activate(context: vscode.ExtensionContext) {
  const astraStorage: any = context.globalState.get('astra');

  if (astraStorage && astraStorage.id) {
    await setUpTreeView(context);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('astra.start', async () => {
      const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel('astra', 'Connect to Astra', vscode.ViewColumn.One, {
        enableScripts: true
      });
      panel.webview.onDidReceiveMessage(async message => {
        if (message.command === 'credentials') {
          context.globalState.update('astra', message.body);
          await setUpTreeView(context);
          panel.dispose();
        }
      });
      const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'src', 'ui', 'addDatabase.html'));
      panel.webview.html = fs.readFileSync(filePath.fsPath, 'utf8');
    })
  );
}
