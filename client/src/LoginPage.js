import { Login } from 'react-admin';
import IribBg from './assets/irib.jpg'

const LoginPage = () => (
    <Login
        backgroundImage={IribBg} sx={{backgroundSize:'cover'}}
    />
);

export default LoginPage;