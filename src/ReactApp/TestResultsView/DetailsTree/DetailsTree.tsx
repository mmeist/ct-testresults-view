import * as React from 'react';
import {useState, useEffect} from 'react';

import SplitPane from 'react-split-pane';
import "./splitter.css";

import {ChildNodesComp, NodeStore, TOGGLED_KEY} from './JsonTree';

interface DetailsTreeProps {
    root: any,
    visibleFilter: ([k, v]: [string, any]) => boolean,
    unpackFilter: ([k, v]: [string, any]) => boolean,
    detailsMapping: (parent: NodeStore | null, [k, v]: [string, any]) => React.FC<NodeStore> | null,
    iconsComp: React.FC<NodeStore>,
}

export const DetailsTree: React.FC<DetailsTreeProps> = (props: DetailsTreeProps) => {
    const onToggle = (node: NodeStore) => {
        // set toggled for non leaf nodes
        if (!node.is_leaf) {
            if (node.values[TOGGLED_KEY] === undefined) {
                node.values[TOGGLED_KEY] = true;
            } else {
                node.values[TOGGLED_KEY] = !node.values[TOGGLED_KEY];
            }
        }

        setSelectedNode(node);

        // force state update
        setRoot(Object.assign({}, root));
    }

    const leafsFilter = (parent: NodeStore | null, [k, v]: [string, any]): boolean => {
        return props.detailsMapping(parent, [k, v]) != null;
    }

    useEffect(() => {
        // unset selected node when we get a new tree through props
        setSelectedNode(undefined);
    }, [props.root]);

    const [root, setRoot] = useState(props.root);
    const [selected_node, setSelectedNode] = useState<NodeStore | undefined>(undefined);

    let details_view = null;
    if (selected_node !== undefined) {
        let dv_func: React.FC<NodeStore> | null = 
                     props.detailsMapping(selected_node.parent, [selected_node.name, selected_node.values]);
        if (dv_func !== null) {
            let func_args: NodeStore = {name: selected_node.name,
                                        values: selected_node.values,
                                        parent: selected_node.parent,
                                        is_leaf: selected_node.is_leaf};
            details_view = React.createElement(dv_func, func_args);
        }
    }

    const root_nodes = (
        <ChildNodesComp values = {props.root}
                        parent = {null}
                        selected_node={selected_node}
                        onToggle={onToggle}
                        visibleFilter={props.visibleFilter}
                        leafsFilter={leafsFilter}
                        unpackFilter={props.unpackFilter}
                        iconsComp={props.iconsComp}
                        depth={0}/>
    );

    return (
        <SplitPane split="vertical" minSize={100} defaultSize={400}>
            <div className="tree-container" tabIndex={0}>
                {root_nodes}
            </div>
            <div className="details-container" tabIndex={0}>
                {details_view}
            </div>
        </SplitPane>
    );
}
