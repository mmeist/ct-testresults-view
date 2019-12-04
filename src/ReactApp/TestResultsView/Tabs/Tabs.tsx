import * as React from 'react';
import { useState, useEffect } from 'react';

export interface Tab {
    name: string,
    icon?: React.ReactElement | null,
    content: React.ReactElement | null,
}

interface TabsProps {
    tabs: Tab[],
}

export const Tabs: React.FC<TabsProps> = (props: TabsProps) => {
    function handleClick(tab: Tab) {
        setSelectedTab(tab);
    }

    let default_tab: Tab | undefined = (props.tabs.length > 0) ? props.tabs[0] : undefined;
    const [selected_tab, setSelectedTab] = useState<Tab | undefined>(default_tab); // TODO: only works when first created

    useEffect(() => {
        // update selected tab when pros.tabs change, 
        // keep tab with same name as previously selected tab selected if it exists
        let new_selected_tab = undefined;
        if (selected_tab !== undefined) {
            new_selected_tab = props.tabs.find((tab) => tab.name === selected_tab.name);
        }
        if (new_selected_tab === undefined && (props.tabs.length > 0)) {
            new_selected_tab = props.tabs[0];
        }
        setSelectedTab(new_selected_tab);
    // we do not actually depend on selected_tab since here we only want to update the default selected tab
    // when props.tabs changes, and not when another tab is selected, therefore disable exhaustive-deps warning.
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [props.tabs])

    let tab_headers = (
        <>
            {props.tabs.map((tab) => 
                <div key={tab.name} onClick={() => handleClick(tab)}
                    className={(tab === selected_tab) ? "tab tab-selected" : "tab"}>
                    {tab.icon}{tab.name}
                </div>)}
        </>
    );

    return (
        <div>
            <div className="tabs-header">
                {tab_headers}
            </div>
            <div className="tabs-content">
                {(selected_tab !== undefined) ? selected_tab.content : null}  
            </div>
        </div>
    );
}