import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader } from '@mui/material';
import systemInfoApi from '../dataProviders/systemInfoDataProvider';
import { useAuthProvider, useLogout } from 'react-admin';

const SummaryInfoChart = (props) => {

    const [data, setData] = useState([]);
    const authProvider = useAuthProvider();
    const logout = useLogout();

    useEffect(() => {
        const fetchSummaryInfo = async () => {
            try {
                const summary = await systemInfoApi.fetchInfo(systemInfoApi.resources.summary);
                let data = [];
                data.push({ name: 'cpu', cpu: summary.cpu });
                data.push({ name: 'memory', memory: summary.memory });
                data.push({ name: 'disk', disk: summary.disk });
                setData(data);
            }
            catch (error) {
                let a = { status: parseInt(error.message) };
                authProvider.checkError(a)
                    .then(() => { }, () => logout());
            }
        }

        fetchSummaryInfo();
        const interval = setInterval(() => {
            fetchSummaryInfo()
        }, 5000)

        return () => clearInterval(interval)
    }, [props.window_size, authProvider, logout]);

    return (
        <Card sx={{ height: "100%" }}>
            <CardHeader title="Sumary" />
            <CardContent>
                <BarChart
                    layout="vertical"
                    width={400}
                    height={180}
                    data={data}
                    barSize={60}
                    margin={{
                        top: 5,
                        right: 5,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Bar barSize={60} dataKey="cpu" fill="#8884d8" />
                    <Bar barSize={60} dataKey="memory" fill="#82ca9d" />
                    <Bar barSize={60} dataKey="disk" fill="#ca829d" />
                </BarChart>
            </CardContent>
        </Card>
    );
};

export default SummaryInfoChart;
