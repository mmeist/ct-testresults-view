// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from "fs";
import * as path from 'path';

import ReactAppWebviewPanel from './panel/ReactAppWebviewPanel';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ct-testresults" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.ct-testresults', () => {
		// The code you place here will be executed every time your command is executed
			let openDialogOptions: vscode.OpenDialogOptions = {
					canSelectFiles: true,
					canSelectFolders: false,
					canSelectMany: false,
					filters: {
						Valid: ["json", "xml"],
						Json: ["json"],
						Xml: ["xml"]
					}
			};
			
			vscode.window.showOpenDialog(openDialogOptions)
				.then(
					async (uri: vscode.Uri[] | undefined) => {
						if (uri && uri.length > 0) {
							const panel = ReactAppWebviewPanel.createOrShow(uri[0], context.extensionPath);
						} else {
							vscode.window.showErrorMessage("No file Selected.");
							return;
						}
					}
				);
			}
		)
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
