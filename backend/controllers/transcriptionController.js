import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import Transcription from '../models/Transcription.js';
import { config } from '../config/config.js';

// @desc    Upload and transcribe audio
// @route   POST /api/transcriptions
// @access  Private
export const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    console.log('Processing file:', req.file.filename, 'Size:', req.file.size, 'Type:', req.file.mimetype, 'Original:', req.file.originalname);
    
    // Check if file exists and is readable
    if (!fs.existsSync(req.file.path)) {
      return res.status(500).json({
        success: false,
        message: 'Uploaded file not found'
      });
    }
    
    const fileStats = fs.statSync(req.file.path);
    console.log('File stats:', { size: fileStats.size, path: req.file.path });

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/m4a', 'audio/mp4', 'audio/flac', 'audio/ogg'];
    const fileExtension = req.file.originalname.toLowerCase().split('.').pop();
    const allowedExtensions = ['mp3', 'wav', 'wave', 'm4a', 'mp4', 'flac', 'ogg'];

    if (!allowedTypes.includes(req.file.mimetype) && !allowedExtensions.includes(fileExtension)) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `Unsupported audio format: ${req.file.mimetype || fileExtension}. Please use MP3, WAV, M4A, FLAC, or OGG.`
      });
    }

    // Check file size (25MB limit for Deepgram)
    if (req.file.size > 25 * 1024 * 1024) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 25MB.'
      });
    }

    // Create transcription record
    const transcription = await Transcription.create({
      user: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      transcription: '',
      fileSize: req.file.size,
      status: 'processing'
    });

    try {
      // Transcribe using Deepgram API
      console.log('Attempting transcription with Deepgram...');

      const formData = new FormData();
      formData.append('audio', fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype || 'audio/mpeg'
      });

      const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en&punctuate=true', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${config.DEEPGRAM_API_KEY}`,
          ...formData.getHeaders()
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Deepgram API error:', errorText);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        // Update transcription status
        await Transcription.findByIdAndUpdate(transcription._id, { status: 'failed' });
        
        // Provide specific error messages based on status code
        if (response.status === 401) {
          return res.status(400).json({
            success: false,
            message: 'Invalid API key. Please check your Deepgram API credentials.'
          });
        } else if (response.status === 400) {
          const errorData = JSON.parse(errorText);
          if (errorData.err_msg && errorData.err_msg.includes('corrupt or unsupported data')) {
            return res.status(400).json({
              success: false,
              message: 'Audio file format not supported or file is corrupted. Please try a different audio file with clear speech content.'
            });
          }
          return res.status(400).json({
            success: false,
            message: 'Bad request to Deepgram API. Please check your audio file.'
          });
        } else if (response.status === 429) {
          return res.status(429).json({
            success: false,
            message: 'Rate limit exceeded. Please try again later.'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: `Transcription service error: ${response.status}`
        });
      }

      const result = await response.json();
      
      if (!result.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        // Update transcription status
        await Transcription.findByIdAndUpdate(transcription._id, { status: 'failed' });
        
        return res.status(400).json({
          success: false,
          message: 'No transcription found in the response'
        });
      }

      const transcriptionText = result.results.channels[0].alternatives[0].transcript;

      // Update transcription record
      await Transcription.findByIdAndUpdate(transcription._id, {
        transcription: transcriptionText,
        confidence: result.results.channels[0].alternatives[0].confidence || null,
        duration: result.metadata?.duration || null,
        status: 'completed'
      });

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        success: true,
        transcription: transcriptionText,
        confidence: result.results.channels[0].alternatives[0].confidence || null,
        duration: result.metadata?.duration || null,
        id: transcription._id,
        fileInfo: {
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype
        }
      });

    } catch (error) {
      console.error('Transcription error:', error);
      
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      // Update transcription status
      await Transcription.findByIdAndUpdate(transcription._id, { status: 'failed' });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to transcribe audio';
      if (error.message.includes('Connection error') || error.code === 'ECONNRESET') {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.message.includes('Deepgram API error: 401')) {
        errorMessage = 'Invalid Deepgram API key. Please check your API key configuration.';
      } else if (error.message.includes('Deepgram API error: 429')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.message.includes('Deepgram API error: 400')) {
        errorMessage = 'Invalid audio file format or corrupted file. Please try a different audio file.';
      } else if (error.message.includes('Deepgram API error: 413')) {
        errorMessage = 'File too large for Deepgram API. Please use a smaller audio file (max 25MB).';
      }

      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all transcriptions for user
// @route   GET /api/transcriptions
// @access  Private
export const getTranscriptions = async (req, res) => {
  try {
    const transcriptions = await Transcription.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transcriptions.length,
      data: transcriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete transcription
// @route   DELETE /api/transcriptions/:id
// @access  Private
export const deleteTranscription = async (req, res) => {
  try {
    const transcription = await Transcription.findById(req.params.id);

    if (!transcription) {
      return res.status(404).json({
        success: false,
        message: 'Transcription not found'
      });
    }

    // Make sure user owns transcription
    if (transcription.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this transcription'
      });
    }

    await transcription.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transcription deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
