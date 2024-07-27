import form from '../form';
import React from 'react';
import { Grid, FormLabel, FormGroup, Typography } from '@mui/material';
import { TextField, Slider, MenuItem } from '@mui/material';

const Filters = (props) => {

    const {
        deband,
        deshake,
        deflicker,
        dejudder,
        denoise,
        deinterlace,
    } = form;

    const data = {
        items: [
            { name: 'deband', config: deband },
            { name: 'deflicker', config: deflicker },
            { name: 'deshake', config: deshake },
            { name: 'dejudder', config: dejudder },
            { name: 'denoise', config: denoise },
            { name: 'deinterlace', config: deinterlace },
        ],
        eq: [
            { name: 'contrast', min: -100, max: 100 },
            { name: 'brightness', min: -100, max: 100 },
            { name: 'saturation', min: 0, max: 300 },
            { name: 'gamma', min: 0, max: 100 },
        ],
        dynamics: [
            { name: 'acontrast', min: 0, max: 100 },
        ],
    };

    const update = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        props.dataChanged("filters", name, value);
    };

    return (
        <Grid container direction="column" spacing={4}>

            <Grid container item>
                <Typography>Video</Typography>
            </Grid>
            <Grid container item spacing={2}>
                {
                    data.items.map(item => {
                        return (
                            <Grid item xs>
                                <TextField select fullWidth size="small" label={item.name} onChange={update} name={item.name.toLowerCase()} value={props.data.filters[item.name.toLowerCase()]}>
                                    <MenuItem value="null" disabled>-- Please select an option --</MenuItem>
                                    {
                                        item.config.map(o => {
                                            return <MenuItem key={o.id} value={o.value}>
                                                {o.name}
                                            </MenuItem>
                                        })
                                    }
                                </TextField>
                            </Grid>
                        )
                    })
                }
            </Grid>
            <Grid container item spacing={2}>
                {
                    data.eq.map(item => {
                        return (
                            <Grid item xs>
                                <FormGroup>
                                    <FormLabel>{item.name}: {props.data.filters[item.name]}</FormLabel>
                                    <Slider onChange={update} name={item.name}
                                        valueLabelDisplay="auto"  size="small"
                                        step={1} min={item.min} max={item.max} />
                                </FormGroup>
                            </Grid>
                        )
                    })
                }
            </Grid>
            <Grid container item>
                <Typography>Audio</Typography>
            </Grid>
            <Grid container item spacing={2}>
                {
                    data.dynamics.map(item => {
                        return (
                            <Grid item xs>
                                <FormGroup>
                                    <FormLabel>{item.name}: {props.data.filters[item.name]}</FormLabel>
                                    <Slider onChange={update} name={item.name}
                                        valueLabelDisplay="auto" size="small"
                                        step={1} min={item.min} max={item.max}
                                        value={props.data.filters[item.name]} />
                                </FormGroup>
                            </Grid>
                        )
                    })
                }
            </Grid>
        </Grid>
    );
};

export default Filters;