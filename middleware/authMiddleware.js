const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
        console.log('No token provided'); 
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, "your_secret_key", (err, decoded) => {
        if (err) {
            console.log('Token verification failed:', err);
            return res.status(403).json({ message: 'Forbidden' });
        }
        console.log('Token:', token);
        console.log('Token verified, decoded user:', decoded); 

        // ************************************** ADD ROUTES HERE **************************************
        const authorizedRoles = {
            '/account': ['student', 'lecturer'],
            '/account/profile': ['student', 'lecturer'],
            '/account/uploadProfilePic': ['student', 'lecturer'],
            '/discussions/user': ['student', 'lecturer'],
            '/discussions': ['student', 'lecturer']
        };
        // ************************************** ADD ROUTES HERE **************************************

        const requestEndpoint = req.url;
        //const requestEndpoint = req.path;
        const userRole = decoded.role;

        console.log('Request Endpoint:', requestEndpoint); // Debugging log
        console.log('User Role:', userRole); // CHANGED

        const authorizedRole = Object.entries(authorizedRoles).find(
            ([endpoint, roles]) => {
                const regex = new RegExp(`^${endpoint}$`);
                return regex.test(requestEndpoint) && roles.includes(userRole);
            }
        );

        if (!authorizedRole) {
            console.log('Role not authorized for this endpoint'); 
            return res.status(403).json({ message: 'Forbidden' }); // to do: make it visible on client
        }

        req.user = decoded;
        next();
    });
}

module.exports = { verifyJWT };
