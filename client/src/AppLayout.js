import { Layout } from 'react-admin';
import { SideBarMenu } from './SideBarMenu';

export const AppLayout = (props) => <Layout {...props} menu={SideBarMenu} />;