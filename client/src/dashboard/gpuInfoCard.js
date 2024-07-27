import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, Table, TableBody, TableRow, TableCell, TableHead, TableContainer, Paper } from '@mui/material';
import systemInfoApi from '../dataProviders/systemInfoDataProvider';
import { useAuthProvider, useLogout } from 'react-admin';
import Common from 'api/server/common/common';
import { Icon } from '@mui/material';
import GpuIcon from '../assets/gpu.svg';

const GpuInfoCard = (props) => {

    const [gpuInfo, setGpuInfo] = useState({});
    const [data, setData] = useState([]);
    const authProvider = useAuthProvider();
    const logout = useLogout();

    const addData = (data, nbElem, newData) => {

        let d = [];
        for (var i = 0; i < data.length; i++) {
            d.push(data[i])
        }
        if (d.length === nbElem)
            d.shift();

        if (newData.controllers) {
            let controllerData = {};
            controllerData['name'] = '';
            for (const controller of newData.controllers) {
                if (controller.name) {
                    controllerData[`${controller.name}_gpu`] = controller.utilizationGpu;
                    controllerData[`${controller.name}_memory`] = controller.utilizationMemory;
                }
            }
            d.push(controllerData);
        }
        return d;
    };

    const hasCuda = () => {
        if (!gpuInfo.controllers)
            return false;
        for (const controller of gpuInfo.controllers) {
            if (controller.driverVersion)
                return true;
        }
        return false;
    }

    useEffect(() => {
        const fetchGpuInfo = async () => {
            try {
                const info = await systemInfoApi.fetchInfo(systemInfoApi.resources.gpu);
                setGpuInfo(info);
                setData(data => addData(data, props.window_size, info));
            }
            catch (error) {
                let a = { status: parseInt(error.message) };
                authProvider.checkError(a)
                    .then(() => { }, () => logout());
            }
        }

        fetchGpuInfo();
        const interval = setInterval(() => {
            fetchGpuInfo();
        }, 5000)

        return () => clearInterval(interval)

    }, [props.window_size, authProvider, logout]);

    return (
        <div>
            <Card>
                <CardHeader title="Gpu Information"
                    avatar={
                        <Icon>
                            <img src={GpuIcon} height={25} width={25} />
                        </Icon>}
                />
                <CardContent>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow key="gpu-header">
                                    <TableCell>Model</TableCell>
                                    <TableCell>Vendor</TableCell>
                                    <TableCell>Bus</TableCell>
                                    <TableCell>Vram</TableCell>
                                    {hasCuda() && <TableCell>Driver Version</TableCell>}
                                    {/* {hasCuda() && <TableCell>Name</TableCell>} */}
                                    {hasCuda() && <TableCell>Fan Speed</TableCell>}
                                    {hasCuda() && <TableCell>Temperature</TableCell>}
                                    {hasCuda() && <TableCell>Gpu Utilization</TableCell>}
                                    {hasCuda() && <TableCell>Memory Utilization</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {gpuInfo.controllers && gpuInfo.controllers.map((controller, i) =>
                                    <TableRow key={"gpu" + i}>
                                        <TableCell>{controller.model}</TableCell>
                                        <TableCell>{controller.vendor}</TableCell>
                                        <TableCell>{controller.bus}</TableCell>
                                        <TableCell>{Common.formatBytesToString(controller.vram)}</TableCell>
                                        {hasCuda() && <TableCell>{controller.driverVersion ? controller.driverVersion : '-'}</TableCell>}
                                        {/* {hasCuda() && <TableCell> {controller.name ? controller.name : '-'}</TableCell>} */}
                                        {hasCuda() && <TableCell> {controller.fanSpeed ? controller.fanSpeed : '-'}</TableCell>}
                                        {hasCuda() && <TableCell> {controller.temperatureGpu ? controller.temperatureGpu : '-'}</TableCell>}
                                        {hasCuda() && <TableCell> {controller.utilizationGpu ? controller.utilizationGpu : '-'}</TableCell>}
                                        {hasCuda() && <TableCell> {controller.utilizationMemory ? controller.utilizationMemory : '-'}</TableCell>}
                                    </TableRow>
                                )
                                }
                            </TableBody >
                        </Table >
                    </TableContainer >
                </CardContent >
            </Card >
            {/* { hasCuda() && <Card>
                <CardHeader title="Gpu Usage" />
                <CardContent>
                    <LineChart
                        width={500}
                        height={200}
                        data={data}
                        margin={{
                            top: 10, right: 30, left: 0, bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis type="number" />
                        <Tooltip f />
                        {gpuInfo.controllers && gpuInfo.controllers.map(controller => {
                            if (controller.name)
                                return <Line type="monotone" isAnimationActive={false} dataKey={`${controller.name}_gpu`} stroke="#8884d8" fill="#8884d8" />
                            else
                                return null;
                        })}
                        {gpuInfo.controllers && gpuInfo.controllers.map(controller => {
                            if (controller.name)
                                return <Line type="monotone" isAnimationActive={false} dataKey={`${controller.name}_memory`} stroke="#ee84d8" fill="#ee84d8" />
                            else
                                return null;
                        })}
                    </LineChart>
                </CardContent>
            </Card>
            } */}
        </div>
    );
};

export default GpuInfoCard;