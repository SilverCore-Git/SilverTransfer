
export interface Chunk {
    index: number;
    start: number;
    iv: string;
}

export interface Layout {
    chunks: Chunk[];
    originalFileHash: string;
    aesKey: string;
}