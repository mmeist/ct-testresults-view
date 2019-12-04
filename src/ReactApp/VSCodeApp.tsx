import * as React from "react";
import {useEffect, useState} from "react";

import TestResultsView from "./TestResultsView";

interface VSCodeAppProps {
    vscode: any,
}

const VSCodeApp: React.FC<VSCodeAppProps> = (props: VSCodeAppProps) => {
    const handleMessage = (event: MessageEvent): any => {
        const message = event.data;
        switch (message.command) {
            case 'update_testresults':
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

    const [testresults, setTestresults] = useState<any>({});

    return (
        <TestResultsView testresults={testresults}/>
    );
}

export default VSCodeApp;