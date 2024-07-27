import React, { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, Table, TableBody, TableRow, TableCell, TableHead, TableContainer, Paper } from '@mui/material';
import systemInfoApi from '../dataProviders/systemInfoDataProvider';
import { useAuthProvider, useLogout } from 'react-admin';
import Common from 'api/server/common/common';
import { Icon } from '@mui/material';
import RamIcon from '../assets/memory.png';

const MemoryInfoCard = () => {

    const [memoryInfo, setMemoryInfo] = useState([]);
    const authProvider = useAuthProvider();
    const logout = useLogout();

    useEffect(() => {
        const fetchMemoryInfo = async () => {
            try {
                const info = await systemInfoApi.fetchInfo(systemInfoApi.resources.memory);
                setMemoryInfo(info);
            }
            catch (error) {
                let a = { status: parseInt(error.message) };
                authProvider.checkError(a)
                    .then(() => { }, () => logout());
            }
        }
        fetchMemoryInfo();
    }, [authProvider, logout]);

    return (
        <Card>
            <CardHeader title="Memory Information" 
            avatar={
                <Icon>
                    <img src={RamIcon} height={25} width={25} />
                </Icon>}
            />
            <CardContent>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Bank</TableCell>
                                {memoryInfo.map((bank, i) => {
                                    if (bank.type === 'Empty')
                                        return null;
                                    else
                                        return <TableCell>{i}</TableCell>
                                }
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow key="mem">
                                <TableCell>Size</TableCell>
                                {memoryInfo.map((bank, i) => {
                                    if (bank.type === 'Empty')
                                        return null;
                                    else
                                        return <TableCell key={`mem${i}`}>{Common.formatBytesToString(bank.size)}</TableCell>
                                }
                                )}
                            </TableRow>
                            <TableRow key="type">
                                <TableCell>Type</TableCell>
                                {memoryInfo.map((bank, i) => {
                                    if (bank.type === 'Empty')
                                        return null;
                                    else
                                        return <TableCell key={`type${i}`}>{bank.type}</TableCell>
                                }
                                )}
                            </TableRow>
                            <TableRow key="manufacturer">
                                <TableCell>Manufacturer</TableCell>
                                {memoryInfo.map((bank, i) => {
                                    if (bank.type === 'Empty')
                                        return null;
                                    else
                                        return <TableCell key={`manufacturer${i}`}>{bank.manufacturer}</TableCell>
                                }
                                )}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

export default MemoryInfoCard;