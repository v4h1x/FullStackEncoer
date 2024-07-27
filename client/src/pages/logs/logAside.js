import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const LogAside = (props) => {

    const {from, setFrom, until, setUntil} = props;

    return (
        <div style={{ width: 200, margin: '1em' }}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
                <DateTimePicker
                    renderInput={(props) => <TextField {...props} />}
                    label="From"
                    value={from}
                    onChange={(newValue) => {
                        setFrom(newValue.valueOf());
                    }}
                />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterMoment}>
                <DateTimePicker
                    renderInput={(props) => <TextField {...props} />}
                    label="Until"
                    value={until}
                    onChange={(newValue) => {
                        setUntil(newValue.valueOf());
                    }}
                />
            </LocalizationProvider>
        </div>
    )
};
export default LogAside