import { Labeled, useInput } from "react-admin";
import { Select, MenuItem, TextField, Box } from '@mui/material/';
import { useEffect, useState } from "react";

const AddressInput = (props) => {

    const protocols = {
        FILE: 'file:',
        HTTP: 'http:',
        HTTPS: 'https:',
        UDP: 'udp:',
        RTP: 'rtp:',
        RTMP: 'rtmp:',
        HLS: 'hls:'
    };

    const protocolPatterns = {};
    protocolPatterns[protocols.FILE] = 'movie.mp4';    
    protocolPatterns[protocols.HTTP] = 'http://server:port/movie.mp4';    
    protocolPatterns[protocols.HTTPS] = 'https://server:port/movie.mp4';    
    protocolPatterns[protocols.UDP] = 'udp://hostname:port[?options]';    
    protocolPatterns[protocols.RTP] = '';    
    protocolPatterns[protocols.RTMP] = 'rtmp://[username:password@]server[:port][/app][/instance][/playpath]';    
    protocolPatterns[protocols.HLS] = '';    

    const {
        field: { value, onChange },
        fieldState: { isTouched, invalid, error },
        formState: { isSubmitted },
        isRequired,
    } = useInput(props);

    const [address, setAddress] = useState('http://irib.ir');
    const [protocol, setProtocol] = useState('http:');
    const { source } = props;

    useEffect(() => {

        try {
            let b = value ? new URL(value) : new URL('http://irib.ir');
            setAddress(b.href);
            setProtocol(b.protocol);
        }
        catch (error) {
            setAddress(value);
            setProtocol('file://')
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        onChange(address);
    }, [address, protocol, onChange]);

    const handleProtocolChange = (event) => {
        setProtocol(event.target.value);
        setAddress(protocolPatterns[event.target.value]);
    }

    const handleAddressChange = (event) => {
        setAddress(event.target.value);
    }

    return (
        <Labeled source={source} isRequired={isRequired} fullWidth>
            <Box p="1em">
                <Box display="flex">
                    <Select value={protocol} onChange={handleProtocolChange}>
                        <MenuItem value={protocols.UDP}>UDP</MenuItem>
                        <MenuItem value={protocols.HLS}>HLS</MenuItem>
                        <MenuItem value={protocols.HTTP}>HTTP</MenuItem>
                        <MenuItem value={protocols.HTTPS}>HTTPS</MenuItem>
                        <MenuItem value={protocols.RTP}>RTP</MenuItem>
                        <MenuItem value={protocols.RTMP}>RTMP</MenuItem>
                    </Select>
                    <TextField value={address}
                        fullWidth
                        // variant="filled"
                        onChange={handleAddressChange}
                        error={!!(isTouched && error)}
                        helperText={isTouched && error} />
                </Box>
            </Box>
        </Labeled>);
};



export default AddressInput;