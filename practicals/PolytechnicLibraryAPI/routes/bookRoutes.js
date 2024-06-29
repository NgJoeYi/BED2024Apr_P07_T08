// routes/bookRoutes.js
const express = require('express');
const { fetchAllBooks, changeBookAvailability } = require('../controllers/bookController');
const { verifyJWT, authorizeRoles } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/books', verifyJWT, fetchAllBooks);
router.put('/books/:bookId/availability', verifyJWT, authorizeRoles('librarian'), changeBookAvailability);

module.exports = router;
