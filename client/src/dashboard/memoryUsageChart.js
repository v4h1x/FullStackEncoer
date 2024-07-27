import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader } from '@mui/material';
import systemInfoApi from '../dataProviders/systemInfoDataProvider';
import { useAuthProvider, useLogout } from 'react-admin';

import Common from 'api/server/common/common';

const MemoryUsageChart = (props) => {

    const addData = (data, nbElem, newData) => {

        let d = [];
        for (var i = 0; i < data.length; i++) {
            d.push(data[i])
        }
        if (d.length === nbElem)
            d.shift();

        d.push({
            name: "",
            free: newData.free,
            used: newData.active,
            total: newData.total,
        });
        return d;
    };

    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const authProvider = useAuthProvider();
    const logout = useLogout();

    useEffect(() => {
        const fetchMemoryInfo = async () => {
            try {
                const load = await systemInfoApi.fetchInfo(systemInfoApi.resources.memoryLoad);
                setData(d => addData(d, props.window_size, load));
                setTotal(load.total);
            }
            catch (error) {
                let a = { status: parseInt(error.message) };
                authProvider.checkError(a)
                    .then(() => { }, () => logout());
            }
        }

        const interval = setInterval(() => {
            fetchMemoryInfo();
        }, 5000)

        return () => clearInterval(interval)
    }, [props.window_size, authProvider, logout]);

    return (
        <Card>
            <CardHeader title="Memory Usage" />
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
                    <YAxis type="number" domain={[0, total]} tickFormatter={Common.formatBytesToString}/>
                    <Tooltip formatter={Common.formatBytesToString}/>
                    <Area type="monotone" isAnimationActive={false} stackId="1" dataKey="used" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" isAnimationActive={false} stackId="1" dataKey="free" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
            </CardContent>
        </Card>
    );
}

export default MemoryUsageChart;