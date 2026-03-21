import { API_URL } from "./socketClient";

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : "";
      if (!base64) {
        reject(new Error("Failed to encode audio chunk."));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read audio chunk."));
    reader.readAsDataURL(blob);
  });

// Wraps XHR in a Promise so Electron's renderer process sends a proper Content-Length
// header automatically. Native fetch() in Electron uses chunked transfer for large bodies
// which triggers ERR_FAILED (-2) in Chromium's chunked_data_pipe_upload_data_stream.
const xhrPost = (url, body) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = "text";
    xhr.onload = () => resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, body: xhr.responseText });
    xhr.onerror = () => reject(new Error("Network request failed."));
    xhr.send(body);
  });

export const transcribeAudioBlob = async ({ audioBlob, langHint }) => {
  const audioBase64 = await blobToBase64(audioBlob);

  const body = JSON.stringify({
    audioBase64,
    mimeType: audioBlob.type || "audio/webm",
    langHint,
  });

  const { ok, status, body: responseText } = await xhrPost(`${API_URL}/speech/transcribe`, body);

  let data = null;
  try { data = JSON.parse(responseText); } catch { /* non-JSON body */ }

  const response = { ok, status };

  if (!response.ok) {
    throw new Error(data?.message || responseText || `Transcription failed with status ${response.status}.`);
  }

  return {
    text: String(data?.text || "").trim(),
    provider: String(data?.provider || "whisper-api"),
  };
};

export const fetchSpeechConfig = async () => {
  const response = await fetch(`${API_URL}/speech/config`);
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok || !data) {
    return {
      provider: "whisper-api",
      configured: false,
      hasAuthToken: false,
      fileField: "file",
    };
  }

  return {
    provider: String(data.provider || "whisper-api"),
    configured: Boolean(data.configured),
    hasAuthToken: Boolean(data.hasAuthToken),
    fileField: String(data.fileField || "file"),
  };
};
