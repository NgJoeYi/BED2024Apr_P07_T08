const commentController = require('../../controllers/commentController');
const commentModel = require('../../models/Comment');

jest.mock('../../models/Comment'); // Mock the comment model

const mockComments = [
    {
        id: 1, content: 'This is a great discussion. Thanks for sharing!', created_at: '2024-07-25 02:32:29.593', discussion_id: 1, user_id: 1, username: 'John Doe',
        profilePic: 'images/profilePic.jpeg', role: 'student', likes: 0, dislikes: 0
    },
    {
        id: 2, content: 'I totally agree with your point.', created_at: '2024-07-25 02:32:29.593', discussion_id: 1, user_id: 2, username: 'Jane Smith',
        profilePic: 'images/profilePic.jpeg', role: 'lecturer', likes: 0, dislikes: 0
    },
    {
        id: 3, content: 'Can you provide more details on this topic?', created_at: '2024-07-25 02:32:29.593', discussion_id: 2, user_id: 3, username: 'Alice Jones',
        profilePic: 'images/profilePic.jpeg', role: 'student', likes: 0, dislikes: 0
    },
    {
        id: 4, content: 'Interesting perspective. I never thought about it that way.', created_at: '2024-07-25 02:32:29.593', discussion_id: 2, user_id: 4, username: 'Bob Brown',
        profilePic: 'images/profilePic.jpeg', role: 'lecturer', likes: 0, dislikes: 0
    },
    {
        id: 5, content: 'Could you share some sources for your claims?', created_at: '2024-07-25 02:32:29.593', discussion_id: 2, user_id: 2, username: 'Jane Smith',
        profilePic: 'images/profilePic.jpeg', role: 'lecturer', likes: 0, dislikes: 0
    }
];

describe('commentController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getComments', () => {
        it('should fetch comments by discussion ID and return a JSON response', async () => {
            const discussionId = 1;
            commentModel.getCommentsByDiscussionId.mockResolvedValue(mockComments.filter(comment => comment.discussion_id === discussionId));

            const req = { query: { discussionId } };
            const res = {
                json: jest.fn()
            };

            await commentController.getComments(req, res);

            expect(commentModel.getCommentsByDiscussionId).toHaveBeenCalledTimes(1);
            expect(commentModel.getCommentsByDiscussionId).toHaveBeenCalledWith(discussionId);
            expect(res.json).toHaveBeenCalledWith(mockComments.filter(comment => comment.discussion_id === discussionId));
        });

        it('should fetch all comments and return a JSON response', async () => {
            commentModel.getAllComments.mockResolvedValue(mockComments);

            const req = { query: {} };
            const res = {
                json: jest.fn()
            };

            await commentController.getComments(req, res);

            expect(commentModel.getAllComments).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockComments);
        });

        it('should handle errors and return a 500 status with error message', async () => {
            const errorMessage = 'Database error';
            commentModel.getAllComments.mockRejectedValue(new Error(errorMessage));

            const req = { query: {} };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await commentController.getComments(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Error fetching comments");

            consoleErrorMock.mockRestore();
        });
    });

    describe('updateComment', () => {
        it('should update a comment and return the updated comment', async () => {
            const updatedComment = { ...mockComments[0], content: 'Updated content' };
            commentModel.updateComment.mockResolvedValue(updatedComment);
            commentModel.getCommentById.mockResolvedValue(mockComments[0]);

            const req = {
                params: { id: 1 },
                body: { content: 'Updated content' },
                user: { id: 1 }
            };
            const res = {
                json: jest.fn()
            };

            await commentController.updateComment(req, res);

            expect(commentModel.updateComment).toHaveBeenCalledTimes(1);
            expect(commentModel.updateComment).toHaveBeenCalledWith(1, 'Updated content');
            expect(res.json).toHaveBeenCalledWith(updatedComment);
        });

        it('should return 404 if comment not found', async () => {
            commentModel.getCommentById.mockResolvedValue(null);

            const req = {
                params: { id: 1 },
                body: { content: 'Updated content' },
                user: { id: 1 }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await commentController.updateComment(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Comment not found' });
        });

        it('should handle errors and return a 500 status with error message', async () => {
            const errorMessage = 'Database error';
            commentModel.getCommentById.mockRejectedValue(new Error(errorMessage));

            const req = {
                params: { id: 1 },
                body: { content: 'Updated content' },
                user: { id: 1 }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await commentController.updateComment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Error updating comment");

            consoleErrorMock.mockRestore();
        });
    });
});
