
export interface Transfert {
    UUID: string;       // two first part of an uuid (others parts are the passwd)
    cryptedFileName: string; // foalder name
    tempFileName: string;
    size: number; // size on o
    senderIp: string;
    date: string; // date - time 
    status: 'ready' | 'await_crypting' | 'expired';
}