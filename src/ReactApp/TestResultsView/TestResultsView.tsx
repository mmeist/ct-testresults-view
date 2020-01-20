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
    let a_words = a.split(' ');
    let b_words = b.split(' ');
    for (let i = 0; i < a_words.length; i++) {
        if (i > b_words.length) {
            break;
        }
        if (a_words[i] !== b_words[i]) {
            a_words[i] = '<span style="background-color:#770000;">' + a_words[i] + '</span>'
            b_words[i] = '<span style="background-color:#770000;">' + b_words[i] + '</span>'
        }
    } 
    return [a_words.join(' '), b_words.join(' ')];
}

const ComparisonDetailsView: React.FC<NodeStore> = (props: NodeStore) => {
    let comparison = _.get(props.values, 'comparison_');
    const info: string = info_mapping[comparison];

    let student_value: string = _.get(props.values, 'value_.student_.value_');
    let reference_value: string = _.get(props.values, 'value_.reference_.value_');
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
                <p><code dangerouslySetInnerHTML={{__html: student_value}}/></p>
            </div>)
        },
        {name: "reference", icon: (<FontAwesomeIcon icon={faBook} size="sm" fixedWidth />),
         content: (
            <div>
                <p>{info}</p>
                <p>class = {_.get(props.values, 'value_.reference_.value_')}</p>
                <p>size = {_.get( props.values, 'value_.reference_.size_')}</p>
                <p><code dangerouslySetInnerHTML={{__html: reference_value}}/></p>
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

/*const BottomView: React.FC<NodeStore> = (props: NodeStore) => {
    return (
        <SplitPane split={"horizontal"} minSize={100} defaultSize={400}>
            <div className="tree-container" tabIndex={0}>
                asdasdasdasdasd
            </div>
            <SplitPane split={"horizontal"} minSize={100} defaultSize={400}>
                qweqweqwe
            </SplitPane>
            <div className="details-container" tabIndex={0}>
                <DetailsTree root={props.values}
                visibleFilter={visibleFilter}
                unpackFilter={unpackFilter}
                detailsMapping={detailsMapping} 
                iconsComp={Icons}
                split={"vertical"}
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
                     />
    );
    //return (
    //    <>{JSON.stringify(tests_json)}</>
    //);
}*/

const TestResultsView: React.FC<TestResultsViewProps> = (props: TestResultsViewProps) => {
    return (
    <DetailsTree root={props.testresults}
                visibleFilter={visibleFilter}
                unpackFilter={unpackFilter}
                detailsMapping={detailsMapping} 
                iconsComp={Icons}
                split={"vertical"}
                />
    );
}

export default TestResultsView;
