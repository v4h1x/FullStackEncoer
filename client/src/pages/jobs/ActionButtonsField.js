import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';

import { useAuthProvider, useLogout, useRecordContext } from 'react-admin';

import PlayIcon from '@mui/icons-material/PlayCircleFilledRounded';
import StopIcon from '@mui/icons-material/StopRounded';
import { IconButton } from '@mui/material';

import jobApi from '../../dataProviders/JobDataProvider';
import Common from 'api/server/common/common';

const ActionButtonsField = ({ ...props }) => {
    const record = useRecordContext();
    const authProvider = useAuthProvider();
    const logout = useLogout();
    const [status, setStatus] = useState(record.status);

    useEffect(() => {
        setStatus(record.status);
    }, [record.status]);

    function handleStartClick(e) {
        try {
            jobApi.startJob(record.id);
            setStatus(Common.JobStatus.STARTING)
            // record.status = Common.JobStatus.RUNNING;
        }
        catch (error) {
            let a = { status: parseInt(error.message) };
            authProvider.checkError(a)
                .then(() => { }, () => logout());

        }
    }

    function handleStopClick(e) {
        try {
            jobApi.stopJob(record.id);
            setStatus(Common.JobStatus.STOPPING);
            // record.status = Common.JobStatus.STOPPED;
        }
        catch (error) {
            let a = { status: parseInt(error.message) };
            authProvider.checkError(a)
                .then(() => { }, () => logout());
        }

    }

    return (
        <span>
            {(status === Common.JobStatus.STOPPED || status === Common.JobStatus.STARTING) &&
                <IconButton label="" aria-label="run" color="primary"
                    onClick={handleStartClick}
                    disabled={status !== Common.JobStatus.STOPPED}>
                    <PlayIcon style={{ color: status === Common.JobStatus.STOPPED ? 'green' : 'gray' }} />
                </IconButton>
            }
            {(status === Common.JobStatus.RUNNING || status === Common.JobStatus.STOPPING) &&
                <IconButton label="" aria-label="stop" color="primary"
                    onClick={handleStopClick}
                    disabled={status !== Common.JobStatus.RUNNING}>
                    <StopIcon style={{ color: status === Common.JobStatus.RUNNING ? 'red' : 'gray' }} />
                </IconButton>
            }
        </span>
    )
}

ActionButtonsField.propTypes = {
    label: PropTypes.string,
};

export default ActionButtonsField;