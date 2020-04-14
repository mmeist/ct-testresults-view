import * as React from 'react';
import {Fragment} from 'react';
import {NodeStore, DetailsTree} from './DetailsTree';
import {Tabs, Tab} from './Tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SplitPane from 'react-split-pane';
import { faCheck, faTimes, faFolder, faExclamation, faUserGraduate, faBook } from '@fortawesome/free-solid-svg-icons';

import * as _ from 'lodash';

interface TestResultsViewJunitProps {
    testresults: any;
}

const TextDetails: React.FC<NodeStore> = (props: NodeStore) => {
    const text: string = _.get(props.values, 'failure._text');

    return(
        <div>
            <p style={{whiteSpace: "pre-wrap"}}>{text}</p>
        </div>
    );
};

const detailsMapping = (parent: NodeStore | null, [k, v]: [string, any]): React.FC<NodeStore> | null => {
    if (_.get(v, '_attributes.name') !== undefined) {
        let name = _.get(v, '_attributes.name');
        if (name.startsWith("test") && k !== "testsuite") {
            return TextDetails;
        }
    }
    return null;
};

const defaultDisplayedName = ([k, v]: [string, any]): string => {
    return _.get(v, "_attributes.name");
}

const defaultVisibleFilter = ([k, v]: [string, any]): boolean => {
    return !k.startsWith("_");
};

const defaultUnpackFilter = ([k, v]: [string, any]): boolean => {
    return k === "testcase";
};

const defaultPreToggled = (values: any): boolean => {
    return _.get(values, 'result') !== "passed";
};

const Icons: React.FC<NodeStore> = (node: NodeStore) => {
    let failure = _.get(node.values, 'failure');
    if (failure !== undefined) {
        return (<FontAwesomeIcon icon={faTimes} color="red" size="sm" fixedWidth />);
    }
    let errors = _.get(node.values, '_attributes.errors')
    if (errors !== undefined && errors !== "0") {
        return (<FontAwesomeIcon icon={faTimes} color="red" size="sm" fixedWidth />);
    }
    let failures = _.get(node.values, '_attributes.failures')
    if (failures !== undefined && failures !== "0") {
        return (<FontAwesomeIcon icon={faTimes} color="red" size="sm" fixedWidth />);
    }
    return (<FontAwesomeIcon icon={faCheck} color="green" size="sm" fixedWidth />);
};

export const TestResultsViewJunit: React.FC<TestResultsViewJunitProps> = (props: TestResultsViewJunitProps) => {

    let tests_json = _.get(props.testresults, 'testsuites');

    return (
        <DetailsTree root={tests_json}
                        visibleFilter={defaultVisibleFilter}
                        unpackFilter={defaultUnpackFilter}
                        preToggled={defaultPreToggled}
                        detailsMapping={detailsMapping} 
                        displayedName={defaultDisplayedName} 
                        iconsComp={Icons}
                        split={"vertical"}
                        minSize={100}
                        defaultSize={400}
                        />
    );
};
