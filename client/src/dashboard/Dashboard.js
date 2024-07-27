import * as React from "react";
import CpuUsageChart from './cpuUsageChart';
import MemoryUsageChart from './memoryUsageChart';
import SummaryInfoChart from './summaryChart';
import NetworkUsageChart from './networkChart';
import SystemInfoCard from './systemInfoCard';
import CpuInfoCard from "./cpuInfoCard";
import MemoryInfoCard from "./memoryInfoCard";
import GpuInfoCard from "./gpuInfoCard";
import SoftwareInfoCard from "./SoftwareCard";
import { useAuthState, Loading } from 'react-admin';
import { Grid } from '@mui/material'

const Dashboard = () => {
    const { isLoading, authenticated } = useAuthState();
    if (isLoading) {
        return <Loading />;
    }
    return (
        <Grid container direction="column" spacing={2} sx={{ pt: 1, bt: 1 }}>
            <Grid item container spacing={2}>
                <Grid item xs >
                    <SoftwareInfoCard />
                </Grid>
                <Grid item xs >
                    <SummaryInfoChart valid={authenticated} />
                </Grid>
                {/* <Grid item xs>
                    <NetworkUsageChart window_size={30} valid={authenticated} />
                </Grid> */}
            </Grid>
            <Grid item container spacing={2} alignItems="stretch">
                <Grid item xs>
                    <SystemInfoCard valid={authenticated} />
                </Grid>
                <Grid item xs>
                    <CpuInfoCard valid={authenticated} />
                </Grid>
            </Grid>
            <Grid item container spacing={2} alignItems="stretch">
                <Grid item xs>
                    <MemoryInfoCard valid={authenticated} />
                </Grid>
            </Grid>
            <Grid item>
                <GpuInfoCard window_size={30} valid={authenticated} />
            </Grid>
            {/* <Grid item container spacing={2}>
                <Grid item xs>
                    <CpuUsageChart window_size={30} valid={authenticated} />
                </Grid>
                <Grid item xs>
                    <MemoryUsageChart window_size={30} valid={authenticated} />
                </Grid>
            </Grid> */}
        </Grid>
    )
};

export default Dashboard;