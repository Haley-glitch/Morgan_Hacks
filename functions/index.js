const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const { Storage }       = require('@google-cloud/storage');
const speech            = require('@google-cloud/speech').v1p1beta1;
const { TextServiceClient } = require('@google-ai/generativelanguage');
const ffmpeg            = require('fluent-ffmpeg');
const ffmpegPath        = require('ffmpeg-static');
const fs                = require('fs');
const os                = require('os');
const path              = require('path');

admin.initializeApp();
const db            = admin.firestore();
const storageClient = new Storage();
const speechClient  = new speech.SpeechClient();
const genaiClient   = new TextServiceClient();

// point fluent-ffmpeg at the static binary
ffmpeg.setFfmpegPath(ffmpegPath);

exports.processVideoJob = functions
  .region('us-central1')
  .firestore
  .document('videoJobs/{jobId}')
  .onCreate(async (snap, context) => {
    const jobId = context.params.jobId;
    const data  = snap.data();
    const videoURL = data.videoURL;

    // 1) download the video to /tmp
    const tmpVideoPath = path.join(os.tmpdir(), `${jobId}.mp4`);
    // assume the URL is gs://…
    const { bucket: bucketName, name: srcPath } =
      storageClient.bucket().fileFromGsUri(videoURL);
    await storageClient.bucket(bucketName)
                       .file(srcPath)
                       .download({ destination: tmpVideoPath });

    // 2) extract WAV audio
    const tmpAudioPath = path.join(os.tmpdir(), `${jobId}.wav`);
    await new Promise((resolve, reject) => {
      ffmpeg(tmpVideoPath)
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .format('wav')
        .save(tmpAudioPath)
        .on('end', resolve)
        .on('error', reject);
    });

    // 3) transcribe
    const audioBytes = fs.readFileSync(tmpAudioPath).toString('base64');
    const [sttResp]  = await speechClient.recognize({
      audio: { content: audioBytes },
      config: {
        encoding:       'LINEAR16',
        sampleRateHertz: 16000,
        languageCode:   'en-US'
      }
    });
    const transcript = sttResp.results
      .map(r => r.alternatives[0].transcript)
      .join(' ');

    // 4) summarize via Gemini
    await db.doc(`videoJobs/${jobId}`)
            .update({ status: 'processing' });
    const [genResp] = await genaiClient.generateText({
      model:  `projects/${process.env.GCLOUD_PROJECT}/locations/global/models/gemini-2.0-flash`,
      prompt: {
        text: `
Given this transcript, 
1) Write a 2–3 sentence summary prefixed "Summary:"
2) Then bullet-point the key ideas under "Notes:"

Transcript:
"""${transcript}"""
`
      }
    });
    const raw = genResp.candidates[0].output.content;
    const lines = raw.split('\n').filter(l => l.trim());
    const summaryLine = lines.find(l => /^Summary[:\-]/i.test(l))?.replace(/^Summary[:\-]\s*/i,'') || '';
    const noteLines   = lines.filter(l => /^[-•]/.test(l)).map(l => l.replace(/^[-•]\s*/,''));

    // 5) write back to Firestore
    await db.doc(`videoJobs/${jobId}`)
            .update({
              status:  'done',
              summary: summaryLine,
              notes:   noteLines
            });
  });
