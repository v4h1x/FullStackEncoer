import { TabbedShowLayout, Tab, Show, TextField, ReferenceField, Labeled } from 'react-admin'
import { useRecordContext } from 'react-admin'
import { Grid, Typography } from '@mui/material';
import MuiLinkify from "material-ui-linkify";
import StatusField from './statusField';
import JobTitle from './jobTitle';
import Common from 'api/server/common/common';
import LogField from './logField'

const CommandField = () => {
    const record = useRecordContext();
    return (
        <MuiLinkify schema={{ "rtmp:": 'http:', "udp:": 'http:', "hls:": 'http:' }}>
            <Typography variant="body1">
                {record.command}
            </Typography>
        </MuiLinkify>
    );
};

const ShowLayout = (props) => {

    const record = useRecordContext()
    return (
        <TabbedShowLayout {...props}>
            <Tab label="description">
                <Grid container direction="column" spacing={2} sx={{ p: 4 }}>
                    <Grid item>
                        <Labeled>
                            <TextField source="name" />
                        </Labeled>
                    </Grid>
                    <Grid item>
                        <Labeled>
                            <StatusField source="status" addLabel={true} />
                        </Labeled>

                    </Grid>
                    <Grid item>
                        <Labeled>
                            <ReferenceField source="user_id" reference="users">
                                <TextField source="username" />
                            </ReferenceField>
                        </Labeled>
                    </Grid>
                    <Grid item>
                        <Labeled label="Command">
                            {/* <TextField source="command" fullWidth multiline /> */}
                            <CommandField />
                        </Labeled>
                    </Grid>
                </Grid>
            </Tab>
            {record && record.status === Common.JobStatus.RUNNING &&
                <Tab label="console" path="console">
                    <LogField console={true} />
                </Tab>
            }
            <Tab label="log" path="log">
                <LogField />
            </Tab>
        </TabbedShowLayout>
    );
}

const JobShow = (props) => {

    return (
        <Show title={<JobTitle />}{...props}>
            <ShowLayout/>
        </Show>
    )
};

export default JobShow;