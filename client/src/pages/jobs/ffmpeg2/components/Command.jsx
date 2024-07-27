import './Command.css'
import { TextField } from '@mui/material';
import React from 'react';

const Command = (props) => {

    const onChange = (event) => {
        const value = event.target.value;
        props.onChange(value);
    }

    return (
        <TextField fullWidth multiline rows={6}
        
            value={props.cmd}
            onChange={onChange} />
    );
};

export default Command;