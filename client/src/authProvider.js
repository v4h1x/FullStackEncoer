import { socket } from './context/socket';


const LoginApi = {
    // called when the user attempts to log in
    login: ({ username, password }) => {
        const request = new Request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });
        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(user => {
                localStorage.setItem('user', JSON.stringify(user));
            })
            .then(() => socket.connect())
            .catch(() => {
                throw new Error('Network error')
            });
    },
    // called when the user clicks on the logout button
    logout: () => {
        const request = new Request('/api/auth/logout', {
            method: 'GET',
        });
        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
            })
            .then(() => {
                localStorage.removeItem('user');
            })
            .catch(() => {
                throw new Error('Network error')
            });

    },
    // called when the API returns an error
    checkError: ({ status }) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('user');
            return Promise.reject();
        }
        return Promise.resolve();
    },
    getIdentity: () => {
        try {
            const { id, username } = JSON.parse(localStorage.getItem('user'));
            return Promise.resolve({ id: id, fullName: username });
        } catch (error) {
            return Promise.reject(error);
        }
    },
    // called when the user navigates to a new location, to check for authentication
    checkAuth: () => {
        if (localStorage.getItem('user')) {
            if (socket.disconnected)
                socket.connect();
            return Promise.resolve();
        }
        return Promise.reject();
    },
    // called when the user navigates to a new location, to check for permissions / roles
    getPermissions: () => {
        if (localStorage.getItem('user')) {
            const user = JSON.parse(localStorage.getItem('user'));
            return Promise.resolve({ role: user.role, authorities: user.authorities });
        }
        return Promise.resolve({ role: 'ANONYMOUS', authorities: [] });
    }
};

export default LoginApi;