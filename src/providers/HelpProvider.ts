import * as vscode from 'vscode';

export class HelpProvider implements vscode.TreeDataProvider<any> {
  private outline: any;
  constructor(private context: vscode.ExtensionContext) {
    this.context = context;
    this.outline = this.generateOutline();
  }

  async generateOutline() {
    return [
      {
        label: "Astra Documentation",
        children: [],
        iconPath: new vscode.ThemeIcon('book'),
        command: {
          command: 'astra.openDocumentation',
        },
      },
      {
        label: "Astra Portal",
        children: [],
        iconPath: new vscode.ThemeIcon('code'),
        command: {
          command: 'astra.openPortal',
        },
      },
      {
        label: "Astra Example Apps",
        children: [],
        iconPath: new vscode.ThemeIcon('briefcase'),
        command: {
          command: 'astra.openSampleAppGallery',
        },
      }
    ];

  }

  getTreeItem(item: any): vscode.TreeItem {
    return {
      id: item.id,
      label: item.label,
      description: item.description,
      iconPath: item.iconPath,
      command: item.command,
      resourceUri: item.resourceUri,
      tooltip: item.tooltip,
      contextValue: item.contextValue,
      collapsibleState: item.children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    };
  }

  async getChildren(element?: any): Promise<[]> {
    if (element) {
      return Promise.resolve(element.children);
    }
    return Promise.resolve(this.outline);
  }
}