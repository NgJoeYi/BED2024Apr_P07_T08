const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
async function run() {
    try {
        // Connect to the database
        const connection = await sql.connect(dbConfig);

        // Remove foreign keys
        const removeForeignKeys = `
        DECLARE @sqlf NVARCHAR(MAX) = (
            SELECT 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' +
                   QUOTENAME(OBJECT_NAME(parent_object_id)) +
                   ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
            FROM sys.foreign_keys
            FOR XML PATH('')
        );
        EXEC sp_executesql @sqlf;
        `;
        await connection.request().query(removeForeignKeys);

        // Drop all tables
        const dropTables = `
        DECLARE @sql NVARCHAR(MAX) = '';
        SELECT @sql += ' DROP TABLE ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) + ';'
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE';
        EXEC sp_executesql @sql;
        `;
        await connection.request().query(dropTables);

        // Create Users table
        const createUsersTable = `
        CREATE TABLE Users (
            id INT PRIMARY KEY IDENTITY,
            name VARCHAR(50) NOT NULL,
            dob DATE NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(8) NOT NULL
        );
        `;
        await connection.request().query(createUsersTable);

        // Create other tables
        const createTables = `
        CREATE TABLE ProfilePic (
            pic_id INT PRIMARY KEY IDENTITY,
            user_id INT NOT NULL UNIQUE,
            FOREIGN KEY (user_id) REFERENCES Users(id),
            img VARCHAR(MAX) NOT NULL
        );

        CREATE TABLE Discussions (
            id INT PRIMARY KEY IDENTITY(1,1),
            title NVARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            category NVARCHAR(50) NOT NULL,
            posted_date DATETIME DEFAULT GETDATE(),
            user_id INT NOT NULL,
            likes INT DEFAULT 0,
            dislikes INT DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES Users(id)
        );

        CREATE TABLE user_comments (
            id INT IDENTITY(1,1) PRIMARY KEY,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT GETDATE(),
            parent_comment_id INT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(id),
            FOREIGN KEY (parent_comment_id) REFERENCES user_comments(id)
        );

        CREATE TABLE Lecturer (
            LecturerID INT PRIMARY KEY IDENTITY(1,1),
            UserID INT FOREIGN KEY REFERENCES Users(id),
            ProfilePicture VARBINARY(MAX),
            CreatedAt DATETIME DEFAULT GETDATE()
        );

        CREATE TABLE Courses (
            CourseID INT PRIMARY KEY IDENTITY(1,1),
            LecturerID INT FOREIGN KEY REFERENCES Lecturer(LecturerID),
            Title NVARCHAR(200) NOT NULL,
            Description NVARCHAR(2000),
            Category NVARCHAR(100),
            Level NVARCHAR(50),
            Duration INT, -- Duration in minutes
            CreatedAt DATETIME DEFAULT GETDATE(),
            CourseImage VARBINARY(MAX)
        );

        CREATE TABLE Lectures (
            LectureID INT PRIMARY KEY IDENTITY(1,1),
            CourseID INT FOREIGN KEY REFERENCES Courses(CourseID),
            LecturerID INT FOREIGN KEY REFERENCES Lecturer(LecturerID),
            Title NVARCHAR(200) NOT NULL,
            Description NVARCHAR(2000),
            VideoURL NVARCHAR(256),
            Video VARBINARY(MAX),
            LectureImage VARBINARY(MAX),
            Duration INT, -- Duration in minutes
            Position INT, -- Position in the course sequence
            CreatedAt DATETIME DEFAULT GETDATE()
        );

        CREATE TABLE user_reviews (
            review_id INT PRIMARY KEY IDENTITY,
            user_id INT NOT NULL,
            review_text TEXT NOT NULL,
            rating INT CHECK (rating >= 1 AND rating <= 5),
            review_date DATETIME DEFAULT GETDATE(),
            FOREIGN KEY (user_id) REFERENCES Users(id)
        );
        `;
        await connection.request().query(createTables);

        // Insert data into Users table with hashed passwords
        const users = [
            { name: 'John Doe', dob: '1990-01-01', email: 'john_doe@example.com', password: 'password123', role: 'student' },
            { name: 'Jane Smith', dob: '1985-02-02', email: 'jane_smith@example.com', password: 'password456', role: 'lecturer' },
            { name: 'Alice Jones', dob: '1992-03-03', email: 'alice_jones@example.com', password: 'password789', role: 'student' },
            { name: 'Bob Brown', dob: '1988-04-04', email: 'bob_brown@example.com', password: 'password000', role: 'lecturer' },
            { name: 'Carol White', dob: '1995-05-05', email: 'carol_white@example.com', password: 'password111', role: 'student' },
            { name: 'Alison Johnson', dob: '1990-01-15', email: 'alice.johnson@example.com', password: 'password222', role: 'student' },
            { name: 'Bob Pink', dob: '1985-03-22', email: 'bob.pink@example.com', password: 'password333', role: 'student' },
            { name: 'Charlie Grey', dob: '1992-07-30', email: 'charlie.grey@example.com', password: 'password444', role: 'student' },
            { name: 'Diana Prince', dob: '1988-11-08', email: 'diana.prince@example.com', password: 'password555', role: 'student' },
        ];

        for (let user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await connection.request().query(`
                INSERT INTO Users (name, dob, email, password, role) 
                VALUES ('${user.name}', '${user.dob}', '${user.email}', '${hashedPassword}', '${user.role}')
            `);
        }
        // Insert data into Lecturer table
        const insertLecturers = `
        INSERT INTO Lecturer (UserID, ProfilePicture) VALUES
        ((SELECT id FROM Users WHERE email = 'jane_smith@example.com'), NULL),
        ((SELECT id FROM Users WHERE email = 'bob_brown@example.com'), NULL);
        `;
        await connection.request().query(insertLecturers);

        // Path to courseImage file
        const courseImagePath = path.join(__dirname,'../BED2024Apr_P07_T08/public/courseImage/course1.jpeg');

        // Read courseImage file 
        const courseImageBuffer = fs.readFileSync(courseImagePath);

        // Insert data into Courses table
        const insertCourses = `
        INSERT INTO Courses (LecturerID, Title, Description, Category, Level, Duration, CourseImage) VALUES 
        (1,'Introduction to Python', 'Learn the basics of Python programming, including syntax, data types, and functions.', 'Programming', 'Beginner', 360, @image),
        (2,'Advanced Algebra', 'Dive deep into algebraic concepts and techniques used in advanced mathematics.', 'Mathematics', 'Advanced', 480, @image),
        (2,'Digital Marketing', 'Explore the strategies and tools used in digital marketing to reach and engage audiences.', 'Marketing', 'Intermediate', 300, @image);
        `;
        await connection.request()
        .input('image',courseImageBuffer)
        .query(insertCourses);
        
        // Path to external files 
        const videoFilePath = path.join(__dirname, '../BED2024Apr_P07_T08/public/lectureVideos/video1.mp4');
        const lectureImage = path.join(__dirname, '../BED2024Apr_P07_T08/public/lectureImage/lecture1.jpeg');
        
        // Read external file
        const videoBuffer = fs.readFileSync(videoFilePath);
        const imageBuffer = fs.readFileSync(lectureImage);

        // Insert data into Lectures table
        const insertLectures = `
        INSERT INTO Lectures (CourseID, LecturerID, Title, Description, VideoURL, Video, LectureImage, Duration, Position) VALUES
        ((SELECT CourseID FROM Courses WHERE Title = 'Introduction to Python'), 
         (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'jane_smith@example.com')), 
         'Python Basics', 'Introduction to Python programming basics.', 'http://example.com/python_basics', @Video, @Image, 60, 1),

        ((SELECT CourseID FROM Courses WHERE Title = 'Introduction to Python'), 
         (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'jane_smith@example.com')), 
         'Data Types in Python', 'Understanding different data types in Python.', 'http://example.com/data_types',@Video,@Image, 90, 2),
        ((SELECT CourseID FROM Courses WHERE Title = 'Advanced Algebra'), 
         (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'bob_brown@example.com')), 
         'Algebraic Structures', 'Exploring advanced algebraic structures.', 'http://example.com/algebraic_structures',@Video,@Image, 120, 1),
        ((SELECT CourseID FROM Courses WHERE Title = 'Advanced Algebra'), 
         (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'bob_brown@example.com')), 
         'Polynomial Equations', 'Solving polynomial equations in algebra.', 'http://example.com/polynomial_equations', @Video,@Image,100, 2),
        ((SELECT CourseID FROM Courses WHERE Title = 'Digital Marketing'), 
         (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'jane_smith@example.com')), 
         'SEO Basics', 'Introduction to Search Engine Optimization.', 'http://example.com/seo_basics', @Video,@Image,75, 1),
        ((SELECT CourseID FROM Courses WHERE Title = 'Digital Marketing'), 
         (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'jane_smith@example.com')), 
         'Content Marketing', 'Strategies for effective content marketing.', 'http://example.com/content_marketing',@Video,@Image, 85, 2);
        `;
        await connection.request()
        .input('Video', sql.VarBinary, videoBuffer)
        .input('Image',sql.VarBinary,imageBuffer)
        .query(insertLectures);

        // Insert data into user_reviews table
        const insertUserReviews = `
        INSERT INTO user_reviews (user_id, review_text, rating, review_date) VALUES 
        (6, 'Great course content, very informative!', 5, GETDATE()),
        (7, 'Needs improvement in course materials.', 3, GETDATE()),
        (8, 'Well-structured lectures and helpful professor.', 4, GETDATE()),
        (9, 'Lecture pace was too fast to follow.', 2, GETDATE());
        `;
        await connection.request().query(insertUserReviews);

        // Insert main discussion comment and replies
        const insertDiscussionComments = `
        -- Inserting the main discussion comment
        INSERT INTO user_comments (user_id, content, created_at) VALUES
        (2, 'Understanding advanced calculus can be challenging for many students. What strategies have you found most effective in mastering these concepts?', GETDATE());

        -- Get the ID of the main comment
        DECLARE @MainCommentId INT;
        SET @MainCommentId = SCOPE_IDENTITY();

        -- Inserting replies to the main comment
        INSERT INTO user_comments (user_id, content, parent_comment_id, created_at) VALUES
        (1, 'One strategy that has helped me is breaking down complex problems into smaller, more manageable parts. This makes it easier to understand the underlying concepts.', @MainCommentId, GETDATE()),
        (3, 'I find it helpful to visualize the problems graphically. Drawing diagrams or using graphing tools can provide a different perspective on the problem.', @MainCommentId, GETDATE()),
        (4, 'As a lecturer, I encourage students to form study groups. Discussing problems and solutions with peers can lead to a deeper understanding and uncover different approaches.', @MainCommentId, GETDATE()),
        (5, 'I also recommend using online resources like video tutorials and interactive problem solvers. These tools can offer additional explanations and practice opportunities.', @MainCommentId, GETDATE()),
        (3, 'Another approach is to seek help from instructors during office hours. Getting direct feedback and guidance can significantly improve your understanding.', @MainCommentId, GETDATE());
        `;
        await connection.request().query(insertDiscussionComments);

        // Insert data into Discussions table
        const insertDiscussions = `
        INSERT INTO Discussions (title, description, category, posted_date, user_id) VALUES
        ('Coding for python', 'Python design philosophy emphasizes code readability and syntax that allows programmers to express concepts in fewer lines of code compared to languages such as C++ or Java.', 'coding', GETDATE(), (SELECT id FROM Users WHERE email = 'john_doe@example.com')),
        ('Advanced Algebra', 'Advanced algebra is a branch of mathematics that extends the principles and concepts of elementary algebra into more complex and abstract areas.', 'math', GETDATE(), (SELECT id FROM Users WHERE email = 'jane_smith@example.com'));
        `;
        await connection.request().query(insertDiscussions);

        connection.close();
        console.log("Seeding completed");
    } catch (err) {
        console.error("Error during seeding:", err);
    }
}

run();
