type UploadOptions = {
    file: File | null;
    url: string;
    onProgress?: (percent: number, estimatedTime?: string) => void;
    onSuccess?: (response: any) => void;
    onError?: (message: string, error?: any) => void;
};

function send ({
    file,
    url,
    onProgress,
    onSuccess,
    onError,
}: UploadOptions): void {

    if (!file) {
        onError?.("Aucun fichier sélectionné.");
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    xhr.responseType = "json";

    let startTime: number | null = null;

    xhr.upload.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);

            if (!startTime) {
                startTime = Date.now();
            }

            let estimatedTime: string | undefined;
            if (startTime) {
                const elapsed = (Date.now() - startTime) / 1000;
                const speed = event.loaded / elapsed;
                const remaining = event.total - event.loaded;
                const secondsLeft = remaining / speed;
                const minutes = Math.floor(secondsLeft / 60);
                const seconds = Math.floor(secondsLeft % 60);
                estimatedTime = `${minutes}m ${seconds}s`;
            }

            onProgress?.(percent, estimatedTime);
        }
    };

    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            onSuccess?.(xhr.response);
        } else {
            const msg = `Erreur serveur : ${xhr.status} - ${xhr.statusText}`;
            onError?.(msg, xhr.response);
        }
    };

    xhr.onerror = (event) => {
        onError?.("Erreur réseau pendant l'envoi du fichier.", event);
    };

    try {
        xhr.open("POST", url, true);
        xhr.send(formData);
    } catch (err) {
        onError?.("Erreur lors de l'ouverture ou de l'envoi de la requête.", err);
    }
}


export default send;