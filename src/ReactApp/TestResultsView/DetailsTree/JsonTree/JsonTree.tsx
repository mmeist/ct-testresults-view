import * as React from 'react';
import {MouseEvent} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretRight } from '@fortawesome/free-solid-svg-icons'

import * as _ from 'lodash';

const MAX_DEPTH: number = 100;
const OBJECT_TYPE: string = typeof {};
export const TOGGLED_KEY: string = "_toggled";

export interface NodeStore {
    name: string,
    values: any,
    parent: NodeStore | null,
    is_leaf: boolean,
}

type FilterFunc = ([k, v]: [string, any]) => boolean;
type NameFunc = ([k, v]: [string, any]) => string;

export interface JsonTreeCallbacks {
    onToggle: (node: NodeStore) => void,
    visibleFilter: FilterFunc,
    unpackFilter: FilterFunc,
    displayedName: NameFunc,
    preToggled: (values: any) => boolean,
    leafsFilter: (parent: NodeStore | null, [k, v]: [string, any]) => boolean,
}

interface NodeProps {
    node: NodeStore,
    selected_node: NodeStore | undefined,
    depth: number,
    callbacks: JsonTreeCallbacks,
    iconsComp: React.FC<NodeStore>,
}

interface ChildNodesProps {
    values: any,
    parent: NodeStore | null,
    selected_node: NodeStore | undefined,
    depth: number,
    callbacks: JsonTreeCallbacks,
    iconsComp: React.FC<NodeStore>,
}

export const ChildNodesComp: React.FC<ChildNodesProps> = (props: ChildNodesProps) => {
    function unpackNode([k, v]: [string, any]): [string, any][] {
        if (props.callbacks.unpackFilter([k, v]) === true) {
            return _.entries(v).flatMap(unpackNode);
        }
        return [[k, v]];
    }

    const isToggled = (value: any): boolean => {
        return _.get(value, TOGGLED_KEY) || (_.get(value, TOGGLED_KEY) === undefined && props.callbacks.preToggled(value));
    }

    //let obj_entries: any = Array.isArray(props.values) ? props.values : _.entries(props.values);
    let obj_entries: any = _.entries(props.values);
    console.log('asdasdasd');
    let obj_leafs: any[] = [];
    let obj_nodes: any[] = [];

    let child_nodes: React.ReactElement | null = null;

    obj_entries.flatMap(unpackNode)
               .forEach(([k, v]: [string, any]) => {
        if (props.callbacks.visibleFilter(([k, v])) === false || k === TOGGLED_KEY) {
            return;
        }
        if (props.callbacks.leafsFilter(props.parent, [k, v]) === true || typeof v !== OBJECT_TYPE) {
            obj_leafs.push([k, v]);
        } else {
            obj_nodes.push([k, v]);
        }
    })
    
    if ((isToggled(props.values) || props.parent === null) &&
            (obj_leafs.length > 0 || obj_nodes.length > 0) &&
            props.depth < MAX_DEPTH) {
        child_nodes = (
            <ul>
                {obj_nodes.map(([k, v]) => <NodeComp key={k}
                                                     node={{name: props.callbacks.displayedName([k, v]),
                                                            values: v,
                                                            parent: props.parent,
                                                            is_leaf: false}}
                                                     selected_node={props.selected_node}
                                                     callbacks={props.callbacks}
                                                     iconsComp={props.iconsComp}
                                                     depth={props.depth + 1}/>)}    
                {obj_leafs.map(([k, v]) => <NodeComp key={k}
                                                     node={{name: props.callbacks.displayedName([k, v]),
                                                            values: v,
                                                            parent: props.parent,
                                                            is_leaf: true}}
                                                     selected_node={props.selected_node}
                                                     callbacks={props.callbacks}
                                                     iconsComp={props.iconsComp}
                                                     depth={props.depth + 1}/>)}
            </ul>
        );
    }

    return child_nodes;
}

export const NodeComp: React.FC<NodeProps> = (props: NodeProps) => {
    function handleClick(e: MouseEvent) {
        props.callbacks.onToggle(props.node);
    }

    const isToggled = (value: any): boolean => {
        return _.get(value, TOGGLED_KEY) || (_.get(value, TOGGLED_KEY) === undefined && props.callbacks.preToggled(value));
    }
    
    let child_nodes: React.ReactElement | null = null;

    if (!props.node.is_leaf) {
        child_nodes = (<ChildNodesComp values = {props.node.values}
                                       parent = {props.node}
                                       selected_node={props.selected_node}
                                       callbacks={props.callbacks}
                                       iconsComp={props.iconsComp}
                                       depth={props.depth + 1}/>);
    }

    let classname: string = 'tree-node';
    let selected: boolean = (props.selected_node !== undefined) ?
                             props.node.values === props.selected_node.values &&
                             props.node.name === props.selected_node.name
                             : false;
    if (selected) {
        classname += ' tree-node-selected'
    }

    let toggle_svg;
    if (props.node.is_leaf) {
        toggle_svg = (<FontAwesomeIcon icon={faCaretRight} size="sm" fixedWidth color={"#ffffff00"}/>);
    } else if (isToggled(props.node.values)) {
        toggle_svg = (<FontAwesomeIcon icon={faCaretRight} size="sm" fixedWidth transform={{ rotate: 45 }}/>);
    } else {
        toggle_svg = (<FontAwesomeIcon icon={faCaretRight} size="sm" fixedWidth />);
    }

    return( 
        <li>
            <div onClick={handleClick} className={classname}>
                {toggle_svg}
                {props.iconsComp(props.node)}
                {props.node.name}
            </div>
            {child_nodes}
        </li>
    );
}