import * as React from "react";
import * as ReactDOM from "react-dom";

import "./VSCodeApp.css";

import VSCodeApp from "./VSCodeApp";

interface vscode {
    postMessage(message: any): void;
}

declare const vscode: vscode;

ReactDOM.render(
    <VSCodeApp vscode={vscode}/>,
    document.getElementById("root")
);