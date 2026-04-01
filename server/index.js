require('dotenv').config();
const express = require('express');
const cors = require('cors');
const KJUR = require('jsrsasign');
const multer = require('multer');
const fs = require('fs');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Configure OpenAI client to point to Groq
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Configure Multer for processing audio file uploads
const upload = multer({ dest: 'uploads/' });

// Zoom Signature Endpoint
app.post('/api/zoom/signature', (req, res) => {
  const { meetingNumber, role } = req.body;

  if (!meetingNumber) {
    return res.status(400).json({ error: 'Meeting Number is required' });
  }

  try {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;
    const oHeader = { alg: 'HS256', typ: 'JWT' };

    const oPayload = {
      sdkKey: process.env.ZOOM_CLIENT_ID,
      appKey: process.env.ZOOM_CLIENT_ID,
      mn: meetingNumber,
      role: role || 0, // 0 for attendee, 1 for host
      iat: iat,
      exp: exp,
      tokenExp: exp
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    const signature = KJUR.jws.JWS.sign(
      'HS256',
      sHeader,
      sPayload,
      process.env.ZOOM_CLIENT_SECRET
    );

    res.json({ signature, sdkKey: process.env.ZOOM_CLIENT_ID });
  } catch (err) {
    console.error('Error generating signature:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Audio Transcription Endpoint via Groq
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }
  
  let currentPath = req.file.path;
  const pathWithExt = currentPath + '.webm';

  try {
    // Multer saves files without extensions. Groq relies on the filename extension to validate the file.
    // We must rename the file to include .webm before giving it to the Groq stream.
    fs.renameSync(currentPath, pathWithExt);
    currentPath = pathWithExt; // Ensure we delete the correct path later

    console.log(`Received audio file: ${req.file.originalname} (${req.file.size} bytes)`);
    console.log('Sending to Groq API...');

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(currentPath),
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
    });

    console.log('Transcription successful!');
    
    // Cleanup the temporary file
    fs.unlinkSync(currentPath);

    // Transform Groq response into our application's expected format
    const segments = (transcription.segments || []).map((seg, i) => ({
      speaker: 'Speaker', // Groq does not provide built-in diarization
      text: seg.text.trim(),
      start: seg.start,
      end: seg.end
    }));

    const reportData = {
      meetingId: 'Universal Capture',
      title: 'Transcribed Session',
      date: new Date().toISOString(),
      duration: transcription.duration ? `${Math.round(transcription.duration / 60)}m` : 'Unknown',
      participants: ['Speaker'],
      segments: segments,
      summary: transcription.text,
      actionItems: ['Review generated meeting transcription'],
      keyTopics: ['Raw Audio Session'],
      raw: transcription
    };

    // Auto-save a backup of the transcript locally to prevent data loss
    const path = require('path');
    const transcriptsDir = path.join(__dirname, 'transcripts');
    if (!fs.existsSync(transcriptsDir)) {
      fs.mkdirSync(transcriptsDir);
    }
    const backupFileName = path.join(transcriptsDir, `meeting_${Date.now()}.json`);
    fs.writeFileSync(backupFileName, JSON.stringify(reportData, null, 2));

    console.log(`Transcript backup saved to: ${backupFileName}`);

    res.json(reportData);
  } catch (error) {
    console.error("Transcription error:", error);
    if (fs.existsSync(currentPath)) {
      fs.unlinkSync(currentPath);
    }
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

// Hello world endpoint to check if server is running
app.get('/', (req, res) => {
  res.send('ZoomScribe API is running!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
