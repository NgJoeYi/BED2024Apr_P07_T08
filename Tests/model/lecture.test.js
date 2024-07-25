const Lectures = require('../../models/Lectures'); // Adjust the path as needed
const mockMssql = require('../mock_mssql'); // Adjust the path as needed

jest.mock('mssql', () => mockMssql);

describe('Lecture Model Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mock calls
  });

  it('should fetch all lectures from the database', async () => {
    const mockLectures = [
      { LectureID: 1, CourseID: 1, UserID: 1, Title: 'Lecture 1', Description: 'Description 1', Video: 'video1.mp4', Duration: 60, Position: 1, CreatedAt: new Date(), ChapterName: 'Chapter 1' },
      { LectureID: 2, CourseID: 1, UserID: 1, Title: 'Lecture 2', Description: 'Description 2', Video: 'video2.mp4', Duration: 90, Position: 2, CreatedAt: new Date(), ChapterName: 'Chapter 1' }
    ];

    mockMssql.request().query.mockResolvedValueOnce({ recordset: mockLectures });

    const result = await Lectures.getAllLectures();
    expect(result).toEqual(mockLectures.map(lecture => new Lectures(
      lecture.LectureID,
      lecture.CourseID,
      lecture.UserID,
      lecture.Title,
      lecture.Description,
      lecture.Video,
      lecture.Duration,
      lecture.Position,
      lecture.CreatedAt,
      lecture.ChapterName
    )));
    expect(mockMssql.request().query).toHaveBeenCalledWith('SELECT * FROM Lectures;');
  });

  it('should handle database errors gracefully', async () => {
    const errorMessage = 'Database error';
    mockMssql.request().query.mockRejectedValueOnce(new Error(errorMessage));

    await expect(Lectures.getAllLectures()).rejects.toThrow(errorMessage);
  });

  describe('createLecture', () => {
    it('should create a new lecture and return the new lecture ID', async () => {
      const newLectureData = {
        courseID: 1,
        userID: 1,
        title: 'New Lecture',
        description: 'New Lecture Description',
        video: 'newVideo.mp4',
        duration: 60,
        position: 1,
        chapterName: 'New Chapter'
      };

      const mockNewLectureID = 1;
      mockMssql.request().query.mockResolvedValueOnce({ recordset: [{ LectureID: mockNewLectureID }] });

      const result = await Lectures.createLecture(newLectureData);
      expect(result).toBe(mockNewLectureID);

      const request = mockMssql.request();
      expect(request.input).toHaveBeenCalledWith('CourseID', mockMssql.Int, newLectureData.courseID);
      expect(request.input).toHaveBeenCalledWith('UserID', mockMssql.Int, newLectureData.userID);
      expect(request.input).toHaveBeenCalledWith('Title', mockMssql.NVarChar, newLectureData.title);
      expect(request.input).toHaveBeenCalledWith('Description', mockMssql.NVarChar, newLectureData.description);
      expect(request.input).toHaveBeenCalledWith('Video', mockMssql.NVarChar, newLectureData.video);
      expect(request.input).toHaveBeenCalledWith('Duration', mockMssql.Int, newLectureData.duration);
      expect(request.input).toHaveBeenCalledWith('Position', mockMssql.Int, newLectureData.position);
      expect(request.input).toHaveBeenCalledWith('ChapterName', mockMssql.NVarChar, newLectureData.chapterName);
      expect(request.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO Lectures'));
    });

    it('should handle errors when creating a lecture', async () => {
      const errorMessage = 'Database error';
      mockMssql.request().query.mockRejectedValueOnce(new Error(errorMessage));

      const newLectureData = {
        courseID: 1,
        userID: 1,
        title: 'New Lecture',
        description: 'New Lecture Description',
        video: 'newVideo.mp4',
        duration: 60,
        position: 1,
        chapterName: 'New Chapter'
      };

      await expect(Lectures.createLecture(newLectureData)).rejects.toThrow(errorMessage);
    });
  });
});
