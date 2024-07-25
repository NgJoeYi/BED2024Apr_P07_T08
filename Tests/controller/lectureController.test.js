const request = require('supertest');
const express = require('express');
const multer = require('multer');
const path = require('path');
const lectureController = require('../controllers/lectureController');
const Lectures = require('../models/Lectures');

// Mock data and functions
jest.mock('../models/Lectures');

const app = express();
app.use(express.json());

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('video'), lectureController.createLecture);
app.get('/lectures', lectureController.getAllLectures);

describe('Lecture Controller', () => {
    describe('Create Lecture', () => {
        it('should return 400 if video is not provided', async () => {
            const res = await request(app)
                .post('/upload')
                .send({
                    title: 'Sample Lecture',
                    duration: '60',
                    description: 'Sample Description',
                    chapterName: 'Sample Chapter',
                    courseID: '1'
                })
                .set('user', { id: 1 });

            expect(res.status).toBe(400);
            expect(res.text).toBe('Video not provided');
        });

        it('should create a lecture and return 201 if all data is provided', async () => {
            const mockLectureData = {
                LectureID: 1,
                courseID: 1,
                userID: 1,
                title: 'Sample Lecture',
                duration: 60,
                description: 'Sample Description',
                position: 1,
                chapterName: 'Sample Chapter',
                video: 'sampleVideo.mp4'
            };

            Lectures.getCurrentPositionInChapter.mockResolvedValue(1);
            Lectures.createLecture.mockResolvedValue(1);

            const res = await request(app)
                .post('/upload')
                .field('title', 'Sample Lecture')
                .field('duration', '60')
                .field('description', 'Sample Description')
                .field('chapterName', 'Sample Chapter')
                .field('courseID', '1')
                .attach('video', path.resolve(__dirname, 'sampleVideo.mp4'))
                .set('user', { id: 1 });

            expect(res.status).toBe(201);
            expect(res.body).toEqual({
                LectureID: 1,
                ...mockLectureData
            });
        });
    });

    describe('Get All Lectures', () => {
        it('should return all lectures', async () => {
            const mockLectures = [
                {
                    lectureID: 1,
                    courseID: 1,
                    userID: 1,
                    title: 'Sample Lecture 1',
                    description: 'Sample Description 1',
                    video: 'sampleVideo1.mp4',
                    duration: 60,
                    position: 1,
                    createdAt: new Date(),
                    chapterName: 'Sample Chapter 1'
                },
                {
                    lectureID: 2,
                    courseID: 1,
                    userID: 1,
                    title: 'Sample Lecture 2',
                    description: 'Sample Description 2',
                    video: 'sampleVideo2.mp4',
                    duration: 60,
                    position: 2,
                    createdAt: new Date(),
                    chapterName: 'Sample Chapter 2'
                }
            ];

            Lectures.getAllLectures.mockResolvedValue(mockLectures);

            const res = await request(app).get('/lectures');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockLectures);
        });
    });
});
