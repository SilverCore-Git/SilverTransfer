export default (req: any): string => {
    return (
        req.headers['x-forwarded-for']?.toString().split(',')[0] || 
        req.connection?.remoteAddress || 
        req.socket?.remoteAddress || 
        req.ip || 
        '0.0.0.0'
    );
};
