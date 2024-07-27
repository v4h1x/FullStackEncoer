import form from '../form';
import React from 'react';
import { Grid, Box, Stack, FormControlLabel, Typography } from '@mui/material';
import { Checkbox, TextField, MenuItem } from '@mui/material';

const Options = (props) => {

    const {
        extraOptions,
        logLevels,
    } = form;

    const data = {
        extra: [],
        loglevel: 'none',
        extraOptions,
        logLevels,
        ffmpegd: false,
    };

    const update = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        props.dataChanged("options", name, value);
    };

    const updateExtra = (event) => {
        const value = event.target.value;
        const checked = event.target.checked;
        if (checked)
            props.dataChanged("options", "extra", [...props.data.options.extra, value]);
        else
            props.dataChanged("options", "extra", [...props.data.options.extra].filter((e) => e !== value));
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container direction="column" spacing={3}>
                <Grid item xs>
                    <Typography>Extra Flags:</Typography>
                    <Stack>
                        {extraOptions.map(option => {
                            return <FormControlLabel label={option.text} control={<Checkbox
                                key={option.value}
                                value={option.value}
                                checked={props.data.options.extra.includes(option.value)}
                                name="extra" onChange={updateExtra} />}
                            />
                        })}
                    </Stack>
                </Grid>
                <Grid item xs>
                    <Grid container >
                        <Grid item xs={4}>
                            <TextField select fullWidth size="small" label="Log Level:" onChange={update} name="loglevel" value={props.data.options.loglevel}>
                                <MenuItem value="null" disabled>-- Please select an option --</MenuItem>
                                {
                                    data.logLevels.map(o => {
                                        return <MenuItem key={o.id} value={o.value}>
                                            {o.name}
                                        </MenuItem>
                                    })
                                }
                            </TextField>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box >
    );
};
export default Options;