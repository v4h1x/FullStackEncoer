import './Command.css'
import React from 'react';
// import { Grid, Box, FormLabel, FormGroup } from '@mui/material';

const Command = (props)=>{

    return (
        <div class="command-box">
            {props.cmd}
        </div>
    );
};

export default Command;