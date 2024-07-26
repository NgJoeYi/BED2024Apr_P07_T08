const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');
const lectureController = require('../../controllers/lectureController');
const Lectures = require('../../models/Lectures');

// Mock lecture model
jest.mock('../../models/Lectures');

const app = express();
app.use(express.json());

// Middleware to set user
app.use((req, res, next) => {
    req.user = { id: 1 }; // Mock user
    next();
});

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Mock multer middleware for video provided test
const mockUploadWithVideo = (req, res, next) => {
    req.file = {
        filename: 'mockVideo.mp4',
        path: path.join(__dirname, 'mockVideo.mp4'),
        originalname: 'mockVideo.mp4',
    };
    req.body.courseID = '1'; // Mock courseID
    next();
};

// Mock multer middleware for video not provided test
const mockUploadWithoutVideo = (req, res, next) => {
    req.file = null; // Simulate no video file provided
    req.body.courseID = '1'; // Mock courseID
    next();
};

app.post('/lectures', upload.single('video'), (req, res, next) => {
    // Middleware to handle file uploads
    if (req.file) {
        mockUploadWithVideo(req, res, next);
    } else {
        mockUploadWithoutVideo(req, res, next);
    }
}, lectureController.createLecture);

app.get('/lectures', lectureController.getAllLectures);

describe('Lecture Controller', () => {
    describe('Create Lecture', () => {
        beforeEach(() => {
            jest.clearAllMocks(); // Clear mock calls before each test
        });
    
        it('should return 400 if video is not provided', async () => {
            const res = await request(app)
                .post('/lectures')
                .field('title', 'Sample Lecture')
                .field('duration', '60')
                .field('description', 'Sample Description')
                .field('chapterName', 'Sample Chapter')
                .field('courseID', '1')
                .set('user', { id: 1 });
    
            expect(res.status).toBe(400);
            expect(res.text).toBe('Video not provided');
        });
    
        it('should create a lecture and return 201 if all data is provided', async () => {
            const videoPath = path.join(__dirname, 'mockVideo.mp4');
            fs.writeFileSync(videoPath, 'mock video content');
            const mockLectureData = {
                LectureID: 1,
                courseID: 1,
                userID: 1,
                title: 'Sample Lecture',
                duration: 60,
                description: 'Sample Description',
                position: 1,
                chapterName: 'Sample Chapter',
                video: 'mockVideo.mp4'
            };
    
            Lectures.getCurrentPositionInChapter.mockResolvedValue(1);
            Lectures.createLecture.mockResolvedValue(mockLectureData);
    
            const res = await request(app)
                .post('/lectures')
                .field('title', 'Sample Lecture')
                .field('duration', '60')
                .field('description', 'Sample Description')
                .field('chapterName', 'Sample Chapter')
                .field('courseID', '1')
                .attach('video', videoPath)
                .set('user', { id: 1 });
    
            expect(res.status).toBe(201);
            expect(res.body).toEqual(mockLectureData);
    
            // Clean up the mock file
            fs.unlinkSync(videoPath);
        }, 10000); // Increase timeout if needed
    });
    

    describe('Get All Lectures', () => {
        beforeEach(() => {
            jest.clearAllMocks(); // Clear mock calls before each test
        });

        it('should return a list of lectures', async () => {
            const mockLectures = [
                { id: 1, title: 'Lecture 1', duration: 60, description: 'First Lecture' },
                { id: 2, title: 'Lecture 2', duration: 45, description: 'Second Lecture' }
            ];

            // Mock Lectures.getAllLectures to return mock data
            Lectures.getAllLectures.mockResolvedValue(mockLectures);

            const res = await request(app)
                .get('/lectures')
                .set('user', { id: 1 }); // Mock user ID

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockLectures);
        });
    });
});

