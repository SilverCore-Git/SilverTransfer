import transferBackup from "./transferBackup/transferBackup";
import transferChecker from "./transferChecker/transferChecker";

// all jobs func
export default () => {

    console.log('Run jobs');
    
    transferChecker();
    
    transferBackup.run();

}