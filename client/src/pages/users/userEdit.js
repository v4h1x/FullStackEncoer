import * as React from "react";
import {
    Edit,
    TextInput,
    SelectInput,
    TabbedForm,
    FormTab,
} from 'react-admin';
import { useGetIdentity, useRecordContext, useInput } from 'react-admin';
import Common from "api/server/common/common";
import UserTitle from "./userTitle";


const RoleSelectInput = (props) => {
    const { isLoading, identity } = useGetIdentity();
    const record = useRecordContext();

    const isRoleDisabled = () => {
        if (isLoading)
            return true;
        return record.id === identity.id;
    }

    return (
        <SelectInput {...props} disabled={isRoleDisabled()}
            choices={[
                { id: Common.Roles.ADMIN, name: 'Admin' },
                { id: Common.Roles.OPERATOR_L1, name: 'Operator L1' },
                { id: Common.Roles.OPERATOR_L2, name: 'Operator L2' },
                { id: Common.Roles.MONITORING, name: 'Monitoring' },
            ]} />
    );
};

const validateUserEdit = (values) => {
    const errors = {};
    if (values.role !== Common.Roles.ADMIN && values.role !== Common.Roles.MONITORING
        && values.role !== Common.Roles.OPERATOR_L1 && values.role !== Common.Roles.OPERATOR_L2 )
        errors.role = 'Role must not be empty.'
    if (values.oldPassword) {
        if (!values.password)
            errors.password = 'Password must not be empty.'
        if (values.confirmPassword !== values.password)
            errors.confirmPassword = 'passwords do not match.'
    }
    else if (values.password || values.confirmPassword)
        errors.oldPassword = 'Old password must not be empty.'
    return errors
};

export const UserEdit = (props) => {

    return (
        <Edit title={<UserTitle />}{...props}>
            <TabbedForm validate={validateUserEdit}>
                <FormTab label="Information">
                    <TextInput source="username" disabled />
                    <TextInput source="email" disabled />
                    <RoleSelectInput source="role" label="Role" />
                </FormTab>
                <FormTab label="pasword">
                    <TextInput source="oldPassword" type="password" />
                    <TextInput source="password" type="password" />
                    <TextInput source="confirmPassword" type="password" />
                </FormTab>
            </TabbedForm>
        </Edit>
    )
};
