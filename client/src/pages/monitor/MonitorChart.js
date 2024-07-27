import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, TextField, MenuItem } from '@mui/material';
import telemetryApi from '../../dataProviders/telemetryDataProvider';
import { useAuthProvider, useLogout } from 'react-admin';
import strftime from './strftime';

const colors = ["#8884d8", "#e88488"];
const DataIntervals = {
    realtime: { id: "realtime", name: "Realtime", period: 120, refresh: 5, group: null, window: 60, format: '%X' },
    day: { id: "day", name: "Last Day", period: 60 * 60 * 24, refresh: 60 * 60, group: 'minute', window: 24, format: '%a %H' },
    week: { id: "week", name: "Last Week", period: 60 * 60 * 24 * 7, refresh: 60 * 60 * 24, group: 'day', window: 7, format: '%A' },
    month: { id: "month", name: "Last Month", period: 60 * 60 * 24 * 30, refresh: 60 * 60 * 24, group: 'day', window: 30, format: '%m/%d' },
    year: { id: "year", name: "Last Year", period: 60 * 60 * 24 * 365, refresh: 60 * 60 * 24, group: 'day', window: 365, format: '%Y/%m' },
}

const LogChart = (props) => {

    const { metric, max } = props;
    const [data, setData] = useState([]);
    const [series, setSeries] = useState([]);
    const [dataWindow, setDataWindow] = useState(DataIntervals.realtime);

    const authProvider = useAuthProvider();
    const logout = useLogout();


    useEffect(() => {

        const process = (telemetryData, endTime) => {
            let d = [];

            let tMap = {}
            if (dataWindow.id === 'realtime') {
                for (let t of telemetryData) {
                    let dateStr = strftime(dataWindow.format, new Date(t.timestamp * 1000))
                    if (!tMap[dateStr]) {
                        d.push({
                            time: dateStr,
                        });
                        tMap[dateStr] = d.length - 1;
                    }
                }
            }
            else {
                for (let ts = dataWindow.window - 1; ts >= 0; ts--) {
                    let date = new Date((endTime - ts * dataWindow.refresh) * 1000);
                    let dateStr = strftime(dataWindow.format, date);
                    d.push({
                        time: dateStr,
                    });
                    tMap[dateStr] = d.length - 1;
                }
            }
            let names = new Set();
            for (let t of telemetryData) {
                names.add(t.name);
                let index = tMap[strftime(dataWindow.format, new Date(t.timestamp * 1000))]
                d[index][t.name] = t.data.toFixed(2);
            }
            return { newData: d, newSeries: names };

        };

        const fetch = async () => {
            try {
                let end = Math.floor(Date.now() / 1000);
                let start = end - dataWindow.period;
                const telemetryData = await telemetryApi.fetchMetrics(start, end, metric, dataWindow.group);
                const { newData, newSeries } = process(telemetryData, end);
                setSeries([...newSeries]);
                setData(newData);
            }
            catch (error) {
                let a = { status: parseInt(error.message) };
                authProvider.checkError(a)
                    .then(() => { }, () => logout());
            }
        }

        fetch();
        const interval = setInterval(() => {
            fetch()
        }, dataWindow.refresh * 1000)

        return () => clearInterval(interval)
    }, [dataWindow, metric, authProvider, logout]);

    const updateWindow = e => {
        setDataWindow(DataIntervals[e.target.value]);
    }

    return (
        <Card>
            <CardHeader title={metric} />
            <CardContent>
                <TextField select label="Window" onChange={updateWindow} name="windowComboBox" value={dataWindow.id}>
                    {/* <MenuItem value="null" disabled>-- Please select an option --</MenuItem> */}
                    {
                        Object.entries(DataIntervals).map(k => {
                            return <MenuItem key={k[0]} value={k[1].id}>
                                {k[1].name}
                            </MenuItem>
                        })
                    }
                </TextField>

                <AreaChart
                    width={700}
                    height={150}
                    data={data}
                    margin={{
                        top: 10, right: 30, left: 0, bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis type="number" domain={[0, max ? max : 'dataMax']} tickFormatter={props.formatter} />
                    <Tooltip formatter={props.formatter} />
                    {
                        series.map((s, i) => {
                            return (<Area type="monotone" isAnimationActive={false} dataKey={s} stroke={colors[i]} fill={colors[i]} />)
                        })
                    }
                </AreaChart>
            </CardContent>
        </Card>
    );
};

export default LogChart;
