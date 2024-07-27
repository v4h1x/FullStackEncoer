import { TextField, useRecordContext } from 'react-admin';
import Common from 'api/server/common/common';

const StatusField = props => {
    const record = useRecordContext();
    return (
        <TextField
            sx={{
                color: (record && record[props.source] === Common.JobStatus.RUNNING) ? 'green'
                    : (record && record[props.source] === Common.JobStatus.STOPPED) ? 'red'
                        : 'black'
            }}
            {...props}
        />
    );
};

export default StatusField;