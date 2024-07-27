import React, { useState } from 'react';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Drawer from '@mui/material/Drawer';
import Switch from '@mui/material/Switch';
import { Card, CardContent, Box } from '@mui/material';
import { Title, useStore } from 'react-admin';
import MonitorChart from "./MonitorChart";
import Common from 'api/server/common/common';

const Monitor = () => {
    
    const [state, setState] = useStore('monitor.charts.visibility', { cpu: true, memory: true, network: true, gpu: true, disk: true });

    const handleChange = (event) => {
        setState({
            ...state,
            [event.target.name]: event.target.checked,
        });
    };

    return (
        <Card>
            <Title title="Monitor" />

            <Drawer variant='permanent' anchor="right" sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                },
            }}>
                <FormControl component="fieldset" variant="standard" sx={{mt:8, pl:2}}>
                    <FormLabel component="legend">Select metric to display</FormLabel>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch checked={state.cpu} onChange={handleChange} name="cpu" />
                            }
                            label="Cpu"
                        />
                        <FormControlLabel
                            control={
                                <Switch checked={state.memory} onChange={handleChange} name="memory" />
                            }
                            label="Memory"
                        />
                        <FormControlLabel
                            control={
                                <Switch checked={state.network} onChange={handleChange} name="network" />
                            }
                            label="Network"
                        />
                        <FormControlLabel
                            control={
                                <Switch checked={state.disk} onChange={handleChange} name="disk" />
                            }
                            label="Disk"
                        />
                        <FormControlLabel
                            control={
                                <Switch checked={state.gpu} onChange={handleChange} name="gpu" />
                            }
                            label="Gpu"
                        />
                    </FormGroup>
                </FormControl>
            </Drawer>
            <CardContent>
                {state.cpu && <MonitorChart metric="cpu" formatter={v => `${v}%`} />}
                {state.memory && <MonitorChart metric="memory" formatter={Common.formatBytesToString} />}
                {state.network && <MonitorChart metric="network" formatter={Common.formatBytesToString} />}
                {state.disk && <MonitorChart metric="disk" max={100} formatter={v => `${v}%`} />}
                {state.gpu && <MonitorChart metric="gpu" formatter={v => `${v}%`} />}
            </CardContent>
        </Card>
    )
};

export default Monitor;