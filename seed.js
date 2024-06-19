// Import necessary modules
const sql = require("mssql");
const path = require("path");
const dbConfig = require("./dbConfig");

// SQL data for seeding the database
const seedSQL = 
`
CREATE TABLE members (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    member_role VARCHAR(20) NOT NULL
);

CREATE TABLE member_comments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    parent_comment_id INT NULL,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (parent_comment_id) REFERENCES member_comments(id)
);

-- Inserting data into the members table
INSERT INTO members (username, member_role) VALUES 
('john_doe', 'student'),
('jane_smith', 'lecturer'),
('alice_jones', 'student'),
('bob_brown', 'lecturer'),
('carol_white', 'student');



-- Inserting the main discussion comment
INSERT INTO member_comments (member_id, content) VALUES
(2, 'Understanding advanced calculus can be challenging for many students. What strategies have you found most effective in mastering these concepts?');

-- Get the ID of the main comment
DECLARE @MainCommentId INT;
SET @MainCommentId = SCOPE_IDENTITY();

-- Inserting replies to the main comment
INSERT INTO member_comments (member_id, content, parent_comment_id) VALUES
(1, 'One strategy that has helped me is breaking down complex problems into smaller, more manageable parts. This makes it easier to understand the underlying concepts.', @MainCommentId),
(3, 'I find it helpful to visualize the problems graphically. Drawing diagrams or using graphing tools can provide a different perspective on the problem.', @MainCommentId),
(4, 'As a lecturer, I encourage students to form study groups. Discussing problems and solutions with peers can lead to a deeper understanding and uncover different approaches.', @MainCommentId),
(5, 'I also recommend using online resources like video tutorials and interactive problem solvers. These tools can offer additional explanations and practice opportunities.', @MainCommentId),
(3, 'Another approach is to seek help from instructors during office hours. Getting direct feedback and guidance can significantly improve your understanding.', @MainCommentId);

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