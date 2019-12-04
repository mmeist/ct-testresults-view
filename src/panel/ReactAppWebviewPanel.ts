import * as vscode from "vscode";
import * as fs from "fs";
import * as path from 'path';

export default class ReactAppWebviewPanel {
    public static currentPanel: ReactAppWebviewPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
    private _disposables: vscode.Disposable[] = [];

	public static createOrShow(_fileUri: vscode.Uri, extensionPath: string) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (ReactAppWebviewPanel.currentPanel) {
            ReactAppWebviewPanel.currentPanel._panel.reveal(column);
            ReactAppWebviewPanel.currentPanel._update_testresults(getFileContent(_fileUri));
			return;
		}

		// Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel (
            "TestResultsView",
            "Test Results",
            vscode.ViewColumn.One,
            {
                retainContextWhenHidden: true,
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(extensionPath, "TestResultsView"))
                ]
            },
        );

		ReactAppWebviewPanel.currentPanel = new ReactAppWebviewPanel(panel, _fileUri, extensionPath);
	}

	private constructor(panel: vscode.WebviewPanel, _fileUri:vscode.Uri, extensionPath: string) {
		this._panel = panel;
		this._extensionPath = extensionPath;

		// Set the webview's initial html content
		this._update(_fileUri);

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

	public dispose() {
		ReactAppWebviewPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update(fileUri: vscode.Uri) {
        let testresults = getFileContent(fileUri);
        if (testresults) {        
            this._panel.webview.html = this.getWebviewContent();

            // post message as string because Object gets sorted...
            this._update_testresults(testresults);
        }
    }
    
	private _update_testresults(testresults: any | null) {
        if (testresults) {
            this._panel.webview.postMessage({ command: 'update_testresults', content: JSON.stringify(testresults)});
        }
	}

    private getWebviewContent(): string {    
        //TODO: make security policy work with theia; currently "vscode-resource:" does not work in theia since asWebviewUri() uri gets mangled.
        // original security policy:
        /*<meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
                img-src https:;
                script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
                ">*/

        const reactAppPathOnDisk = vscode.Uri.file(
            path.join(this._extensionPath, "TestResultsView", "TestResultsView.js")
        );
        const reactAppUri = this._panel.webview.asWebviewUri(reactAppPathOnDisk);

        return `<!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <titleTest Results</title>
            </head>
            <body>
                <script>
                    const vscode = acquireVsCodeApi();
                </script>
                <div id="root">Some error occured in the react app</div>
                <script src="${reactAppUri}"></script>
            </body>
        </html>`;
    }
}

function getFileContent(fileUri: vscode.Uri): any | null {
    if (fs.existsSync(fileUri.fsPath)) {
        const content = fs.readFileSync(fileUri.fsPath, "utf8");
        const testresults: any = JSON.parse(content);

        return testresults;
    }
    return null;
}