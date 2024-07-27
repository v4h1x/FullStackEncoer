import * as React from "react";
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from "react-router-dom";
import Common from 'api/server/common/common';
import Dashboard from './dashboard/Dashboard';
import authProvider from './authProvider';
import { UserCreate, UserList } from './pages/users/users';
import { UserEdit } from "./pages/users/userEdit";
import { JobList, JobCreate, JobEdit } from './pages/jobs/jobs';
import { LogList } from "./pages/logs/logs";
import Monitor from './pages/monitor/Monitor'
import JobShow from './pages/jobs/jobShow';
import UserIcon from '@mui/icons-material/Group';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { AppLayout } from './AppLayout';
import { SocketContext, socket } from './context/socket';
import getDataProvider from './dataProviders/dataProvider.js';



const dataProvider = getDataProvider('/api');
const App = () => (
    <SocketContext.Provider value={socket}>
        <Admin layout={AppLayout} dashboard={Dashboard} authProvider={authProvider} dataProvider={dataProvider}>
            {permissions => (
                <>
                    {/* Restrict access users view to admin only */}
                    {permissions.role === Common.Roles.ADMIN && <Resource
                        name="users"
                        list={UserList}
                        icon={UserIcon}
                        create={UserCreate}
                        edit={UserEdit}
                    />
                    }
                    {/* Restrict access to the edit and remove views to admin only */}
                    <Resource
                        name="jobs"
                        list={JobList}
                        show={JobShow}
                        create={permissions.authorities.includes(Common.Authorities.CREATE_JOBS) ? JobCreate : null}
                        edit={permissions.authorities.includes(Common.Authorities.CREATE_JOBS) ? JobEdit : null}
                    />
                    <CustomRoutes>
                        <Route path="/monitor" element={<Monitor />} />
                    </CustomRoutes>
                    {/* Restrict access users view to admin only */}
                    {permissions.role === Common.Roles.ADMIN && <Resource
                        name="logs"
                        list={LogList}
                        icon={EventNoteIcon}
                    />
                    }
                </>
            )}
        </Admin>
    </SocketContext.Provider>
);

export default App;