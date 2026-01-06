import files from "./Files";

interface UploadCallbacks {
  onProgress?: (progress: number) => void;
  onComplete?: (response: UploadResponse) => void;
  onError?: (error: UploadError) => void;
}

interface UploadResponse {
  status: string;
  message: string;
  id: string;
  downloadPath: string;
}

interface UploadError {
  message: string;
  status?: number;
}

export default function sendFiles(
  id: string,
  passwd: string,
  callbacks?: UploadCallbacks
): Promise<UploadResponse | null> {
  return new Promise((resolve, reject) => {
    try {
      if (!files.value || files.value.length === 0) {
        const error: UploadError = { message: "Aucun fichier sélectionné" };
        callbacks?.onError?.(error);
        reject(error);
        return;
      }

      // Process first file only
      const file = files.value[0];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("id", id);
      formData.append("passwd", passwd);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const fileProgress = (event.loaded / event.total) * 100;
          callbacks?.onProgress?.(Math.round(fileProgress));
        }
      });

      // Handle successful upload
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response: UploadResponse = JSON.parse(xhr.responseText);
          callbacks?.onProgress?.(100);
          callbacks?.onComplete?.(response);
          resolve(response);
        } else {
          const error: UploadError = {
            message: "Erreur lors du téléversement",
            status: xhr.status,
          };
          callbacks?.onError?.(error);
          reject(error);
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        const error: UploadError = {
          message: "Erreur réseau lors du téléversement",
          status: xhr.status,
        };
        callbacks?.onError?.(error);
        reject(error);
      });

      // Handle abort
      xhr.addEventListener("abort", () => {
        const error: UploadError = {
          message: "Téléversement annulé",
        };
        callbacks?.onError?.(error);
        reject(error);
      });

      // Send POST request with file and body { id, passwd }
      xhr.open("POST", "http://localhost:84/upload/file");
      xhr.send(formData);
    } catch (err) {
      const error: UploadError = {
        message: err instanceof Error ? err.message : "Erreur inconnue",
      };
      callbacks?.onError?.(error);
      reject(error);
    }
  });
}