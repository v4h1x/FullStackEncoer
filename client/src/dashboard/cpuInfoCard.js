import React, { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, Table, TableBody, TableRow, TableCell, TableHead, TableContainer, Paper } from '@mui/material';
import systemInfoApi from '../dataProviders/systemInfoDataProvider';
import { useAuthProvider, useLogout } from 'react-admin';
import { Icon } from '@mui/material';
import CpuIcon from '../assets/cpu.svg';

const CpuInfoCard = () => {

    const [cpuInfo, setCpuInfo] = useState({});
    const authProvider = useAuthProvider();
    const logout = useLogout();

    useEffect(() => {
        const fetchCpuIfno = async () => {
            try {
                const info = await systemInfoApi.fetchInfo(systemInfoApi.resources.cpu);
                setCpuInfo(info);
            }
            catch (error) {
                let a = { status: parseInt(error.message) };
                authProvider.checkError(a)
                    .then(() => { }, () => logout());
            }
        }
        fetchCpuIfno()
    }, [authProvider, logout]);

    return (
        <Card>
            <CardHeader title="Cpu Information"
                avatar={
                    <Icon>
                        <img src={CpuIcon} height={25} width={25} />
                    </Icon>}
            />
            <CardContent>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow key="cpu-header">
                                <TableCell>Manufacturer</TableCell>
                                <TableCell>Brand</TableCell>
                                <TableCell>Speed</TableCell>
                                <TableCell>Cores</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow key="cpu-data">
                                <TableCell>{cpuInfo.manufacturer}</TableCell>
                                <TableCell>{cpuInfo.brand}</TableCell>
                                <TableCell>{cpuInfo.speed}</TableCell>
                                <TableCell>{cpuInfo.cores}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

export default CpuInfoCard;