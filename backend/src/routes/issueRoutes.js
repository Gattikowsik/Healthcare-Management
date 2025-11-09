const express = require('express');
const {
  createIssueRequest,
  getIssueRequests,
  getIssueById,
  updateIssueRequest,
  deleteIssueRequest,
  getPendingIssuesCount
} = require('../controllers/issueController');
const authenticate = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/adminMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User can create and view their own issues
router.post('/', createIssueRequest);
router.get('/', getIssueRequests); // Returns all for admin, own for users
router.get('/pending/count', getPendingIssuesCount); // For notification badge
router.get('/:id', getIssueById);
router.delete('/:id', deleteIssueRequest);

// Only admin can update issues (status, notes)
router.put('/:id', isAdmin, updateIssueRequest);

module.exports = router;
