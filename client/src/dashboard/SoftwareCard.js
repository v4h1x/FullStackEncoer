import React, { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, Grid } from '@mui/material';
import systemInfoApi from '../dataProviders/systemInfoDataProvider';
import { useAuthProvider, useLogout } from 'react-admin';
import { Icon } from '@mui/material';
import SwIcon from '../assets/transcoder.png';

const SoftwareInfoCard = () => {

    const [swInfo, setSwInfo] = useState({});
    const authProvider = useAuthProvider();
    const logout = useLogout();

    useEffect(() => {
        const fetchSwInfo = async () => {
            try {
                const info = await systemInfoApi.fetchInfo(systemInfoApi.resources.software);
                setSwInfo(info);
            }
            catch (error) {
                let a = { status: parseInt(error.message) };
                authProvider.checkError(a)
                    .then(() => { }, () => logout());
            }
        }
        fetchSwInfo()
    }, []);

    return (
        <Card>
            <CardHeader title="Software Information"
            />
            <CardContent>
                <img src={SwIcon} height={100} width={100} />
                <Grid container direction='column' rowSpacing={1} columns={4}>
                    {
                        Object.keys(swInfo).map(key =>
                                <Grid item container xs={1}>
                                    <Grid item xs={5} >
                                        {key}
                                    </Grid>
                                    <Grid item xs={7}>
                                        {swInfo[key]}
                                    </Grid>
                                </Grid>)
                    }
                </Grid>
            </CardContent>
        </Card>
    );
};

export default SoftwareInfoCard;