// get date "YYYY-MM-DD"
const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
};

// get time "HH:MM:SS"
const getCurrentTime = () => {
    return new Date().toLocaleTimeString("fr-FR", { hour12: false });
};


export {
    getCurrentDate,
    getCurrentTime
}