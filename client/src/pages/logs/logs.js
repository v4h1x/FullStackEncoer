import React, { useState } from 'react';
import moment from 'moment';
import {
    List,
    Datagrid,
    TextField,
    DateField,
} from 'react-admin';
import LogAside from './logAside';

export const LogList = ({ ...props }) => {

    const [from, setFrom] = useState(moment().subtract(1, 'year').valueOf())
    const [until, setUntil] = useState(moment().valueOf());

    const updateUntil = (value) => {
        setUntil(value);
    }

    const updateFrom = (value) => {
        setFrom(value);
    }

    return (
        < List queryOptions={{ meta: { from: from, until: until } }}
            aside={<LogAside from={from} until={until} setFrom={updateFrom} setUntil={updateUntil} />}
            {...props}>
            <Datagrid isRowSelectable={record => false} >
                <DateField showTime source="timestamp" />
                <TextField source="level" />
                <TextField source="message" />
            </Datagrid>
        </List >);
};
