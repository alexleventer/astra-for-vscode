import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export const ConnectCommand = (context: vscode.ExtensionContext): any => {
  const panel = vscode.window.createWebviewPanel(
    "astra",
    "Connect to Astra",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
    }
  );
  panel.webview.onDidReceiveMessage((message: any) => {
    if (message.command === "credentials") {
      context.globalState.update("astra", message.body);
    }
  });
  const filePath: vscode.Uri = vscode.Uri.file(
    path.join(context.extensionPath, "src", "ui", "addDatabase.html")
  );
  panel.webview.html = fs.readFileSync(filePath.fsPath, "utf8");
};
