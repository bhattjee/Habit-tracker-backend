const express = require('express');
const { body } = require('express-validator');
const journalController = require('../controllers/journalController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

const entryValidation = [
  body('entry_text').trim().notEmpty().withMessage('Entry text is required'),
  body('date').isISO8601().withMessage('Invalid date format'),
];

router.use(authenticate);

// Journal entries
router.get('/entries', journalController.getEntries);
router.get('/entries/mood-stats', journalController.getMoodStats);
router.get('/entries/:id', journalController.getEntry);
router.post('/entries', entryValidation, validate, journalController.createEntry);
router.put('/entries/:id', entryValidation, validate, journalController.updateEntry);
router.delete('/entries/:id', journalController.deleteEntry);

// Affirmations
router.get('/affirmations', journalController.getAffirmations);
router.get('/affirmations/random', journalController.getRandomAffirmation);
router.post('/affirmations', journalController.createAffirmation);
router.patch('/affirmations/:id/favorite', journalController.toggleFavoriteAffirmation);
router.delete('/affirmations/:id', journalController.deleteAffirmation);

module.exports = router;