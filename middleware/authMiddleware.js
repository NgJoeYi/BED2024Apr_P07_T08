const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
        console.log('No token provided'); // Debugging log
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, "your_secret_key", (err, decoded) => {
        if (err) {
            console.log('Token verification failed:', err); // Debugging log
            return res.status(403).json({ message: 'Forbidden' });
        }

        console.log('Token verified, decoded user:', decoded); // Debugging log

        const authorizedRoles = {
            '/account': ['student', 'lecturer'],
        };

        const requestEndpoint = req.url;
        const userRole = decoded.role;

        const authorizedRole = Object.entries(authorizedRoles).find(
            ([endpoint, roles]) => {
                const regex = new RegExp(`^${endpoint}$`);
                return regex.test(requestEndpoint) && roles.includes(userRole);
            }
        );

        if (!authorizedRole) {
            console.log('Role not authorized for this endpoint'); // Debugging log
            return res.status(403).json({ message: 'Forbidden' });
        }

        req.user = decoded;
        next();
    });
}

module.exports = { verifyJWT };
