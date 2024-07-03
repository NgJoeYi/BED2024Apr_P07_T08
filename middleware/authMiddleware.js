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
            'GET /account': ['student', 'lecturer'],
            'GET /account/profile': ['student', 'lecturer'],
            'POST /account/uploadProfilePic': ['student', 'lecturer'],
            'GET /discussions/user': ['student', 'lecturer'],
            'GET /discussions': ['student', 'lecturer'],
            'GET /discussions/:id': ['student', 'lecturer'],
            'POST /discussions': ['student', 'lecturer'],
            'PUT /discussions/:id': ['student', 'lecturer'],
            'DELETE /discussions/:id': ['student', 'lecturer'],
        };
        // ************************************** ADD ROUTES HERE **************************************

        const userRole = decoded.role;
        const requestEndpoint = req.url.split('?')[0]; // Remove query parameters if present
        const method = req.method;
        const routeKey = `${method} ${requestEndpoint}`;

        console.log('Request Endpoint:', requestEndpoint); // debugging log
        console.log('User Role:', userRole); // debugging log
        
        // Iterate over authorized roles and handle dynamic segments
        const authorizedRole = Object.entries(authorizedRoles).find(
            ([endpoint, roles]) => {
                const [method, path] = endpoint.split(' ');
                const pathPattern = path.replace(/:\w+/g, '\\w+'); // Replace: param with regex pattern
                const regex = new RegExp(`^${pathPattern}$`);
                return method === req.method && regex.test(requestEndpoint) && roles.includes(userRole);
            }
        );

        if (!authorizedRole) {
            console.log('Role not authorized for this endpoint'); 
            return res.status(403).json({ message: 'Forbidden' });
        }

        req.user = decoded;
        next();
    });
}

module.exports = { verifyJWT };
