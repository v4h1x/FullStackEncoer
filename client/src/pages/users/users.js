import * as React from "react";
import {
    Edit,
    Form,
    Create,
    TextInput,
    SelectInput,
    List,
    Datagrid,
    TextField,
    EmailField,
    DateField,
    email,
    required,
    choices,
    DeleteButton,
    SaveButton,
    Toolbar,
    EditButton,
    TabbedForm,
    FormTab
} from 'react-admin';
import { useGetIdentity, usePermissions } from 'react-admin';
import { Box } from '@mui/material';
import BulkActionButtons from '../BulkActionButtons';
import Common from "api/server/common/common";


export const UserList = ({ ...props }) => {
    const { permissions } = usePermissions();
    const { isLoading, identity } = useGetIdentity();
    const isRowSelectable = (record) => {
        if (isLoading)
            return false;
        return record.id !== identity.id;
    }

    return (
        < List {...props}>
            <Datagrid isRowSelectable={isRowSelectable} bulkActionButtons={<BulkActionButtons />}>
                <TextField source="username" />
                <EmailField source="email" />
                <DateField source="date_added" />
                <TextField source="role" />
                {permissions && permissions.authorities.includes(Common.Authorities.CREATE_USERS) && <EditButton />}
            </Datagrid>
        </List >);
};

const validateEmail = [required('Email must not be empty.'), email()];
const validateUserName = required('User name must not be empty.');
const validateRole = choices([Common.Roles.ADMIN, Common.Roles.MONITORING, Common.Roles.OPERATOR_L1, Common.Roles.OPERATOR_L2], 'Role must not be empty.')
const validatePassword = required('Password must not be empty.');
const validateConfirmPassword = (value, values) => {
    if (value !== values.password)
        return 'passwords do not match.'
    return undefined;
}

const UserCreateForm = (props) => (
    <Form {...props}>
        <Box p="1em">
            <Box display="flex">
                <Box flex={3} >
                    <TextInput source="username" resource="users" validate={validateUserName} />
                    <Box />
                    <TextInput source="email" resource="users" type="email" validate={validateEmail} />
                    <Box />
                    <SelectInput source="role" resource="users" validate={validateRole} choices={[
                        { id: Common.Roles.ADMIN, name: 'Admin' },
                        { id: Common.Roles.OPERATOR_L1, name: 'Operator L1' },
                        { id: Common.Roles.OPERATOR_L2, name: 'Operator L2' },
                        { id: Common.Roles.MONITORING, name: 'Monitoring' },
                    ]} />
                    <Box />
                    <TextInput source="password" resource="users" type="password" validate={validatePassword} />
                    <Box />
                    <TextInput source="confirm_password" resource="users" type="password" validate={validateConfirmPassword} />
                </Box>
            </Box>
        </Box>
        <Toolbar>
            <Box display="flex" justifyContent="space-between" width="100%">
                <SaveButton
                    saving={props.saving}
                    handleSubmitWithRedirect={props.handleSubmitWithRedirect}
                />
                <DeleteButton record={props.record} />
            </Box>
        </Toolbar>
    </Form>
);
export const UserCreate = (props) => (
    <Create {...props}>
        <UserCreateForm />
    </Create>
);
