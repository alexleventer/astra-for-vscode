import * as vscode from 'vscode';
import { getToken } from './astra/dataApi';
import { ClustersProvider } from './providers/ClustersProvider';
import { HelpProvider } from './providers/HelpProvider';
import * as path from 'path';
import * as fs from 'fs';
import { pythonExample, javascriptExample } from './astra/examples';
import { ViewTableCommand } from './commands/ViewTableCommand';
import { LoadCSVCommand} from './commands/LoadCSVCommand';

export async function setUpTreeView(context: vscode.ExtensionContext) {
  const { authToken }: any = await getToken(context);
  const clusterProvider = new ClustersProvider(authToken, context);
  vscode.window.registerTreeDataProvider('clusters', clusterProvider);
  vscode.window.createTreeView('clusters', { treeDataProvider: clusterProvider });
  vscode.commands.registerCommand('clusters.viewTable', ViewTableCommand);
  vscode.commands.registerCommand('astra.loadCSV', async (item) => {
    LoadCSVCommand(item,context)
  });
  vscode.commands.registerCommand('clusters.deleteEntry', async (item) => {
    await context.globalState.update('astra', null);
    await clusterProvider.refresh();
  });

};

export async function validateInput(body) {
  const errors = [];
  if (!body.id) {
    errors.push('Missing database id.');
  }
  if (!body.region) {
    errors.push('Missing database region.');
  }

  if (!body.username) {
    errors.push('Missing database username.');
  }

  if (!body.password) {
    errors.push('Missing database password.');
  }

  if (errors && errors.length === 0) {
    return true;
  }
  vscode.window.showErrorMessage(`ERROR: ${errors.join('\n')}`);
  return false;
}

export async function activate(context: vscode.ExtensionContext) {
  const astraStorage: any = context.globalState.get('astra');
  const helpProvider = new HelpProvider(context);
  vscode.window.registerTreeDataProvider('help', helpProvider);
  vscode.window.createTreeView('help', { treeDataProvider: helpProvider });


  if (astraStorage && astraStorage.id) {
    await setUpTreeView(context);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('astra.openSampleAppGallery', async () => vscode.env.openExternal(vscode.Uri.parse("https://www.datastax.com/examples"))),
    vscode.commands.registerCommand('astra.openPortal', async () => vscode.env.openExternal(vscode.Uri.parse("https://astra.datastax.com"))),
    vscode.commands.registerCommand('astra.openDocumentation', async () => vscode.env.openExternal(vscode.Uri.parse("https://docs.astra.datastax.com"))),
    vscode.commands.registerCommand('astra.launchNodeExample', async () => vscode.workspace.openTextDocument({ content: javascriptExample, language: 'javascript' })),
    vscode.commands.registerCommand('astra.launchPythonExample', async () => vscode.workspace.openTextDocument({ content: pythonExample, language: 'python' })),
    vscode.commands.registerCommand('astra.start', async () => {
      const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel('astra', 'Connect to Astra', vscode.ViewColumn.One, {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(context.extensionPath, 'media'))
        ]
      });
      panel.webview.onDidReceiveMessage(async message => {
        if (message.command === 'credentials') {
          const isValid = validateInput(message.body);

          if (isValid) {
            context.globalState.update('astra', message.body);
            await setUpTreeView(context);
            panel.dispose();
          }
        }
      });
      const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'src', 'ui', 'addDatabase.html'));
      panel.iconPath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'astra-negative-square.png'));
      panel.webview.html = fs.readFileSync(filePath.fsPath, 'utf8');
    })
  );
}
