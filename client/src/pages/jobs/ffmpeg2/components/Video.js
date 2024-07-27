import form from '../form';
import React from 'react';
import { Grid, Box, FormLabel, FormGroup } from '@mui/material';
import { TextField, Slider, MenuItem } from '@mui/material';

const Video = (props) => {

    const {
        codecs,
        presets,
        passOptions,
        pixelFormats,
        frameRates,
        speeds,
        tunes,
        profiles,
        levels,
        fastStart,
        sizes,
        formats,
        aspects,
        scalings,
    } = form;

    const data = {
        items: [
            { name: 'Codec', config: codecs },
            { name: 'Preset', config: presets },
            { name: 'Pass', config: passOptions },
        ],
        bitrateItems: [
            { name: 'Bit Rate', value: 'bitrate' },
            { name: 'Min Rate', value: 'minrate' },
            { name: 'Max Rate', value: 'maxrate' },
            { name: 'Buffer Size', value: 'bufsize' },
            { name: 'GOP Size', value: 'gopsize', supported: ['x264', 'vp9'] },
        ],
        videoEditItems: [
            { name: 'pixel_format', config: pixelFormats },
            { name: 'frame_rate', config: frameRates },
            { name: 'speed', config: speeds },
            { name: 'tune', config: tunes },
            { name: 'profile', config: profiles },
            { name: 'level', config: levels },
        ],
        videoSizeItems: [
            { name: 'faststart', config: fastStart },
            { name: 'size', config: sizes },
            { name: 'format', config: formats },
            { name: 'aspect', config: aspects },
            { name: 'scaling', config: scalings },
        ],
        codecs,
        presets,
    };

    const update = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        props.dataChanged("video", name, value);
    };

    const filtered = (name) => {
        if (name === 'Codec') {
            return codecs.video.filter(
                (o) => !o.supported || o.supported.includes(props.data.format.container),
            );
        }
        if (name === 'Preset') {
            return presets.filter(
                (o) => !o.supported || o.supported.includes(props.data.video.codec),
            );
        }
        return data.items.find((o) => o.name === name).config;
    };

    const filteredBitrateItems = () => {
        return data.bitrateItems.filter(
            (o) => !o.supported || (o.supported && o.supported.includes(props.data.video.codec)),
        );
    };

    return (
        <Box sx={{ flexGrow: 1 }} size="small">
            <Grid container direction="column" spacing={4}>
                {/* 1st Row: Codec and Preset options */}
                <Grid container item spacing={2}>
                    {
                        data.items.map(item => {
                            return (
                                <Grid item xs>
                                    <TextField fullWidth select size="small" label={item.name} onChange={update} name={item.name.toLowerCase()} value={props.data.video[item.name.toLowerCase()]}>
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
                </Grid>
                {/* CRF slider if CRF enabled */}
                {(props.data.video.pass === 'crf') ?
                    (<Grid container item spacing={2}>
                        <Grid item xs>
                            <FormGroup size="small">
                                <FormLabel>{"CRF:" + props.data.video.crf}</FormLabel>
                                <Slider onChange={update} name="crf"
                                    step={1}
                                    min={0}
                                    max={51} value={props.data.video.crf} />
                            </FormGroup>
                        </Grid>
                    </Grid>)
                    : null}
                {/* 2nd Row: Bit rate options */}
                <Grid container item spacing={2}>
                    {
                        filteredBitrateItems().map(item => {
                            return (
                                <Grid item xs>
                                    <TextField fullWidth size="small" onChange={update} name={item.value} label={item.name} value={props.data.video[item.value]} />
                                </Grid>
                            )
                        })
                    }
                </Grid>
                {/* 3rd Row: Video editing options */}
                <Grid container item spacing={2}>
                    {
                        data.videoEditItems.map(item => {
                            return (
                                <Grid item xs>
                                    <TextField fullWidth select size="small" label={item.name} onChange={update} name={item.name.toLowerCase()} value={props.data.video[item.name.toLowerCase()]}>
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
                {/* 4th Row: Video scaling options */}
                <Grid container item spacing={2}>
                    {
                        data.videoSizeItems.map(item => {
                            return (
                                <Grid item xs>
                                    <TextField fullWidth select size="small" label={item.name} onChange={update} name={item.name.toLowerCase()} value={props.data.video[item.name.toLowerCase()]}>
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
                {/* Width and Height inputs if Custom Size is enabled */}
                {(props.data.video.size === 'custom') && <Grid container item spacing={2}>
                    <Grid item>
                        <TextField label="Width" name="width" size="small" onChange={update} value={props.data.video.width} />
                    </Grid>
                    <Grid item>
                        <TextField label="Height" name="height" size="small" onChange={update} value={props.data.video.height} />
                    </Grid>
                </Grid>
                }
                {/* Optional Codec Params */}
                {['x264', 'x265'].includes(props.data.video.codec) && <Grid container item>
                    <TextField fullWidth label="Codec Options" helperText={"Set optional -" + props.data.video.codec + "-params here to overwrite encoder options."}
                        multiline rows={6} onChange={update} name="codec_options" value={props.data.video.codec_options} />
                </Grid>
                }
            </Grid>
        </Box>
    );

};

export default Video;