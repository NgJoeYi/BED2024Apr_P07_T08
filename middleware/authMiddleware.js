const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    console.log(token);
    if (!token) {
        console.log('No token provided'); 
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
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
            'PUT /account': ['student', 'lecturer'], // -- will need to come back to this
            'DELETE /account': ['student', 'lecturer'], //hi i added this here - Raeann( delete it when u see HAHHAH)
            'GET /quizResults': ['student', 'lecturer'], 
            
            'GET /discussions/user': ['student', 'lecturer'],
            'GET /discussions': ['student', 'lecturer'],
            'GET /discussions/:id': ['student', 'lecturer'],
            'POST /discussions': ['student', 'lecturer'],
            'POST /discussions/:discussionId/like': ['student', 'lecturer'],
            'POST /discussions/:discussionId/dislike': ['student', 'lecturer'],
            'PUT /discussions/:id': ['student', 'lecturer'],
            'DELETE /discussions/:id': ['student', 'lecturer'],
            
            'GET /comments': ['student', 'lecturer'],
            'PUT /comments/:id': ['student', 'lecturer'],
            'POST /comments': ['student', 'lecturer'],
            'DELETE /comments/:id': ['student', 'lecturer'],

            'GET /quizzes': ['student', 'lecturer'],
            'GET /quizzes/:id': ['student', 'lecturer'],
            'POST /quizzes': ['lecturer'], // Only lecturers can create quizzes
            'PUT /quizzes/:id': ['lecturer'], // Only lecturers can update quizzes
            'DELETE /quizzes/:id': ['lecturer'], // Only lecturers can delete quizzes
            'GET /quizzes/:id/questions': ['student', 'lecturer'],
            'POST /submitQuiz': ['student', 'lecturer'],
            'GET /quizResult/:attemptId': ['student', 'lecturer'], // Both students and lecturers can view quiz results
            'POST /quizzes/:id/questions': ['lecturer'], // Only lecturers can add questions to a quiz
            
            // 'GET /courses': ['student', 'lecturer'],
            // 'GET /courses/:id': ['student', 'lecturer'],
            // 'GET /courses/images/:id': ['student', 'lecturer'],
            'PUT /courses/:id': ['student', 'lecturer'],
            'POST /courses': ['student', 'lecturer'],
            'DELETE /courses/:id': ['student', 'lecturer'],
            'DELETE /courses/noLectures': ['student', 'lecturer'],

            'GET /lectures/last-chapter/:id': ['lecturer'],
            'POST /lectures': ['lecturer'],
            'PUT /lectures/:id': ['lecturer'],
            'DELETE /lectures/:id': ['lecturer'],
            'DELETE /lectures/course/:courseID/chapter/:chapterName': ['lecturer'],

            'PUT /reviews/:id': ['student', 'lecturer'],
            'POST /reviews': ['student', 'lecturer'],
            'DELETE /reviews/:id': ['student', 'lecturer'],
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


// note 
// - users that are not logged in can view comments 
// - users that are not logged in can view courses 
// - users that are not logged in can view discussions
// -- users that are not logged in can attempt the quizzes // maybe...