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
            
            'GET /discussions/user': ['student', 'lecturer'], // only student and lecturer logged in can see their own discussions
            'GET /discussions': ['student', 'lecturer'], // only student and lecturer logged in can see all discussions
            'GET /discussions/:id': ['student', 'lecturer'], // only student and lecturer logged in can see a specific discussion
            'POST /discussions': ['student', 'lecturer'], // only student and lecturer logged in can create a new discussion
            'POST /discussions/:discussionId/like': ['student', 'lecturer'], // only student and lecturer logged in can like a discussion
            'POST /discussions/:discussionId/dislike': ['student', 'lecturer'], // only student and lecturer logged in can dislike a discussion
            'POST /discussions/:discussionId/view': ['student', 'lecturer'], // only student and lecturer logged in can increment view count of a discussion
            'PUT /discussions/:id': ['student', 'lecturer'], // only student and lecturer logged in can update a specific discussion
            'DELETE /discussions/:id': ['student', 'lecturer'], // only student and lecturer logged in can delete a specific discussion
            'POST /discussions/:id/pin': ['student', 'lecturer'], // only student and lecturer logged in can pin a discussion
            'POST /discussions/:id/unpin': ['student', 'lecturer'], // only student and lecturer logged in can unpin a discussion
            'POST /follow': ['student', 'lecturer'], // only student and lecturer logged in can follow another user
            'POST /unfollow': ['student', 'lecturer'], // only student and lecturer logged in can unfollow another user
            'GET /followed-discussions': ['student', 'lecturer'], // only student and lecturer logged in can see discussions of followed users
            'GET /follow-status': ['student', 'lecturer'], // only student and lecturer logged in can see follow status
            'GET /discussions/:id/suggestions': ['student', 'lecturer'], // only student and lecturer logged in can see suggestions for a specific discussion
            'GET /following-count': ['student', 'lecturer'], // only student and lecturer logged in can see the count of users they are following
            'GET /follower-count': ['student', 'lecturer'], // only student and lecturer logged in can see the count of their followers
                      
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

            'PUT /courses/:id': [ 'lecturer'], // Only lecturers can update courses
            'POST /courses': [ 'lecturer'], // Only lecturers can post courses
            'DELETE /courses/:id': [ 'lecturer'], // Both students and lecturers can delete courses, because of delete courses with no lectures

            'GET /lectures/last-chapter': ['lecturer'], // Only lecturers can get last chapter of lectures because they are the one creating it
            'GET /lectures/checking': ['lecturer'],// Only lecturers can get the current userID  
            'POST /lectures': ['lecturer'], // Only lecturers can create lecture
            'PUT /lectures/:id': ['lecturer'], // Only lecturers can update lecture
            'DELETE /lectures/:id': ['lecturer'], // Only lecturers can delete lectures
            'DELETE /lectures/course/:courseID/chapter/:chapterName': ['lecturer'], // Only lecturers can delete the whole chapter of the lecture

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