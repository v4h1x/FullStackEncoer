import React, { useEffect, useContext } from 'react';

import { ReferenceField, List, Datagrid, TextField, Create, SimpleForm, TextInput, Edit, required } from 'react-admin';
import { Filter, ReferenceInput, SelectInput, EditButton, ShowButton, Loading } from 'react-admin';
import { useListContext, useDataProvider, usePermissions, useRecordContext } from 'react-admin';

import ActionButtonsField from './ActionButtonsField';
import BulkActionButtons from '../BulkActionButtons';
import AddressInput from './inputs/AddressInput';
import BitrateInput from './inputs/BitrateInput';
import JobTitle from './jobTitle';
import StatusField from './statusField';
import { JobForm } from './jobsForm'
import Common from 'api/server/common/common';
import ClientCommon from '../../clientCommon';
import { SocketContext } from '../../context/socket';

const validateJobName = required('Job name must not be empty.')
const validateDelay = required('Delay must not be empty.')
const validateBitrate = required('Bitrate must not be empty.')
const validateInputAddress = required('Input address must not be empty.')
const validateOutputAddress = required('Output address must not be empty.')

const JobCreateEditForm = props => (
    <SimpleForm {...props}>
        <TextInput source="name" variant="standard" validate={validateJobName} />
        <SelectInput source="type" choices={[
            { id: Common.JobType.CPU, name: 'CPU' },
            // temporariliy disabled
            // { id: 'CONFIGURATION', name: 'Configuration' }
            { id: Common.JobType.GPU, name: 'GPU' },
        ]} />
        <TextInput source="delay" variant="standard" validate={validateDelay} />
        <BitrateInput source="bitrate" validate={validateBitrate} />
        <AddressInput source="input_address" validate={validateInputAddress} />
        <AddressInput source="output_address" validate={validateOutputAddress} />
    </SimpleForm>
);

export const JobCreate = (props) => (
    <Create {...props}>
        <JobForm />
    </Create>
);

export const JobEdit = (props) => {
    const record = useRecordContext();
    return (
        <Edit title={<JobTitle />} {...props}>
            <JobForm edit />
        </Edit>
    )
};

const JobFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Name" source="name" alwaysOn />
        <ReferenceInput label="User" source="user_id" reference="users" allowEmpty>
            <SelectInput optionText="username" />
        </ReferenceInput>
        <SelectInput label="Status" source="status" choices={[
            { id: Common.JobStatus.RUNNING, name: 'Running' },
            { id: Common.JobStatus.STOPPED, name: 'Stopped' }
        ]}
            allowEmpty />
        <SelectInput label="Type" source="type" choices={[
            { id: Common.JobType.CPU, name: 'Cpu' },
            { id: Common.JobType.GPU, name: 'Gpu' },
            { id: Common.JobType.DECKLINK, name: 'DeckLink' },
        ]}
            allowEmpty />
    </Filter>
);

const HoEditButton = props => {
    const record = useRecordContext();
    return (
        <EditButton resource="jobs" record={record} disabled={record.status !== Common.JobStatus.STOPPED} />
    );
};

export const JobDatagrid = ({ ...props }) => {
    const permissions = usePermissions();
    const { data, refetch, isLoading } = useListContext();
    const socket = useContext(SocketContext);
    useEffect(() => {
        const handler = (jobId, status) => {
            refetch();
        };
        socket.on(Common.Events.JOB_STATUS_CHANGED, handler);
        return () => socket.off(Common.Events.JOB_STATUS_CHANGED, handler);
    }, []);

    useEffect(() => {

        const interval = setInterval(() => {
            refetch();
        }, ClientCommon.RefreshTime)

        return () => clearInterval(interval)
    }, []);

    return (
        permissions.isLoading  || isLoading ? null :
        <Datagrid bulkActionButtons={<BulkActionButtons permissions={permissions.permissions} />} >
            <TextField source="name" />
            {/* <TextField source="type" /> */}
            <TextField source="stats.cpu" emptyText="-" label="Cpu"/>
            <TextField source="stats.memory" emptyText="-" label="Memory"/>
            <TextField source="stats.gpu" emptyText="-" label="Gpu Memory"/>
            <TextField source="stats.fps" emptyText="-" label="Fps"/>
            <TextField source="stats.speed" emptyText="-" label="Speed"/>
            <TextField source="stats.drop" emptyText="-" label="Drop"/>
            <TextField source="stats.bitrate" emptyText="-" label="Bitrate"/>
            <TextField source="stats.time" emptyText="-" label="Time"/>
            <StatusField source="status" label="Status" />
            {permissions.permissions.authorities.includes(Common.Authorities.CONTROL_JOBS) && <ActionButtonsField label="Actions" />}
            <ReferenceField source="user_id" reference="users">
                <TextField source="username" />
            </ReferenceField>
            {permissions.permissions.authorities.includes(Common.Authorities.VIEW_JOB_DETAIL) && <ShowButton />}
            {permissions.permissions.authorities.includes(Common.Authorities.CREATE_JOBS) && <HoEditButton />}
        </Datagrid>)
};

export const JobList = ({ ...props }) => {
    return (
        <List filters={<JobFilter />} {...props}>
            <JobDatagrid />
        </List>
    )
};


