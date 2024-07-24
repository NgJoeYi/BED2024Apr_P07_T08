const discussionController = require('../controllers/discussionController');
const discussionModel = require('../models/Discussion');

jest.mock('../models/Discussion'); // Mock the discussion model

describe('discussionController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getDiscussions', () => {
        it('should fetch discussions and return a JSON response', async () => {
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

            discussionModel.getDiscussions.mockResolvedValue(mockDiscussions);

            const req = { query: { category: 'all', sort: 'most-recent', search: '' } };
            const res = {
                json: jest.fn()
            };

            await discussionController.getDiscussions(req, res);

            expect(discussionModel.getDiscussions).toHaveBeenCalledTimes(1);
            expect(discussionModel.getDiscussions).toHaveBeenCalledWith('all', 'most-recent', '');
            expect(res.json).toHaveBeenCalledWith({ success: true, discussions: mockDiscussions });
        });

        it('should handle errors and return a 500 status with error message', async () => {
            const errorMessage = 'Database error';
            discussionModel.getDiscussions.mockRejectedValue(new Error(errorMessage));

            const req = { query: { category: 'all', sort: 'most-recent', search: '' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await discussionController.getDiscussions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: errorMessage });

            consoleErrorMock.mockRestore();
        });
    });

    describe('updateDiscussion', () => {
        it('should update a discussion and return success true', async () => {
            discussionModel.updateDiscussion.mockResolvedValue(true);

            const req = {
                params: { id: 1 },
                body: { description: 'Updated description', category: 'updated category' },
                user: { id: 1 }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis()
            };

            await discussionController.updateDiscussion(req, res);

            expect(discussionModel.updateDiscussion).toHaveBeenCalledTimes(1);
            expect(discussionModel.updateDiscussion).toHaveBeenCalledWith(1, 'Updated description', 'updated category', 1);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it('should return 404 if discussion not found or user unauthorized', async () => {
            discussionModel.updateDiscussion.mockResolvedValue(false);

            const req = {
                params: { id: 1 },
                body: { description: 'Updated description', category: 'updated category' },
                user: { id: 1 }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis()
            };

            await discussionController.updateDiscussion(req, res);

            expect(discussionModel.updateDiscussion).toHaveBeenCalledTimes(1);
            expect(discussionModel.updateDiscussion).toHaveBeenCalledWith(1, 'Updated description', 'updated category', 1);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Discussion not found or user unauthorized' });
        });

        it('should handle errors and return a 500 status with error message', async () => {
            const errorMessage = 'Database error';
            discussionModel.updateDiscussion.mockRejectedValue(new Error(errorMessage));

            const req = {
                params: { id: 1 },
                body: { description: 'Updated description', category: 'updated category' },
                user: { id: 1 }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await discussionController.updateDiscussion(req, res);

            expect(discussionModel.updateDiscussion).toHaveBeenCalledTimes(1);
            expect(discussionModel.updateDiscussion).toHaveBeenCalledWith(1, 'Updated description', 'updated category', 1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: errorMessage });

            consoleErrorMock.mockRestore();
        });
    });
});
