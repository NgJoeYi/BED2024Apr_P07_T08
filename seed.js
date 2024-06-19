// Import necessary modules
const sql = require("mssql");
const path = require("path");
const dbConfig = require("./dbConfig");

// SQL data for seeding the database
const seedSQL = 
`
-- REMOVING FOREIGN KEYS
declare @sqlf nvarchar(max) = (
    select 
        'alter table ' + quotename(schema_name(schema_id)) + '.' +
        quotename(object_name(parent_object_id)) +
        ' drop constraint '+quotename(name) + ';'
    from sys.foreign_keys
    for xml path('')
);
exec sp_executesql @sqlf;


-- DROPPING ALL TABLES
DECLARE @sql NVARCHAR(max)=''

SELECT @sql += ' Drop table ' + QUOTENAME(TABLE_SCHEMA) + '.'+ QUOTENAME(TABLE_NAME) + '; '
FROM   INFORMATION_SCHEMA.TABLES
WHERE  TABLE_TYPE = 'BASE TABLE'

Exec Sp_executesql @sql


-- CREATE AND INSERT TABLES  
CREATE TABLE Users(
    id INT PRIMARY KEY IDENTITY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(8) NOT NULL
);

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
    posted_date DATETIME DEFAULT GETDATE()
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
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000),
    VideoURL NVARCHAR(256),
    Video VARBINARY(MAX),
    LectureImage VARBINARY(MAX),
    Duration INT, -- Duration in minutes
    Position INT, -- Position in the course sequence
    CreatedAt DATETIME DEFAULT GETDATE()
);

`;

// Load the SQL and run the seed process
async function run() {
    try {
        // make sure that any items are correctly URL encoded in the connection string
        const connection = await sql.connect(dbConfig);
        const request = connection.request();
        const result = await request.query(seedSQL);
        console.log(result);

        connection.close();
    } catch (err) {
        console.log(err);
    }
}

run();
console.log("Seeding completed");