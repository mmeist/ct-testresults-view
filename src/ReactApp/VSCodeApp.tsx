import * as React from "react";
import {useEffect, useState} from "react";

import {TestResultsView, TestResultsViewJunit} from "./TestResultsView";

import convert_testresults from "./convert_testresults";

interface VSCodeAppProps {
    vscode: any,
}

const VSCodeApp: React.FC<VSCodeAppProps> = (props: VSCodeAppProps) => {
    const handleMessage = (event: MessageEvent): any => {
        const message = event.data;
        switch (message.command) {
            case 'update_testresults':
                setWhichViewer("json");
                setTestresults(Object.assign({}, JSON.parse(convert_testresults(message.content))));
                break;
            case 'update_testresults_junit':
                setWhichViewer("junit");
                setTestresults(Object.assign({}, JSON.parse(message.content)));
                break;
        }
    }

    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        }
    }, []);

    const [which_viewer, setWhichViewer] = useState<string>("json");
    const [testresults, setTestresults] = useState<any>({});

    if (which_viewer === "json") {
        return (
            <TestResultsView testresults={testresults}/>
        );
    } else if (which_viewer === "junit") {
        return (
            <TestResultsViewJunit testresults={testresults}/>
        );
    };
    return(<></>);
}

export default VSCodeApp;