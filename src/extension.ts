import * as vscode from "vscode";
import { getToken } from "./astra/dataApi";
import { ClustersProvider } from "./providers/ClustersProvider";
import { HelpProvider } from "./providers/HelpProvider";
import * as path from "path";
import * as fs from "fs";
import { ViewTableCommand } from "./commands/ViewTableCommand";

export async function setUpTreeView(context: vscode.ExtensionContext) {
  const tokenResponse: any = await getToken(context).catch(async err => {
    await context.globalState.update("astra", null);
    vscode.window.showErrorMessage('The cluster credentials provided are invalid, please try again');
    return;
  });
  const { authToken } = tokenResponse;
  const clusterProvider = new ClustersProvider(authToken, context);
  vscode.window.registerTreeDataProvider("clusters", clusterProvider);
  vscode.window.createTreeView("clusters", {
    treeDataProvider: clusterProvider,
  });
  vscode.commands.registerCommand("clusters.viewTable", ViewTableCommand);
  vscode.commands.registerCommand("clusters.removeEntry", async (item) => {
    await context.globalState.update("astra", null);
  });
}

export async function validateInput(body) {
  const errors = [];
  if (!body.id) {
    errors.push("database id");
  }
  if (!body.region) {
    errors.push("database region");
  }

  if (!body.username) {
    errors.push("database username");
  }

  if (!body.password) {
    errors.push("database password");
  }

  if (errors && errors.length === 0) {
    return true;
  }
  vscode.window.showErrorMessage(
    `Missing required fields: ${errors.join(", ")}`
  );
  return false;
}

export async function activate(context: vscode.ExtensionContext) {
  const astraStorage: any = context.globalState.get("astra");
  const helpProvider = new HelpProvider(context);
  vscode.window.registerTreeDataProvider("help", helpProvider);
  vscode.window.createTreeView("help", { treeDataProvider: helpProvider });

  if (astraStorage && astraStorage.id) {
    await setUpTreeView(context);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("astra.openPortal", async () =>
      vscode.env.openExternal(vscode.Uri.parse("https://astra.datastax.com"))
    ),
    vscode.commands.registerCommand("astra.openDocumentation", async () =>
      vscode.env.openExternal(
        vscode.Uri.parse("https://docs.astra.datastax.com")
      )
    ),
    vscode.commands.registerCommand("astra.start", async () => {
      const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
        "astra",
        "Connect to Astra",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, "media")),
          ],
        }
      );
      panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === "credentials") {
          const isValid = validateInput(message.body);

          if (isValid) {
            context.globalState.update("astra", message.body);
            await setUpTreeView(context);
            panel.dispose();
          }
        }
      });
      const filePath: vscode.Uri = vscode.Uri.file(
        path.join(context.extensionPath, "src", "ui", "addCluster.html")
      );
      panel.iconPath = vscode.Uri.file(
        path.join(context.extensionPath, "media", "astra-negative-square.png")
      );
      panel.webview.html = fs.readFileSync(filePath.fsPath, "utf8");
    })
  );
}
