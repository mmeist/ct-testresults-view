import * as React from 'react';
import {Fragment} from 'react';
import {NodeStore, DetailsTree} from './DetailsTree';
import {Tabs, Tab} from './Tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SplitPane from 'react-split-pane';
import { faCheck, faTimes, faFolder, faExclamation, faUserGraduate, faBook } from '@fortawesome/free-solid-svg-icons';

import * as _ from 'lodash';
import { version } from 'react-dom';

const mark_difference = (a: string, b: string): [string, string] => {
    let a_leading_spaces = a.search(/\S/);
    let b_leading_spaces = b.search(/\S/);
    let a_words = a.substring(a_leading_spaces).split(/(\s+)/);
    let b_words = b.substring(b_leading_spaces).split(/(\s+)/);
    for (let i = 0; i < a_words.length; i += 2) {
        // dont compare length of whitespaces, therefore i += 2
        if (i > b_words.length) {
            break;
        }
        if (a_words[i] !== b_words[i]) {
            a_words[i] = '<span style="background-color:#770000;">' + a_words[i] + '</span>'
            b_words[i] = '<span style="background-color:#770000;">' + b_words[i] + '</span>'
        }
    } 
    return [' '.repeat(a_leading_spaces) + a_words.join(''),
            ' '.repeat(b_leading_spaces) + b_words.join('')];
};

const ComparisonDetailsView: React.FC<NodeStore> = (props: NodeStore) => {
    const details: string = _.get(props.values, 'details');
    const info: string = _.get(details, 'info');

    let student_value: string = _.get(details, 'student.value');
    let reference_value: string = _.get(details, 'reference.value');

    // hack for matrix formatting in matlab testresults json
    student_value = student_value.replace(/\\n/g, '<br\>');
    student_value = student_value.replace(/\n/g, '<br\>');
    reference_value = reference_value.replace(/\\n/g, '<br\>');
    reference_value = reference_value.replace(/\n/g, '<br\>');

    if (info === "not all elemts are the same") {
        [student_value, reference_value] = mark_difference(student_value, reference_value);
    }

    const tabs: Tab[] = [
        {name: "student", icon: (<FontAwesomeIcon icon={faUserGraduate} size="sm" fixedWidth />),
         content: (
            <div>
                <p>{info}</p>
                <p>type: {_.get(details, 'student.type')}</p>
                <p>shape: {_.get(details, 'student.shape')}</p>
                <p><code style={{whiteSpace: "pre-wrap"}}dangerouslySetInnerHTML={{__html: student_value}}/></p>
            </div>)
        },
        {name: "reference", icon: (<FontAwesomeIcon icon={faBook} size="sm" fixedWidth />),
         content: (
            <div>
                <p>{info}</p>
                <p>type: {_.get(details, 'reference.type')}</p>
                <p>shape: {_.get( details, 'reference.shape')}</p>
                <p><code style={{whiteSpace: "pre-wrap"}}dangerouslySetInnerHTML={{__html: reference_value}}/></p>
            </div>)
        },
    ];
    return(<Tabs tabs={tabs}/>);
};

interface TestResultsViewProps {
    testresults: any;
}

const bottomViewDetailsMapping = (parent: NodeStore | null, [k, v]: [string, any]): React.FC<NodeStore> | null => {
    if (_.get(v, 'details') !== undefined) {
        if (_.get(v, 'details.tag') === 'comparison') {
            return ComparisonDetailsView;
        }
    }
    return null;
}

const BottomView: React.FC<NodeStore> = (props: NodeStore) => {
    return (
        <SplitPane split={"horizontal"} minSize={50} defaultSize={100}>
            <div className="tree-container" tabIndex={0}>
                {_.get(props.values, 'info').split('\n').map((line: any) => <>{line}<br /></>)}
            </div>
            <div className="details-container" tabIndex={0}>
                <DetailsTree root={props.values}
                             visibleFilter={defaultVisibleFilter}
                             unpackFilter={defaultUnpackFilter}
                             preToggled={defaultPreToggled}
                             detailsMapping={bottomViewDetailsMapping}
                             displayedName={defaultDisplayedName} 
                             iconsComp={Icons}
                             split={"vertical"}
                             minSize={100}
                             defaultSize={400}
                             />
            </div>
        </SplitPane>
    );
}

const defaultDisplayedName = ([k, v]: [string, any]): string => {
    return v.name !== undefined ? v.name : k;
}

const defaultVisibleFilter = ([k, v]: [string, any]): boolean => {
    return v.name !== undefined;
}

const defaultUnpackFilter = ([k, v]: [string, any]): boolean => {
    return k === "children" || k === "testsuites" || k === "tests";
}

const defaultPreToggled = (values: any): boolean => {
    return _.get(values, 'result') !== "passed";
}

const topViewDetailsMapping = (parent: NodeStore | null, [k, v]: [string, any]): React.FC<NodeStore> | null => {
    return BottomView;
}

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
}

export const TestResultsView: React.FC<TestResultsViewProps> = (props: TestResultsViewProps) => {

    let tests_json = _.get(props.testresults, 'testsuites.0'); // TODO: display multiple testsuites

    return (
        <DetailsTree root={tests_json}
                     visibleFilter={defaultVisibleFilter}
                     unpackFilter={defaultUnpackFilter}
                     preToggled={defaultPreToggled}
                     detailsMapping={topViewDetailsMapping} 
                     displayedName={defaultDisplayedName} 
                     iconsComp={Icons}
                     split={"horizontal"}
                     minSize={50}
                     defaultSize={100}
                     />
    );
}