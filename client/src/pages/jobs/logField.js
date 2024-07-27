import { useEffect, useState } from "react";
import { useAuthProvider, useLogout, useRecordContext, Loading } from 'react-admin';
import { TextField } from '@mui/material';
import PropTypes from 'prop-types';
import jobApi from '../../dataProviders/JobDataProvider';

const LogField = props => {

    const record = useRecordContext();
    const authProvider = useAuthProvider();
    const logout = useLogout();
    const [logs, setLogs] = useState("");
    const [stats, setStats] = useState("");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let buff = '';
        const handler = (newBuff) => {
            let index = newBuff.indexOf('frame=');
            if (index < 0) {
                if (buff.length === 0)
                    setLogs(oldLog => oldLog + newBuff);
                else
                    buff = buff + newBuff;
                return;
            }

            let logEntry = newBuff.substring(0, index);
            if (buff.length === 0) {
                setLogs(oldLog => oldLog + logEntry);
                buff = newBuff.substring(index);
                return
            }
            setStats(buff + newBuff.substring(0, index));
            buff = newBuff.substring(index);
        };

        let cancel = false;
        const fetchLog = async () => {
            let reader = null;
            try {
                if (props.console)
                    reader = await jobApi.attach(record.id);
                else
                    reader = await jobApi.fetchLog(record.id);
                let readResult = await reader.read();
                while (!readResult.done && !cancel) {
                    setLoading(false);
                    let value = String.fromCharCode(...readResult.value);
                    let lines = value.split(/\r\n|\r|\n/);
                    let suffix = lines.length > 1 ? '\n' : '';
                    lines.forEach(line => {
                        // Removeing docker stream header
                        let index = line.indexOf('\0\0\0');
                        if (index > -1) {
                            line = line.substring(index + 7);
                        }
                        handler(line + suffix);
                    });
                    readResult = await reader.read();
                }
                if (cancel) {
                    await reader.cancel();
                    // if (props.console)
                    //     await jobApi.detach(record.id)
                }

            }
            catch (error) {
                let a = { status: parseInt(error.message) };
                authProvider.checkError(a)
                    .then(() => { }, () => logout());
            }
        }
        fetchLog();
        return async () => {
            cancel = true;
        }

    }, [authProvider, logout, props.console, record.id]);

    return (
        <>
            {loading && <Loading />}
            {!loading && <TextField value={(logs.length > 0 ? (logs + '\n') : '') + stats} fullWidth multiline maxRows={Infinity} {...props} />}
        </>
    );
};
LogField.propTypes = {
    console: PropTypes.bool.isRequired,
};
export default LogField;
