import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader } from '@mui/material';
import telemetryApi from '../dataProviders/telemetryDataProvider';
import { useAuthProvider, useLogout } from 'react-admin';
import ClientCommon from '../clientCommon';

const CpuUsageChart = (props) => {

    const addData = (data, nbElem, load) => {

        let d = [];
        // for (var i = 0; i < data.length; i++) {
        //     d.push(data[i])
        // }
        // if (d.length === nbElem)
        //     d.shift();

        d.push({
            name: "",
        });

        for (let t of load) {
            if (d[d.length - 1][t.name])
                d.push({
                    name: "",
                    [t.name]: t.value
                })
            else
                d[d.length - 1][t.name] = t.value;
        }
        return d;
    };

    const [data, setData] = useState([]);
    const [dataInterval, setDataInterval] = useState(60);
    const authProvider = useAuthProvider();
    const logout = useLogout();

    useEffect(() => {
        const fetchCpuInfo = async () => {
            try {
                let end = Math.floor(Date.now() / 1000);
                let start = end - dataInterval;
                const load = await telemetryApi.fetchMetrics(start, end, telemetryApi.categories.cpu);
                setData(data => addData(data, props.window_size, load));
            }
            catch (error) {
                let a = { status: parseInt(error.message) };
                authProvider.checkError(a)
                    .then(() => { }, () => logout());
            }
        }

        const interval = setInterval(() => {
            fetchCpuInfo()
        }, ClientCommon.RefreshTime)

        return () => clearInterval(interval)
    }, [dataInterval, props.window_size, authProvider, logout]);

    return (
        <Card>
            <CardHeader title="Cpu Usage" />
            <CardContent>
                <AreaChart
                    width={500}
                    height={150}
                    data={data}
                    margin={{
                        top: 10, right: 30, left: 0, bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis type="number" domain={[0, 'dataMax']} />
                    <Tooltip />
                    <Area type="monotone" isAnimationActive={false} dataKey="usage" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" isAnimationActive={false} dataKey="system" stroke="#e88488" fill="#e88488" />
                </AreaChart>
            </CardContent>
        </Card>
    );
};

export default CpuUsageChart;
