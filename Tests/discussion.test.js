const sql = require('mssql');
const Discussion = require('../models/Discussion');
const dbConfig = require('../dbConfig');

jest.mock('mssql');

describe('Discussion Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getDiscussions', () => {
        it('should retrieve all discussions from the database', async () => {
            const mockDiscussions = [
                {
                    id: 1,
                    title: 'Coding for python',
                    description: 'Python design philosophy emphasizes code readability...',
                    category: 'coding',
                    posted_date: new Date(),
                    likes: 10,
                    dislikes: 1,
                    views: 100,
                    username: 'john_doe',
                    profilePic: 'images/profilePic.jpeg',
                    role: 'user',
                    pinned: false
                },
                {
                    id: 2,
                    title: 'Advanced Algebra',
                    description: 'Advanced algebra is a branch of mathematics...',
                    category: 'math',
                    posted_date: new Date(),
                    likes: 5,
                    dislikes: 0,
                    views: 50,
                    username: 'jane_smith',
                    profilePic: 'images/profilePic.jpeg',
                    role: 'user',
                    pinned: true
                }
            ];

            const mockRequest = {
                query: jest.fn().mockResolvedValue({ recordset: mockDiscussions }),
                input: jest.fn().mockReturnThis()
            };
            const mockPool = {
                request: jest.fn().mockReturnValue(mockRequest),
                close: jest.fn().mockResolvedValue(undefined)
            };

            sql.connect.mockResolvedValue(mockPool);

            const discussions = await Discussion.getDiscussions('all', 'most-recent', '');

            expect(sql.connect).toHaveBeenCalledWith(dbConfig);
            expect(mockPool.request).toHaveBeenCalledTimes(1);
            expect(mockRequest.query).toHaveBeenCalledWith(expect.any(String));
            expect(discussions).toHaveLength(2);
            expect(discussions[0]).toBeInstanceOf(Discussion);
            expect(discussions[0].id).toBe(1);
            expect(discussions[0].title).toBe('Coding for python');
            expect(discussions[0].description).toBe('Python design philosophy emphasizes code readability...');
            expect(discussions[0].category).toBe('coding');
            expect(discussions[0].likes).toBe(10);
            expect(discussions[0].dislikes).toBe(1);
            expect(discussions[0].views).toBe(100);
            expect(discussions[0].username).toBe('john_doe');
            expect(discussions[0].profilePic).toBe('images/profilePic.jpeg');
            expect(discussions[0].role).toBe('user');
            expect(discussions[0].pinned).toBe(false);
        });

        it('should handle errors when retrieving discussions', async () => {
            const errorMessage = 'Database Error';
            sql.connect.mockRejectedValue(new Error(errorMessage));

            await expect(Discussion.getDiscussions('all', 'most-recent', '')).rejects.toThrow(`Error getting discussions: ${errorMessage}`);
        });
    });

    describe('updateDiscussion', () => {
        it('should update a discussion and return true if successful', async () => {
            const mockRequest = {
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
            };
            const mockPool = {
                request: jest.fn().mockReturnValue(mockRequest),
                close: jest.fn().mockResolvedValue(undefined)
            };

            sql.connect.mockResolvedValue(mockPool);

            const result = await Discussion.updateDiscussion(1, 'Updated description', 'updated category', 1);

            expect(sql.connect).toHaveBeenCalledWith(dbConfig);
            expect(mockPool.request).toHaveBeenCalledTimes(1);
            expect(mockRequest.input).toHaveBeenCalledWith('discussionId', sql.Int, 1);
            expect(mockRequest.input).toHaveBeenCalledWith('description', sql.NVarChar, 'Updated description');
            expect(mockRequest.input).toHaveBeenCalledWith('category', sql.NVarChar, 'updated category');
            expect(mockRequest.input).toHaveBeenCalledWith('userId', sql.Int, 1);
            expect(mockRequest.query).toHaveBeenCalledWith(expect.any(String));
            expect(result).toBe(true);
        });

        it('should return false if no rows are affected', async () => {
            const mockRequest = {
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ rowsAffected: [0] })
            };
            const mockPool = {
                request: jest.fn().mockReturnValue(mockRequest),
                close: jest.fn().mockResolvedValue(undefined)
            };

            sql.connect.mockResolvedValue(mockPool);

            const result = await Discussion.updateDiscussion(1, 'Updated description', 'updated category', 1);

            expect(sql.connect).toHaveBeenCalledWith(dbConfig);
            expect(mockPool.request).toHaveBeenCalledTimes(1);
            expect(mockRequest.input).toHaveBeenCalledWith('discussionId', sql.Int, 1);
            expect(mockRequest.input).toHaveBeenCalledWith('description', sql.NVarChar, 'Updated description');
            expect(mockRequest.input).toHaveBeenCalledWith('category', sql.NVarChar, 'updated category');
            expect(mockRequest.input).toHaveBeenCalledWith('userId', sql.Int, 1);
            expect(mockRequest.query).toHaveBeenCalledWith(expect.any(String));
            expect(result).toBe(false);
        });

        it('should handle errors when updating a discussion', async () => {
            const errorMessage = 'Database Error';
            const mockRequest = {
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(new Error(errorMessage))
            };
            const mockPool = {
                request: jest.fn().mockReturnValue(mockRequest),
                close: jest.fn().mockResolvedValue(undefined)
            };

            sql.connect.mockResolvedValue(mockPool);

            await expect(Discussion.updateDiscussion(1, 'Updated description', 'updated category', 1)).rejects.toThrow(`Error updating discussion: ${errorMessage}`);
        });
    });
});
