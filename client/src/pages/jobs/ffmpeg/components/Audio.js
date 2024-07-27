import form from '../form';
import React from 'react';
import { Grid, Box, FormLabel, FormGroup } from '@mui/material';
import { Select, TextField, MenuItem } from '@mui/material';

const Audio = (props) => {

    const {
        codecs,
        audioChannels,
        audioQualities,
        sampleRates,
    } = form;

    const data = {
        items: [
            { name: 'codec', config: codecs },
            { name: 'channel', config: audioChannels },
            { name: 'quality', config: audioQualities },
            { name: 'sampleRate', config: sampleRates },
        ],
        codecs,
    };

    const update = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        props.dataChanged("audio", name, value);
    };

    // TODO
    const filtered = (name) => {
        if (name === 'codec') {
            return codecs.audio.filter(
                (o) => !o.supported || o.supported.includes(props.data.format.container),
            );
        }
        return data.items.find((o) => o.name === name).config;
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                {
                    data.items.map(item => {
                        return (
                            <Grid item xs>
                                <TextField fullWidth select size="small" label={item.name} onChange={update} name={item.name} value={props.data.audio[item.name]}>
                                    <MenuItem value="null" disabled>-- Please select an option --</MenuItem>
                                    {
                                        filtered(item.name).map(o => {
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
                {(props.data.audio.quality === 'custom') && <Grid item xs>
                    <TextField label="Bitrate:" size="small" onChange={update} name="bitrate" value={props.data.audio.bitrate} />
                </Grid>
                }
                <Grid item>
                    <TextField label="Volume:" size="small" onChange={update} name="volume" type="number" value={props.data.audio.volume} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Audio;