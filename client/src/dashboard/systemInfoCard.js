import React, { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, Table, TableBody, TableRow, TableCell, TableHead, TableContainer, Paper } from '@mui/material';
import systemInfoApi from '../dataProviders/systemInfoDataProvider';
import { useAuthProvider, useLogout } from 'react-admin';
import { Icon } from '@mui/material';
import ServerIcon from '../assets/server.png';

const SystemInfoCard = () => {

    const [systemInfo, setSystemInfo] = useState({});
    const authProvider = useAuthProvider();
    const logout = useLogout();

    useEffect(() => {
        const fetchSystemIno = async () => {
            try {
                const info = await systemInfoApi.fetchInfo(systemInfoApi.resources.system);
                setSystemInfo(info);
            }
            catch (error) {
                let a = { status: parseInt(error.message) };
                authProvider.checkError(a)
                    .then(() => { }, () => logout());
            }
        }
        fetchSystemIno()
    }, [authProvider, logout]);

    return (
        <Card>
            <CardHeader title="Server Information"
                avatar={
                    <Icon>
                        <img src={ServerIcon} height={25} width={25} />
                    </Icon>}
            />
            <CardContent>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Manufacturer</TableCell>
                                <TableCell>Model</TableCell>
                                <TableCell>Version</TableCell>
                                <TableCell>Serial</TableCell>
                                {/* <TableCell>Uuid</TableCell>
                                <TableCell>Sku</TableCell> */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>{systemInfo.manufacturer}</TableCell>
                                <TableCell>{systemInfo.model}</TableCell>
                                <TableCell>{systemInfo.version}</TableCell>
                                <TableCell>{systemInfo.serial}</TableCell>
                                {/* <TableCell>{systemInfo.uuid}</TableCell>
                                <TableCell>{systemInfo.sku}</TableCell> */}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

export default SystemInfoCard;