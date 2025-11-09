const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create issue request (User)
exports.createIssueRequest = async (req, res) => {
  try {
    const { subject, description, priority } = req.body;
    const userId = req.user.id;

    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }

    const issue = await prisma.issueRequest.create({
      data: {
        userId,
        subject,
        description,
        priority: priority || 'medium',
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(issue);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all issue requests (Admin) or user's own issues (User)
exports.getIssueRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let issues;

    if (userRole === 'ADMIN') {
      // Admin can see all issues
      issues = await prisma.issueRequest.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              email: true,
              contact: true
            }
          }
        },
        orderBy: [
          { status: 'asc' }, // pending first
          { createdAt: 'desc' }
        ]
      });
    } else {
      // Regular users can only see their own issues
      issues = await prisma.issueRequest.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              email: true,
              contact: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json(issues);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single issue by ID
exports.getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const issue = await prisma.issueRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            contact: true
          }
        }
      }
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Only admin or issue owner can view
    if (userRole !== 'ADMIN' && issue.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(issue);
  } catch (error) {
    console.error('Get issue by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update issue request (Admin only - for status and admin notes)
exports.updateIssueRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, priority } = req.body;

    const issue = await prisma.issueRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (priority) updateData.priority = priority;

    const updatedIssue = await prisma.issueRequest.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.json(updatedIssue);
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete issue request
exports.deleteIssueRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const issue = await prisma.issueRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Only admin or issue owner can delete
    if (userRole !== 'admin' && issue.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.issueRequest.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending issues count (for notifications)
exports.getPendingIssuesCount = async (req, res) => {
  try {
    const count = await prisma.issueRequest.count({
      where: { status: 'pending' }
    });

    res.json({ count });
  } catch (error) {
    console.error('Get pending count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
