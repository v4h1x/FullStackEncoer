import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader } from '@mui/material';
import systemInfoApi from '../dataProviders/systemInfoDataProvider';
import { useAuthProvider, useLogout } from 'react-admin';

import Common from 'api/server/common/common';

const NetworkUsageChart = (props) => {

    const addData = (data, nbElem, newData) => {

        let d = [];
        for (var i = 0; i < data.length; i++) {
            d.push(data[i])
        }
        if (d.length === nbElem)
            d.shift();

        d.push({
            name: "",
            rx: newData.networkRx,
            tx: -1 * newData.networkTx,
        });
        return d;
    };

    const [data, setData] = useState([]);
    const authProvider = useAuthProvider();
    const logout = useLogout();
    const formatYAxis = (value) => {
        if (value > 0)
            return `${Common.formatBytesToString(value)}`;
        return `${Common.formatBytesToString(-1 * value)}`;
    }

    useEffect(() => {
        const fetchNetworkInfo = async () => {
            try {
                const networkInfo = await systemInfoApi.fetchInfo(systemInfoApi.resources.network);
                setData(data => addData(data, props.window_size, networkInfo));
            }
            catch (error) {
                let a = { status: parseInt(error.message) };
                authProvider.checkError(a)
                    .then(() => { }, () => logout());
            }
        }

        const interval = setInterval(() => {
            fetchNetworkInfo()
        }, 5000)

        return () => clearInterval(interval)
    }, [props.window_size, authProvider, logout]);

    return (
        <Card>
            <CardHeader title="Network Usage" />
            <CardContent>
                <AreaChart
                    width={500}
                    height={200}
                    data={data}
                    margin={{
                        top: 10, right: 30, left: 0, bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis type="number" tickFormatter={formatYAxis} />
                    <Tooltip formatter={formatYAxis}/>
                    <Area type="monotone" isAnimationActive={false} dataKey="rx" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" isAnimationActive={false} dataKey="tx" stroke="#ee84d8" fill="#ee84d8" />
                </AreaChart>
            </CardContent>
        </Card>
    );
};

export default NetworkUsageChart;
