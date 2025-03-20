import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';

const router = express.Router();

// Get tryouts owned by the user
router.get('/owned', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const ownerships = await db.ownership.findMany({
      where: {
        userId: userId,
      },
      include: {
        tryoutList: true,
      },
    });

    return res.status(200).json(ownerships);
  } catch (error) {
    console.error('Error fetching owned tryouts:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get available tryouts for purchase
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get tryouts that the user doesn't own
    const ownedTryoutIds = await db.ownership.findMany({
      where: {
        userId: userId,
      },
      select: {
        tryoutListId: true,
      },
    });

    const ownedIds = ownedTryoutIds.map(item => item.tryoutListId);

    // Get active tryout lists that the user doesn't own
    const availableTryouts = await db.tryoutList.findMany({
      where: {
        status: true,
        id: {
          notIn: ownedIds.length > 0 ? ownedIds : [-1], // If no owned ids, use a dummy value
        },
      },
    });

    return res.status(200).json(availableTryouts);
  } catch (error) {
    console.error('Error fetching available tryouts:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get specific tryout detail with its questions
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const tryoutId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user owns this tryout
    const ownership = await db.ownership.findFirst({
      where: {
        userId: userId,
        tryoutListId: tryoutId,
      },
    });

    if (!ownership) {
      return res.status(403).json({ message: 'You do not have access to this tryout' });
    }

    // Get tryout details with questions
    const tryout = await db.tryoutList.findUnique({
      where: {
        id: tryoutId,
      },
      include: {
        tryouts: true,
      }
    });

    if (!tryout) {
      return res.status(404).json({ message: 'Tryout not found' });
    }

    return res.status(200).json(tryout);
  } catch (error) {
    console.error('Error fetching tryout details:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Submit tryout answers
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const tryoutId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { answers } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user owns this tryout
    const ownership = await db.ownership.findFirst({
      where: {
        userId: userId,
        tryoutListId: tryoutId,
      },
    });

    if (!ownership) {
      return res.status(403).json({ message: 'You do not have access to this tryout' });
    }

    // Get tryout questions to calculate score
    const tryoutQuestions = await db.tryout.findMany({
      where: {
        tryoutListId: tryoutId,
      },
    });

    // Calculate scores by category
    let tiuScore = 0;
    let twkScore = 0;
    let tkpScore = 0;
    let totalPoints = 0;

    // Process each answer
    for (const answer of answers) {
      // Save or update the user's answer
      await db.answer.upsert({
        where: {
          userId_tryoutListId_number: {
            userId: userId,
            tryoutListId: tryoutId,
            number: answer.number,
          },
        },
        update: {
          answer: answer.answer,
        },
        create: {
          userId: userId,
          tryoutListId: tryoutId,
          number: answer.number,
          answer: answer.answer,
        },
      });

      // Find the corresponding question and check if answer is correct
      const question = tryoutQuestions.find(q => q.id === answer.questionId);
      if (question && question.correctAnswer === answer.answer) {
        const points = question.points || 5; // Default to 5 points if not specified
        totalPoints += points;
        
        // Add points to the appropriate category
        if (question.type === 'TKD_BUMN') {
          tiuScore += points;
        } else if (question.type === 'TWK_BUMN') {
          twkScore += points;
        } else if (question.type === 'AKHLAK_BUMN') {
          tkpScore += points;
        }
      }
    }

    // Save the score
    await db.score.upsert({
      where: {
        userId_tryoutListId: {
          userId: userId,
          tryoutListId: tryoutId,
        },
      },
      update: {
        tiu: tiuScore,
        twk: twkScore,
        tkp: tkpScore,
        total: totalPoints,
      },
      create: {
        userId: userId,
        tryoutListId: tryoutId,
        tiu: tiuScore,
        twk: twkScore,
        tkp: tkpScore,
        total: totalPoints,
      },
    });

    // Mark tryout as done
    await db.ownership.update({
      where: {
        id: ownership.id,
      },
      data: {
        isDone: true,
      },
    });

    return res.status(200).json({ 
      message: 'Tryout submitted successfully',
      scores: {
        tiu: tiuScore,
        twk: twkScore,
        tkp: tkpScore,
        total: totalPoints,
      }
    });
  } catch (error) {
    console.error('Error submitting tryout:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router; 