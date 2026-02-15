const express = require('express');
const { body } = require('express-validator');
const bodyController = require('../controllers/bodyController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

const workoutValidation = [
  body('type').trim().notEmpty().withMessage('Workout type is required'),
  body('date').isISO8601().withMessage('Invalid date format'),
];

const measurementValidation = [
  body('date').isISO8601().withMessage('Invalid date format'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Invalid weight'),
];

router.use(authenticate);

// Workouts
router.get('/workouts', bodyController.getWorkouts);
router.get('/workouts/stats', bodyController.getWorkoutStats);
router.get('/workouts/:id', bodyController.getWorkout);
router.post('/workouts', workoutValidation, validate, bodyController.createWorkout);
router.put('/workouts/:id', workoutValidation, validate, bodyController.updateWorkout);
router.delete('/workouts/:id', bodyController.deleteWorkout);

// Measurements
router.get('/measurements', bodyController.getMeasurements);
router.get('/measurements/latest', bodyController.getLatestMeasurement);
router.get('/measurements/progress', bodyController.getProgress);
router.get('/measurements/:id', bodyController.getMeasurement);
router.post('/measurements', measurementValidation, validate, bodyController.createMeasurement);
router.delete('/measurements/:id', bodyController.deleteMeasurement);

// Progress Photos
router.get('/photos', bodyController.getProgressPhotos);
router.post('/photos', bodyController.uploadProgressPhoto);
router.delete('/photos/:id', bodyController.deleteProgressPhoto);

module.exports = router;