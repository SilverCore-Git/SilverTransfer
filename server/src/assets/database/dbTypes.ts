
export interface Transfert {
    UUID: string;       // two first part of an uuid (others parts are the passwd)
    cryptedFileName: string; // foalder name
    tempFileName: string;
    size: number; // size on o
    senderIp: string;
    date: string; // date - time 
    status: 'ready_to_download' | 'ready_to_decrypt' | 'await_crypting' | 'expired';
}