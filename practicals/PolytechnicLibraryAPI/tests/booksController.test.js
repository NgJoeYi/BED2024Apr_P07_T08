const booksController = require("../controller/bookController");
const Book = require("../model/book");

jest.mock("../model/book"); // Replace with the correct path to your Book model

describe("booksController.getAllBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock calls before each test
  });

  it("should fetch all books and return a JSON response", async () => {
    const mockBooks = [
        {
            book_id: 1,
            title: "The Adventures of Huckleberry Finn",
            author: "Mark Twain",
            availability: "N"
        },
        {
            book_id: 2,
            title: "The Scarlet Letter",
            author: "Nathaniel Hawthorne",
            availability: "Y"
        },
        {
            book_id: 3,
            title: "David Copperfield",
            author: "Charles Dickens",
            availability: "N"
        }
    ];

    // Mock the Book.getAllBooks function to return the mock data
    Book.getAllBooks.mockResolvedValue(mockBooks);

    const req = {};
    const res = {
      json: jest.fn(), // Mock the res.json function
      status: jest.fn().mockReturnThis()
    };

    await booksController.getAllBooks(req, res);
    expect(Book.getAllBooks).toHaveBeenCalledTimes(1); // Check if getAllBooks was called
    expect(res.json).toHaveBeenCalledWith(mockBooks); // Check the response body
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Error in bookController: Could not get all books";
    Book.getAllBooks.mockRejectedValue(new Error("Database error")); // Simulate an error

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await booksController.getAllBooks(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

describe("booksController.updateBookAvailability", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock calls before each test
  });

  it("should update the book's availability and return status code 200", async () => {
    const mockBook = {
      book_id: 2,
      title: "The Scarlet Letter",
      author: "Nathaniel Hawthorne",
      availability: "Y"
    };

    Book.getBookById.mockResolvedValue(mockBook); // Book found
    Book.updateBookAvailability.mockResolvedValue(mockBook); // Update is successful

    const req = {
      params: { id: 2 },
      body: { availability: 'Y' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await booksController.updateBookAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockBook);
  });

  it("should handle cases where book does not exist and return a 404 status with error message", async () => {
    Book.getBookById.mockResolvedValue(null); // Simulate case where book cannot be found

    const req = {
      params: { id: 1 },
      body: { availability: 'Y' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    await booksController.updateBookAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith("Book not found");
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Error in bookController: Could not update book availability";
    Book.getBookById.mockRejectedValue(new Error("Database error")); // Simulate an error

    const req = {
      params: { id: 1 },
      body: { availability: 'Y' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await booksController.updateBookAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});
