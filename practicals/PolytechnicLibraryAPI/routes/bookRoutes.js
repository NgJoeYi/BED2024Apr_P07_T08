const express = require('express');
const { fetchAllBooks, changeBookAvailability, getAllBooks } = require('../controller/bookController');
const { verifyJWT, authorizeRoles } = require('../middleware/authMiddleware');
const { updateBookAvailability } = require('../model/book');
const router = express.Router();

router.get('/books', verifyJWT, getAllBooks);
router.put('/books/:bookId/availability', verifyJWT, authorizeRoles('librarian'), updateBookAvailability);

module.exports = router;
