CREATE TABLE Users (
user_id INT PRIMARY KEY NOT NULL IDENTITY,
username VARCHAR(255) NOT NULL UNIQUE,
passwordHash VARCHAR(255) NOT NULL,
role VARCHAR(20) CHECK (role IN ('member', 'librarian'))
);

CREATE TABLE Books(
book_id INT PRIMARY KEY IDENTITY,
title VARCHAR(255) NOT NULL,
author VARCHAR(255) NOT NULL,
availability char(1) CHECK(availability in ('Y', 'N'))
)