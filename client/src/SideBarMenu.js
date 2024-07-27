import * as React from 'react';
import { createElement } from 'react';
import { useMediaQuery } from '@mui/material';
import { DashboardMenuItem, Menu, MenuItemLink, useResourceDefinitions, useSidebarState } from 'react-admin';
import DefaultIcon from '@mui/icons-material/ViewList';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';

export const SideBarMenu = (props) => {
    const resources = useResourceDefinitions()
    const [open] = useSidebarState();
    return (
        <Menu {...props}>
            <DashboardMenuItem />
            {Object.keys(resources).map(name => (
                <MenuItemLink
                    key={name}
                    to={`/${name}`}
                    primaryText={
                        (resources[name].options && resources[name].options.label) ||
                        name.charAt(0).toUpperCase() + name.slice(1)
                    }
                    leftIcon={
                        resources[name].icon ? createElement(resources[name].icon) : <DefaultIcon />
                    }
                    onClick={props.onMenuClick}
                    sidebarIsOpen={open}
                />
            ))}
            <MenuItemLink to="/monitor" primaryText="Monitor" leftIcon={<QueryStatsOutlinedIcon />}/>
        </Menu>
    );
};