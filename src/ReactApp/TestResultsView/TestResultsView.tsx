import * as React from 'react';
import {Fragment} from 'react';
import {NodeStore, DetailsTree} from './DetailsTree';
import {Tabs, Tab} from './Tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SplitPane from 'react-split-pane';
import { faCheck, faTimes, faFolder, faExclamation, faUserGraduate, faBook } from '@fortawesome/free-solid-svg-icons';

import * as _ from 'lodash';

//import './App.css';

const info_mapping: Record<string, string> = {
    "2": "there was no comparison done",
    "1": "all elements are the same",
    "0": "not all elemts are the same",
    "-1": "class does not agree",
    "-2": "dimension does not agree",
    "-3": "size does not agree",
    "-4": "is not present in student results",
    "-5": "can not be compared (function_handle,inline)",
    "-6": "is not present in reference results"
};

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
}

const ComparisonDetailsView: React.FC<NodeStore> = (props: NodeStore) => {
    let comparison = _.get(props.values, 'comparison_');
    const info: string = info_mapping[comparison];

    let student_value: string = _.get(props.values, 'value_.student_.value_');
    let reference_value: string = _.get(props.values, 'value_.reference_.value_');

    // hack for matrix formatting in matlab testresults json
    student_value = student_value.replace(/\\n/g, '<br\>');
    student_value = student_value.replace(/\n/g, '<br\>');
    reference_value = reference_value.replace(/\\n/g, '<br\>');
    reference_value = reference_value.replace(/\n/g, '<br\>');

    if (comparison === "0") {
        [student_value, reference_value] = mark_difference(student_value, reference_value);
    }

    const tabs: Tab[] = [
        {name: "student", icon: (<FontAwesomeIcon icon={faUserGraduate} size="sm" fixedWidth />),
         content: (
            <div>
                <p>{info}</p>
                <p>class = {_.get(props.values, 'value_.student_.class_')}</p>
                <p>size = {_.get(props.values, 'value_.student_.size_')}</p>
                <p><code style={{whiteSpace: "pre-wrap"}}dangerouslySetInnerHTML={{__html: student_value}}/></p>
            </div>)
        },
        {name: "reference", icon: (<FontAwesomeIcon icon={faBook} size="sm" fixedWidth />),
         content: (
            <div>
                <p>{info}</p>
                <p>class = {_.get(props.values, 'value_.reference_.class_')}</p>
                <p>size = {_.get( props.values, 'value_.reference_.size_')}</p>
                <p><code style={{whiteSpace: "pre-wrap"}}dangerouslySetInnerHTML={{__html: reference_value}}/></p>
            </div>)
        },
    ];
    return(<Tabs tabs={tabs}/>);
}

const CellComparisonDetailsView: React.FC<NodeStore> = (props: NodeStore) => {
    const cell_node: NodeStore = {name: props.name,
                                  values: _.get(props.values, 'cell'),
                                  parent: props.parent,
                                  is_leaf: true};
    return ComparisonDetailsView(cell_node);
}

const visibleFilter = ([k, v]: [string, any]): boolean => {
    return !k.endsWith("_") || k === "value_";
}

const unpackFilter = ([k, v]: [string, any]): boolean => {
    if (k === "value_") {
        return true;
    }
    return false;
}

const detailsMapping = (parent: NodeStore | null, [k, v]: [string, any]): React.FC<NodeStore> | null => {
    if (parent !== null) {
        if (_.get(v, 'value_.student_') !== undefined &&
            _.get(v, 'value_.reference_') !== undefined) {
            //if (parent.name === "comparison" && k !== "mltutorGraphicsResults") {
            return ComparisonDetailsView;
        }
        if (_.get(v, 'cell.value_.student_') !== undefined &&
            _.get(v, 'cell.value_.reference_') !== undefined) {
            return CellComparisonDetailsView;
        }
    }
    // no details mapping found
    return null;
}

const Icons: React.FC<NodeStore> = (node: NodeStore) => {
    let comparison: any;
    if (node.parent === null && _.get(node.values, 'comparison') !== undefined) {
        comparison = _.get(node.values, 'comparison.comparison_');
    } else if (_.get(node.values, 'comparison_') === undefined) {
        if (_.get(node.values, 'cell.comparison_') !== undefined) {
            comparison = _.get(node.values, 'cell.comparison_');
        }
    } else {
        comparison = _.get(node.values, 'comparison_');
    }

    if (comparison === "1") { // correct
        return (<FontAwesomeIcon icon={faCheck} color="green" size="sm" fixedWidth />);
    }
    if (comparison === "0") { // wrong value
        return (<FontAwesomeIcon icon={faTimes} color="yellow" size="sm" fixedWidth />);
    }
    if (comparison < 0) { // other error
        return (<FontAwesomeIcon icon={faTimes} color="red" size="sm" fixedWidth />);
    }

    if (detailsMapping(node.parent, [node.name, node.values]) === null) {
        return (<FontAwesomeIcon icon={faFolder} size="sm" fixedWidth />);
    } else {
        return (<FontAwesomeIcon icon={faExclamation} size="sm" fixedWidth />);
    }

    //return null;
}

interface TestResultsViewProps {
    testresults: any;
}

const BottomView: React.FC<NodeStore> = (props: NodeStore) => {
    return (
        <SplitPane split={"horizontal"} minSize={50} defaultSize={100}>
            <div className="tree-container" tabIndex={0}>
                {_.get(props.values, 'information_').map((line: any) => <>{line}<br /></>)}
            </div>
            <div className="details-container" tabIndex={0}>
                <DetailsTree root={props.values}
                             visibleFilter={visibleFilter}
                             unpackFilter={unpackFilter}
                             detailsMapping={detailsMapping} 
                             iconsComp={Icons}
                             split={"vertical"}
                             minSize={100}
                             defaultSize={400}
                             />
            </div>
        </SplitPane>
    );
}

const defaultVisibleFilter = ([k, v]: [string, any]): boolean => {
    return k !== "status";
}

const defaultUnpackFilter = ([k, v]: [string, any]): boolean => {
    return false;
}

const topViewDetailsMapping = (parent: NodeStore | null, [k, v]: [string, any]): React.FC<NodeStore> | null => {
    return BottomView
}

const topViewIcons: React.FC<NodeStore> = (node: NodeStore) => {
    let comparison = _.get(node.values, 'comparison.comparison_');
    if (comparison !== undefined) {
        if (comparison === "1") {
            return (<FontAwesomeIcon icon={faCheck} color="green" size="sm" fixedWidth />);
        } else {
            return (<FontAwesomeIcon icon={faTimes} color="red" size="sm" fixedWidth />);
        }
    }
    return (<FontAwesomeIcon icon={faFolder} size="sm" fixedWidth />);
}

const TestResultsView: React.FC<TestResultsViewProps> = (props: TestResultsViewProps) => {

    let tests_json = _.get(props.testresults, 'json');
    let information = _.get(props.testresults, 'info.Information');
    _.entries(tests_json).forEach(([k, v]: [string, any]) => {
        _.assign(v, {testcount_: _.get(information, 'testcount'),
                     submissioncount_: _.get(information, 'submissioncount')});
        if (_.get(information, k) !== undefined) {
            _.assign(v, {information_: _.get(information, k)});
        }
    });

    return (
        <DetailsTree root={tests_json}
                     visibleFilter={defaultVisibleFilter}
                     unpackFilter={defaultUnpackFilter}
                     detailsMapping={topViewDetailsMapping} 
                     iconsComp={topViewIcons}
                     split={"horizontal"}
                     minSize={50}
                     defaultSize={100}
                     />
    );
}

export default TestResultsView;
