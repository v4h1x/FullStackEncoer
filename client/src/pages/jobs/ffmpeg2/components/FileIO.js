import form from '../form';
import React, { useState } from 'react';
import { Grid, FormLabel, Stack } from '@mui/material';
import { Select, TextField, MenuItem } from '@mui/material';

const FileIO = (props) => {

    const { protocols, } = form;


    const data = {
        protocols,
        protocolInput: 'movie.mp4',
        protocolOutput: 'movie.mp4',
        showFileBrowser: false,
    };
    const [input, setInput] = useState(protocols[0].value)
    const [output, setOutput] = useState(protocols[0].value)

    const updateProrocol = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        const f = protocols.filter(p => p.name.toLowerCase() === value.toLowerCase())
        if (f) {
            name === "input" ? setInput(f[0].value) : setOutput(f[0].value);
            props.dataChanged("io", name, f[0].value);
        }
    };

    const update = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        name === "input" ? setInput(value) : setOutput(value);
        props.dataChanged("io", name, value);
    };

    const getProtocol = (address) => {
        try {
            let b = address ? new URL(address) : new URL('file://' + protocols[0].value);
            return b.protocol.replace(':', '');
        }
        catch (error) {
            return protocols[0].name.toLowerCase();
        }

    }

    return (
        <Grid container direction="row" wrap="nowrap" spacing={2} pt={3}>
            {/* Input */}
            <Grid container item spacing={1} xs>
                < Grid item xs={2}>
                    <TextField select fullWidth size="small" label="Input:"
                        value={getProtocol(input)} onChange={updateProrocol} name="input" >
                        {
                            data.protocols.map(o => {
                                return <MenuItem key={o.id} value={o.name.toLowerCase()}>
                                    {o.name}
                                </MenuItem>
                            })
                        }
                    </TextField>
                </Grid>
                <Grid item xs>
                    <TextField size="small" fullWidth="true" label="Example: input.mp4"
                        name="input"
                        onChange={update} value={props.data.io.input} />
                </Grid>
            </Grid>
            {/* Output */}
            <Grid container item spacing={1} xs>
                <Grid item xs={2}>
                    <TextField select fullWidth size="small" label="Output:"
                        onChange={updateProrocol} name="output" value={getProtocol(output)}>
                        {
                            data.protocols.map(o => {
                                return <MenuItem key={o.id} value={o.name.toLowerCase()}>
                                    {o.name}
                                </MenuItem>
                            })
                        }
                    </TextField>
                </Grid>
                <Grid item xs>
                    <TextField fullWidth size="small" label="Example: output.mp4"
                        name="output"
                        onChange={update} value={props.data.io.output} />
                </Grid>
            </Grid>
        </Grid>
    );
};

export default FileIO;