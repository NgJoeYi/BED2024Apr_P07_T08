const sql = require("mssql");
const dbConfig = require("./dbConfig");

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

        // Insert data into Users table
        const insertUsers = `
        INSERT INTO Users (name, dob, email, password, role) VALUES 
        ('John Doe', '1990-01-01', 'john_doe@example.com', 'hashed_password', 'student'),
        ('Jane Smith', '1985-02-02', 'jane_smith@example.com', 'hashed_password', 'lecturer'),
        ('Alice Jones', '1992-03-03', 'alice_jones@example.com', 'hashed_password', 'student'),
        ('Bob Brown', '1988-04-04', 'bob_brown@example.com', 'hashed_password', 'lecturer'),
        ('Carol White', '1995-05-05', 'carol_white@example.com', 'hashed_password', 'student'),
        ('Alison Johnson', '1990-01-15', 'alice.johnson@example.com', 'password123', 'student'),
        ('Bob Pink', '1985-03-22', 'bob.pink@example.com', 'password456', 'student'),
        ('Charlie Grey', '1992-07-30', 'charlie.grey@example.com', 'password789', 'student'),
        ('Diana Prince', '1988-11-08', 'diana.prince@example.com', 'password321', 'student');
        `;
        await connection.request().query(insertUsers);

        // Insert data into Lecturer table
        const insertLecturers = `
        INSERT INTO Lecturer (UserID, ProfilePicture) VALUES
        ((SELECT id FROM Users WHERE email = 'jane_smith@example.com'), NULL),
        ((SELECT id FROM Users WHERE email = 'bob_brown@example.com'), NULL);
        `;
        await connection.request().query(insertLecturers);

        // Insert data into Courses table
        const insertCourses = `
        INSERT INTO Courses (Title, Description, Category, Level, Duration, CourseImage) VALUES 
        ('Introduction to Python', 'Learn the basics of Python programming, including syntax, data types, and functions.', 'Programming', 'Beginner', 360, NULL),
        ('Advanced Algebra', 'Dive deep into algebraic concepts and techniques used in advanced mathematics.', 'Mathematics', 'Advanced', 480, NULL),
        ('Digital Marketing', 'Explore the strategies and tools used in digital marketing to reach and engage audiences.', 'Marketing', 'Intermediate', 300, NULL);
        `;
        await connection.request().query(insertCourses);

        // Insert data into Lectures table
        const insertLectures = `
        INSERT INTO Lectures (CourseID, LecturerID, Title, Description, VideoURL, Duration, Position) VALUES
        ((SELECT CourseID FROM Courses WHERE Title = 'Introduction to Python'), 
         (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'jane_smith@example.com')), 
         'Python Basics', 'Introduction to Python programming basics.', 'http://example.com/python_basics', 60, 1),
        ((SELECT CourseID FROM Courses WHERE Title = 'Introduction to Python'), 
         (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'jane_smith@example.com')), 
         'Data Types in Python', 'Understanding different data types in Python.', 'http://example.com/data_types', 90, 2),
        ((SELECT CourseID FROM Courses WHERE Title = 'Advanced Algebra'), 
         (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'bob_brown@example.com')), 
         'Algebraic Structures', 'Exploring advanced algebraic structures.', 'http://example.com/algebraic_structures', 120, 1),
        ((SELECT CourseID FROM Courses WHERE Title = 'Advanced Algebra'), 
         (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'bob_brown@example.com')), 
         'Polynomial Equations', 'Solving polynomial equations in algebra.', 'http://example.com/polynomial_equations', 100, 2),
        ((SELECT CourseID FROM Courses WHERE Title = 'Digital Marketing'), 
         (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'jane_smith@example.com')), 
         'SEO Basics', 'Introduction to Search Engine Optimization.', 'http://example.com/seo_basics', 75, 1),
        ((SELECT CourseID FROM Courses WHERE Title = 'Digital Marketing'), 
         (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'jane_smith@example.com')), 
         'Content Marketing', 'Strategies for effective content marketing.', 'http://example.com/content_marketing', 85, 2);
        `;
        await connection.request().query(insertLectures);

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

        connection.close();
        console.log("Seeding completed");
    } catch (err) {
        console.error("Error during seeding:", err);
    }
}

run();
