import { Labeled, useInput } from "react-admin";
import React, { useEffect, useState } from "react";

import { Select, MenuItem, TextField, Box } from '@mui/material/';
import Common from 'api/server/common/common';

const BitrateInput = (props) => {

    const {
        field: { value, onChange },
        fieldState: { isTouched, invalid, error },
        formState: { isSubmitted },
        isRequired,
    } = useInput(props);

    const [unit, setUnit] = useState('Kbps');
    const [v, setV] = useState('10');
    const { source } = props;

    useEffect(() => {
        let b = Common.convertBitRate(value);
        setUnit(b.unit)
        setV(b.v);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        onChange(Common.convertToBitRate(v, unit));
    }, [v, unit, onChange]);

    const handleUnitChange = (event) => {
        setUnit(event.target.value);
    }

    const handleValueChange = (event) => {
        setV(event.target.value);
    }

    return (
        <Labeled source={source} isRequired={isRequired}>
            <Box p="1em">
                <Box display="flex">
                    <TextField value={v}
                        type="number"
                        // variant="filled"
                        onChange={handleValueChange}
                        error={!!(isTouched && error)}
                        helperText={isTouched && error} />
                    <Select value={unit} onChange={handleUnitChange}>
                        <MenuItem value={'bps'}>bps</MenuItem>
                        <MenuItem value={'Kbps'}>Kbps</MenuItem>
                        <MenuItem value={'Mbps'}>Mbps</MenuItem>
                        <MenuItem value={'Gbps'}>Gbps</MenuItem>
                    </Select>
                </Box>
            </Box>
        </Labeled>);
};


export default BitrateInput;