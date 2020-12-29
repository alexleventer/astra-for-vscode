import * as vscode from 'vscode';
import { ThemeIcon } from 'vscode';
import { listKeyspaces, listTables } from './astra/dataApi';

export class ClustersProvider implements vscode.TreeDataProvider<any> {
  private outline: any;
  constructor(private token: string, private context: vscode.ExtensionContext) {
    this.token = token;
    this.context = context;
    const outline = this.generateOutline();
    this.outline = outline;
  }

  async generateOutline() {
    const ignoreKeyspaces: string[] = [
      'system',
      'system_backups',
      'system_distributed',
      'system_auth',
      'data_endpoint_auth',
      'datastax_sla',
      'system_traces',
    ];
    // Database
    const outline = [];
    const keyspaces: any = await listKeyspaces(this.token, this.context);
    for (const keyspace of keyspaces.data) {
      if (!ignoreKeyspaces.includes(keyspace.name)) {
        const tables: any = await listTables(this.token, keyspace.name, this.context);

        // Tables
        const tableOptions: any = await tables.map(table => {
          return {
            label: table,
            iconPath: new ThemeIcon('split-horizontal'),
            command: {
              command: 'clusters.viewTable',
              title: 'View Astra table',
              arguments: [{
                keyspace: keyspace.name,
                table: table,
              }],
            },
            children: [],
          }
        });

        // Keyspace
        outline.push({
          label: keyspace.name,
          children: tableOptions,
          iconPath: new ThemeIcon('key'),
        });
      }
    }
    return outline;
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