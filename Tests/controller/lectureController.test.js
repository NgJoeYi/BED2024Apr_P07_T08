const sql = require('mssql');
const Lecture = require('../../models/Lectures');
const dbConfig = require('../../dbConfig');

jest.mock('mssql');

describe('Lecture Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createLecture', () => {
        it('should create a new lecture and return the lecture data', async () => {
            const mockLecture = {
                courseID: 101,
                userID: 1,
                title: 'Sample Lecture',
                duration: 60,
                description: 'A sample lecture',
                position: 1,
                chapterName: 'Chapter 1',
                video: 'video.mp4'
            };

            const mockRequest = {
                body: mockLecture,
                file: { originalname: 'video.mp4' }
            };

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const mockPool = {
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ recordset: [mockLecture] }),
                close: jest.fn().mockResolvedValue(undefined)
            };

            sql.connect.mockResolvedValue(mockPool);

            await Lecture.createLecture(mockRequest, mockResponse);

            expect(sql.connect).toHaveBeenCalledWith(dbConfig);
            expect(mockPool.request).toHaveBeenCalledTimes(1);
            expect(mockPool.input).toHaveBeenCalledWith('courseID', sql.Int, mockLecture.courseID);
            expect(mockPool.input).toHaveBeenCalledWith('userID', sql.Int, mockLecture.userID);
            expect(mockPool.input).toHaveBeenCalledWith('title', sql.NVarChar, mockLecture.title);
            expect(mockPool.input).toHaveBeenCalledWith('duration', sql.Int, mockLecture.duration);
            expect(mockPool.input).toHaveBeenCalledWith('description', sql.NVarChar, mockLecture.description);
            expect(mockPool.input).toHaveBeenCalledWith('position', sql.Int, mockLecture.position);
            expect(mockPool.input).toHaveBeenCalledWith('chapterName', sql.NVarChar, mockLecture.chapterName);
            expect(mockPool.input).toHaveBeenCalledWith('video', sql.NVarChar, mockLecture.video);
            expect(mockPool.query).toHaveBeenCalledWith(expect.any(String));
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining(mockLecture));
        });

        it('should handle errors when creating a lecture', async () => {
            const errorMessage = 'Database Error';
            const mockRequest = {
                body: {
                    courseID: 101,
                    userID: 1,
                    title: 'Sample Lecture',
                    duration: 60,
                    description: 'A sample lecture',
                    position: 1,
                    chapterName: 'Chapter 1',
                    video: 'video.mp4'
                },
                file: { originalname: 'video.mp4' }
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const mockPool = {
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(new Error(errorMessage)),
                close: jest.fn().mockResolvedValue(undefined)
            };

            sql.connect.mockResolvedValue(mockPool);

            await Lecture.createLecture(mockRequest, mockResponse);

            expect(sql.connect).toHaveBeenCalledWith(dbConfig);
            expect(mockPool.request).toHaveBeenCalledTimes(1);
            expect(mockPool.query).toHaveBeenCalledWith(expect.any(String));
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(`Error creating lecture: ${errorMessage}`);
        });
    });
});
