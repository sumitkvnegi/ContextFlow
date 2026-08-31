import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import OpenAI from "openai";
import { nodewhisper } from "nodejs-whisper";
import {
  TRANSCRIPTION_CONSTANTS,
  UPLOAD_CONSTANTS,
} from "../config/constants.js";
import logger from "../config/logger.js";

const { METHOD, WHISPER_MODEL, OPENAI_MODEL, LANGUAGE } =
  TRANSCRIPTION_CONSTANTS;

const documentsDir = UPLOAD_CONSTANTS.DOCUMENTS_DIR;
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

const openai =
  METHOD === "openai"
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

/**
 * Convert an audio/video file to a mono 16 kHz WAV that Whisper expects.
 * A real (seekable) input file is required because FFmpeg needs to seek
 * within container formats like MP4 to decode them.
 */
function normalizeAudio(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("wav")
      .audioChannels(1)
      .audioFrequency(16000)
      .audioCodec("pcm_s16le")
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
}

async function transcribeWithOpenAI(audioPath) {
  if (!openai) {
    throw new Error(
      "OpenAI client not initialized. Set TRANSCRIPTION_METHOD=openai and OPENAI_API_KEY.",
    );
  }
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: OPENAI_MODEL,
    language: LANGUAGE,
  });
  return transcription.text;
}

async function transcribeLocally(audioPath) {
  const absoluteAudioPath = path.resolve(audioPath);
  const transcript = await nodewhisper(absoluteAudioPath, {
    modelName: WHISPER_MODEL,
    autoDownloadModelName: WHISPER_MODEL,
    withCuda: false,
    whisperOptions: {
      outputInText: false,
      outputInVtt: false,
      outputInSrt: false,
      outputInCsv: false,
      outputInJson: false,
      translateToEnglish: false,
      language: LANGUAGE,
      wordTimestamps: false,
      splitOnWord: false,
    },
  });
  return transcript;
}

/**
 * Transcribe an uploaded audio/video buffer into plain text.
 *
 * @param {Buffer} buffer - raw uploaded media bytes
 * @param {string} originalname - original filename (used for extension/temp name)
 * @returns {Promise<string>} - the transcript text
 */
export async function transcribeMedia(buffer, originalname) {
  const timestamp = Date.now();
  const sanitized = path.parse(originalname).name.replace(/[^a-zA-Z0-9]/g, "_");

  const inputExt = path.extname(originalname) || ".tmp";
  const inputPath = path.join(
    documentsDir,
    `${timestamp}_${sanitized}_input${inputExt}`,
  );
  const wavPath = path.join(documentsDir, `${timestamp}_${sanitized}.wav`);

  try {
    fs.writeFileSync(inputPath, buffer);
    await normalizeAudio(inputPath, wavPath);

    logger.info({ originalname, method: METHOD }, "Transcribing media");
    const text =
      METHOD === "openai"
        ? await transcribeWithOpenAI(wavPath)
        : await transcribeLocally(wavPath);

    return (text || "").trim();
  } finally {
    // Only keep the transcript text (returned to caller) — clean temp files.
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
  }
}
