const sql = require('mssql');
const Comment = require('../../models/Comment');
const dbConfig = require('../../dbConfig');

jest.mock('mssql');

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

describe('Comment Model', () => {
    let mockRequest;
    let mockPool;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRequest = {
            query: jest.fn(),
            input: jest.fn().mockReturnThis()
        };

        mockPool = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockPool);
    });

    describe('getAllComments', () => {
        it('should retrieve all comments from the database', async () => {
            mockRequest.query.mockResolvedValue({ recordset: mockComments });

            const comments = await Comment.getAllComments();

            console.log('sql.connect calls:', sql.connect.mock.calls);
            console.log('mockPool.request calls:', mockPool.request.mock.calls);
            console.log('mockRequest.query calls:', mockRequest.query.mock.calls);

            expect(sql.connect).toHaveBeenCalledWith(dbConfig);
            expect(mockPool.request).toHaveBeenCalledTimes(1);
            expect(mockRequest.query).toHaveBeenCalledWith(expect.any(String));
            expect(comments).toHaveLength(5);
            expect(comments[0].id).toBe(1);
        });

        it('should handle errors when retrieving comments', async () => {
            const errorMessage = 'Database Error';
            sql.connect.mockRejectedValue(new Error(errorMessage));

            await expect(Comment.getAllComments()).rejects.toThrow(`Error fetching comments: ${errorMessage}`);
        });
    });

    describe('updateComment', () => {
        it('should update a comment and return the updated comment', async () => {
            const updatedComment = { ...mockComments[0], content: 'Updated content' };

            mockRequest.query.mockResolvedValue({ rowsAffected: [1] });
            Comment.getCommentById = jest.fn().mockResolvedValue(updatedComment);

            const result = await Comment.updateComment(1, 'Updated content');

            console.log('sql.connect calls:', sql.connect.mock.calls);
            console.log('mockPool.request calls:', mockPool.request.mock.calls);
            console.log('mockRequest.query calls:', mockRequest.query.mock.calls);

            expect(sql.connect).toHaveBeenCalledWith(dbConfig);
            expect(mockPool.request).toHaveBeenCalledTimes(1);
            expect(mockRequest.input).toHaveBeenCalledWith('id', sql.Int, 1);
            expect(mockRequest.input).toHaveBeenCalledWith('content', sql.NVarChar, 'Updated content');
            expect(mockRequest.query).toHaveBeenCalledWith(expect.any(String));
            expect(result).toEqual(updatedComment);
        });

        it('should return error if comment not found', async () => {
            mockRequest.query.mockResolvedValue({ rowsAffected: [0] });

            await expect(Comment.updateComment(1, 'Updated content')).rejects.toThrow('Update failed, comment not found.');
        });

        it('should handle errors when updating a comment', async () => {
            const errorMessage = 'Database Error';
            mockRequest.query.mockRejectedValue(new Error(errorMessage));

            await expect(Comment.updateComment(1, 'Updated content')).rejects.toThrow(`Error updating comment: ${errorMessage}`);
        });
    });
});
