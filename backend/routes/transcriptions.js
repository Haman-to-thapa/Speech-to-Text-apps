import express from 'express';
import { transcribeAudio, getTranscriptions, deleteTranscription } from '../controllers/transcriptionController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect); // All routes are protected

router.route('/')
  .get(getTranscriptions)
  .post(upload.single('audio'), transcribeAudio);

router.route('/:id')
  .delete(deleteTranscription);

export default router;
