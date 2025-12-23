import crypto from 'crypto';


class text_crypter
{

    private algo: string;
    private cryptKey: string;

    constructor()
    {
        this.algo = 'AES-256-ECB';
        this.cryptKey = process.env.TEXT_SECRET_KEY || '!!'
    }

    public encrypt (text: string)
    {
        const cipher = crypto.createCipheriv(this.algo, this.cryptKey, null); 
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    public decrypt (encryptedText: string)
    {
        const decipher = crypto.createDecipheriv(this.algo, this.cryptKey, null); 
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

}



export default new text_crypter();