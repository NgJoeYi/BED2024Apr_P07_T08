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
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(403).json({ message: 'Forbidden' });
        }
        console.log('Token:', token);
        console.log('Token verified, decoded user:', decoded); 

        // ************************************** ADD ROUTES HERE **************************************
        const authorizedRoles = {
            'GET /account': ['student', 'lecturer'], // only student and lecturer logged in can see account details
            'GET /account/profile': ['student', 'lecturer'], // only student and lecturer logged in can see profile picture
            'POST /account/uploadProfilePic': ['student', 'lecturer'], // only student and lecturer logged in can update profile picture
            'PUT /account': ['student', 'lecturer'], // only student and lecturer logged in can update account details
            'DELETE /account': ['student', 'lecturer'], // only student and lecturer logged in can delete account details
            'GET /account/quizResult': ['student', 'lecturer'], // only student and lecturer logged in can see quiz history
            'GET /account/getAttemptCountByQuizId': ['student', 'lecturer'], // only student and lecturer logged in can see quiz attempt count by quiz id
            'GET /account/getAllAttemptCount': ['student', 'lecturer'], // only student and lecturer logged in total number of quiz taken
            
            'GET /discussions/user': ['student', 'lecturer'],
            'GET /discussions': ['student', 'lecturer'],
            'GET /discussions/:id': ['student', 'lecturer'],
            'POST /discussions': ['student', 'lecturer'],
            'POST /discussions/:discussionId/like': ['student', 'lecturer'],
            'POST /discussions/:discussionId/dislike': ['student', 'lecturer'],
            'POST /discussions/:discussionId/view': ['student', 'lecturer'],  // Add this line for views
            'PUT /discussions/:id': ['student', 'lecturer'],
            'DELETE /discussions/:id': ['student', 'lecturer'],
            'POST /discussions/:id/pin': ['student', 'lecturer'],  // Add this line for pin
            'POST /discussions/:id/unpin': ['student', 'lecturer'],  // Add this line for unpin
            'POST /follow':  ['student', 'lecturer'],
            'POST /unfollow':  ['student', 'lecturer'],
            'GET /followed-discussions':  ['student', 'lecturer'],
            'GET /follow-status':  ['student', 'lecturer'],
            'GET /discussions/:id/suggestions':  ['student', 'lecturer'],
            'GET /following-count':  ['student', 'lecturer'],
            
            'GET /comments': ['student', 'lecturer'],
            'PUT /comments/:id': ['student', 'lecturer'],
            'POST /comments': ['student', 'lecturer'],
            'DELETE /comments/:id': ['student', 'lecturer'],

            'GET /quizzes/trivia': ['student', 'lecturer'], // Both student and lecturer logged in can see trivia questions
            'GET /quizzes/:id/questions': ['student', 'lecturer'],  // Only student and lecturer logged in can see quiz id's questions
            'GET /quizResult/:attemptId': ['student', 'lecturer'], // Both students and lecturers can view quiz results
            'POST /quizzes': ['lecturer'], // Only lecturers can create quizzes
            'POST /submitQuiz': ['student', 'lecturer'],  // Both student and lecturer logged in can see attempt the quiz
            'POST /quizzes/:id/questions': ['lecturer'], // Only lecturers can add questions to a quiz
            'POST /quizzes/:id/questions/update': ['lecturer'], // Only lecturers can add questions to a quiz
            'PUT /quizzes/:quizId/questions/:questionId': ['lecturer'],  // Only student and lecturer logged in can update quiz id's questions
            'PUT /quizzes/:id': ['lecturer'], // Only lecturers can update quizzes
            'DELETE /quizzes/:quizId/questions/:questionId': ['lecturer'],  // Only lecturer logged in can delete quiz id's questions
            'DELETE /quizzes/:id': ['lecturer'], // Only lecturers can delete quizzes

            'PUT /courses/:id': ['student', 'lecturer'],
            'POST /courses': ['student', 'lecturer'],
            'DELETE /courses/:id': ['student', 'lecturer'],

            'GET /lectures/last-chapter': ['lecturer'],
            'GET /lectures/checking': ['lecturer'],
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
// -- users that are not logged in can view quizzes