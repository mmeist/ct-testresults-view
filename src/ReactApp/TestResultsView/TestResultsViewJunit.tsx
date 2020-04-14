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
    const details: string = _.get(props.values, 'details');
    const text: string = _.get(details, 'text');

    return(
        <div>
            <p style={{whiteSpace: "pre-wrap"}}>{text}</p>
        </div>
    );
};

const detailsMapping = (parent: NodeStore | null, [k, v]: [string, any]): React.FC<NodeStore> | null => {
    if (_.get(v, 'details') !== undefined) {
        if (_.get(v, 'details.tag') === 'text') {
            return TextDetails;
        }
    }
    return null;
};

const defaultDisplayedName = ([k, v]: [string, any]): string => {
    return k;
}

const defaultVisibleFilter = ([k, v]: [string, any]): boolean => {
    _.set(v, name, k);
    return true;
    //return true;//return v.name !== undefined;
};

const defaultUnpackFilter = ([k, v]: [string, any]): boolean => {
    return false;//return k === "children";
};

const defaultPreToggled = (values: any): boolean => {
    return _.get(values, 'result') !== "passed";
};

const Icons: React.FC<NodeStore> = (node: NodeStore) => {
    let result = _.get(node.values, 'result');
    if (result !== undefined) {
        if (result === "passed") {
            return (<FontAwesomeIcon icon={faCheck} color="green" size="sm" fixedWidth />);
        } else if (result === "error") {
            return (<FontAwesomeIcon icon={faTimes} color="red" size="sm" fixedWidth />);
        } else if (result === "missing") {
            return (<FontAwesomeIcon icon={faTimes} color="red" size="sm" fixedWidth />);
        } else if (result === "failed") {
            return (<FontAwesomeIcon icon={faTimes} color="yellow" size="sm" fixedWidth />);
        }
    }
    return (<FontAwesomeIcon icon={faFolder} size="sm" fixedWidth />);
};

export const TestResultsViewJunit: React.FC<TestResultsViewJunitProps> = (props: TestResultsViewJunitProps) => {

    let tests_json = _.get(props.testresults, 'testsuites'); // TODO: display multiple testsuites

    //return (
    //    <code>{JSON.stringify(tests_json)}</code>
    //);
    return (
        <DetailsTree root={props.testresults}
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
