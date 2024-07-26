const request = require('supertest');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const lectureController = require('../../controllers/lectureController');
const Lectures = require('../../models/Lectures');

// Mock data and functions
jest.mock('../../models/Lectures');

const app = express();
app.use(express.json());

// Middleware to set user
app.use((req, res, next) => {
    req.user = { id: 1 }; // Mock user
    next();
});

// Mock multer middleware
const mockUpload = (req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        req.file = null; // Simulate no video file provided
    }
    req.body.courseID = '1'; // Mock courseID
    next();
};

app.post('/upload', mockUpload, lectureController.createLecture);
app.get('/lectures', lectureController.getAllLectures);

describe('Lecture Controller', () => {
    describe('Create Lecture', () => {
        it('should return 400 if video is not provided', async () => {
            const res = await request(app)
                .post('/upload')
                .field('title', 'Sample Lecture')
                .field('duration', '60')
                .field('description', 'Sample Description')
                .field('chapterName', 'Sample Chapter')
                .field('courseID', '1');

            expect(res.status).toBe(400);
            expect(res.text).toBe('Video not provided');
        });
    });
});
