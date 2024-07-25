const express = require('express');
const request = require('supertest');
const multer = require('multer');
const path = require('path');
const { getAllLectures, createLecture } = require('../../controllers/lectureController');
const Lectures = require('../../models/Lectures');

// Mock the Lectures model
jest.mock('../../models/Lectures', () => ({
  getAllLectures: jest.fn(),
  createLecture: jest.fn()
}));

const app = express();
app.use(express.json());
app.use(multer({ storage: multer.memoryStorage() }).single('video')); // Use memory storage for testing

// Mock middleware to set req.user
app.use((req, res, next) => {
  req.user = { id: 1 }; // Mock user ID for testing
  next();
});

app.get('/lectures', getAllLectures);
app.post('/lectures', createLecture);

describe('Lectures Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mock calls
  });

  describe('getAllLectures', () => {
    it('should fetch all lectures and return a JSON response', async () => {
      const mockLectures = [
        { id: 1, title: 'Lecture 1', description: 'Description 1', chapterName: 'Chapter 1', duration: 60, video: 'video1.mp4' },
        { id: 2, title: 'Lecture 2', description: 'Description 2', chapterName: 'Chapter 2', duration: 90, video: 'video2.mp4' }
      ];

      Lectures.getAllLectures.mockResolvedValue(mockLectures);

      const response = await request(app).get('/lectures');

      expect(Lectures.getAllLectures).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLectures);
    });

    it('should handle errors and return a 500 status with an error message', async () => {
      const errorMessage = 'Database error';
      Lectures.getAllLectures.mockRejectedValue(new Error(errorMessage));

      const response = await request(app).get('/lectures');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error retrieving lectures');
    });
  });

  describe('createLecture', () => {
    it('should create a new lecture and return a JSON response', async () => {
      const mockLecture = {
        id: 1,
        title: 'New Lecture',
        description: 'New Lecture Description',
        chapterName: 'New Chapter',
        duration: 60,
        video: 'newVideo.mp4'
      };

      Lectures.createLecture.mockResolvedValue(mockLecture);

      const response = await request(app)
        .post('/lectures')
        .field('title', 'New Lecture')
        .field('description', 'New Lecture Description')
        .field('chapterName', 'New Chapter')
        .field('duration', '60')
        .field('courseID', '1')
        .attach('video', path.resolve(__dirname, 'testVideo.mp4')); // Ensure this file exists

      expect(Lectures.createLecture).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(mockLecture);
    }, 10000); // Increase timeout if needed

    it('should return 400 if video is not provided', async () => {
      console.log('Starting the test for missing video');

      const response = await request(app)
        .post('/lectures')
        .field('title', 'New Lecture')
        .field('description', 'New Lecture Description')
        .field('chapterName', 'New Chapter')
        .field('duration', '60')
        .field('courseID', '1');

      console.log('Response received:', response.status, response.text);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Video not provided');
    });

    it('should handle errors and return a 500 status with an error message', async () => {
      const errorMessage = 'Database error';
      Lectures.createLecture.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/lectures')
        .field('title', 'New Lecture')
        .field('description', 'New Lecture Description')
        .field('chapterName', 'New Chapter')
        .field('duration', '60')
        .field('courseID', '1')
        .attach('video', path.resolve(__dirname, 'testVideo.mp4'));

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error creating lecture');
    });
  });
});
