import { Router } from "express";

const router = Router();


// Route pour afficher le bouton de téléchargement
router.get("/t/:id/:passwd", async (req, res) => {

    if (req.hostname === config.hostname) {

        console.log("📥 Réception d'une requête : ", `'/t/${req.params.id}'`);

        const fileID = req.params.id;
        const passwd = req.params.passwd;

            //assets
            if (passwd == 'assets') {
                const fileName = String(req.query.file);
                const ext = String(req.query.ext);
                res.sendFile(path.join(__dirname, 'views', 'assets', ext, `${fileName}.${ext}`));
                return
            }

            // dev access
            const dev = req.query.dev

            if (dev === 'true') {

                console.warn('⚠️ </> Acces développeur ! ?id=',fileID)

                const type = req.query.type
                const err = req.query.err

                if (type === 'err') {

                    if (err === '500') {

                    }

                } else {
                    return await res.render("download", { fileName: 'fileName', fileID: 'fileID', fileSize: 'fSize', passwd: 'e', fileExpir: config.expiretime || 30, version: 'version', v: pkg.version });
                }

            }

        
        const fileEntry = fileDatabase[fileID];

        if (!fileEntry) {
            return res.status(404).render("errfile", { status: "ID de fichier non trouver...", v: pkg.version });
        }

        const fSize = await formatFileSize(fileEntry.size);
        
        const fileName = fileEntry.fileName.split('.')[1];
        const decryptedFileName = decryptText(fileName);

        const input = fileEntry.date;
        const parsedDate = new Date(input.replace(" - ", "T"));
        
        const now = new Date();
        const fifteenDaysLater = new Date(parsedDate.getTime() + (Number(fileEntry.premium_data.expire_day) || config.expiretime || 30) * 24 * 60 * 60 * 1000);
        
        const diffMs = fifteenDaysLater - now;
        
        if (diffMs <= 0) {
          return res.status(410).render("errfile", { status: "Le fichier a expiré !", v: pkg.version });
        } else {
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
          res.status(200).render("download", { fileName: decryptedFileName, passwd: passwd,  fileExpir: diffDays, fileID: fileID, fileSize: fSize, v: pkg.version });

        }

    }

});


export default router;