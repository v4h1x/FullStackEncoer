import * as React from 'react';
import { BulkDeleteButton, LoadingIndicator, usePermissions } from 'react-admin';
import Common from 'api/server/common/common';


const BulkActionButtons = ({ ...props }) => {
    const { isLoading, permissions } = usePermissions();
    return (
        <>
            {/* default bulk delete action */}
            {!isLoading && permissions.role === Common.Roles.ADMIN && <BulkDeleteButton {...props} />}
        </>
    )
};

export default BulkActionButtons;