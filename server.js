/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

console.log('Démarrage du serveur...');

// Importation des bibliothèques
const express = require("express");
const multer = require("multer");
const fs = require("fs");
// const https = require("https");
const http = require("http");
const cors = require("cors");
const path = require("path");
const ejs = require("ejs");
const crypto = require("crypto");
const formatFileSize = require('./src/filesize.js')




// const maintenance = require("../www.api/SilverConfig/maintenance.json");

const config = require('./config/config.json');

const { encryptFile, decryptFile, encryptText, decryptText } = require("./src/crypt.js");
const { loadDatabase, saveDatabase, deleteFiledb, resetDatabase, deleteDatabaseFile, createDatabaseFile } = require('./src/database.js');
const { logToFile, originalConsoleError, originalConsoleLog, originalConsoleWarn } = require('./src/logger.js');
const { getCurrentDate, getCurrentTime } = require('./src/datemanager.js')
const { removeExpirFile } = require("./src/removeData.js");


async function resetDB() {

    if (config.resetDB) {

        await resetDatabase(); 

        const { setTimeout } = require('timers/promises');
        await setTimeout(1000);

    };

}
resetDB()

 
let fileDatabase = {};
fileDatabase = loadDatabase();

setInterval(() => {
    fileDatabase = loadDatabase();
}, 5000)

// initialisation de la suprésion des fichier expirer
// setInterval(() => { removeExpirFile() }, 3600000); // marche pas, fait crach remplacer dans la fin de la root /data


// SSL key & cert path
// const options = {
//     key: fs.readFileSync(config.SSLkeyPath, "utf8"),
//     cert: fs.readFileSync(config.SSLcertPath, "utf8"),
// };

const corsOptions = {
    origin: ["https://transfer.silverdium.fr", "https://t.silverdium.fr"],
    allowedHeaders: ["Content-Type"],
    methods: ["GET", "POST", "PUT", "DELETE"],
};


const app = express();
console.log("Démarrage de Express...");

app.use(cors(corsOptions));
app.use(express.json());
app.set("view engine", "ejs");

app.use((req, res, next) => {
 
    if (req.hostname !== config.hostname && req.path === "/") {
        res.set("X-Robots-Tag", "noindex, nofollow");
        return res.send(`
            <h1>Tu utilises le mauvais nom de domaine, le bon est :</h1>
            <br>
            <a href="https://transfer.silverdium.fr">
                <button><h2>https://transfer.silverdium.fr</h2></button>
            </a>
        `);
    }

    next(); 

});


app.use(express.static("public"));


console.log("Express chargé");


const uploadDir = path.join(__dirname, config.TEMPdir);
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Répertoire "',config.TEMPdir,'" créé');
}
if (!fs.existsSync(path.join(__dirname, config.DATAdir))) {
    fs.mkdirSync(path.join(__dirname, config.DATAdir));
    console.log('Répertoire "',config.DATAdir,'" créé');
}

// Configuration de Multer pour stocker les fichiers sur disque
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const encryptedText = encryptText(file.originalname);
        const fileExt = path.extname(file.originalname);
        const newFileName = `${encryptedText}${fileExt}`;
        cb(null, newFileName);
    },
});

const upload = multer({ storage });


// route fontend
app.get("/sitemap.xml", (req, res) => {
    res.sendFile(path.join(__dirname, 'sitemap.xml'))
})
app.get("/robots.txt", (req, res) => {
    res.sendFile(path.join(__dirname, 'robots.txt'))
})
app.get('/assets/img/background/background2', (req, res) => {
    res.sendFile(path.join( __dirname, 'public/assets/img/background/background2.jpg' ))
})
app.get('/assets/img/background/background1', (req, res) => {
    res.sendFile(path.join( __dirname, 'public/assets/img/background/background1.jpg' ))
})



// Route pour l'upload de fichier
app.post(config.pushfilepath, upload.single("file"), async (req, res) => {
    console.log("____Réception d'une requête : ", `' ${config.pushfilepath} '`);

    if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
    }

    if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    let randomNumber = Math.floor(Math.random() * 100000000);
    randomNumber = randomNumber.toString().padStart(8, '0');

    const fileID = randomNumber;
    const tempFilePath = req.file.path;  // Chemin du fichier temporaire sauvegardé par Multer
    const encryptedFileName = `${fileID}.${req.file.filename}.enc`;
    const encryptedFilePath = path.join(__dirname, config.DATAdir, encryptedFileName);

    res.json({
        status: "processing",
        message: "Fichier reçu, chiffrement en cours...",
        id: fileID
    });

    console.log('Fichier reçu, chiffrement en cours...');

    try {

        await encryptFile(tempFilePath, encryptedFilePath);

        fileDatabase[fileID] = {
            fileName: encryptedFileName,
            size: req.file.size,
            date: `${getCurrentDate()} - ${getCurrentTime()}` 
        };
        await saveDatabase(fileDatabase);

        console.log('✅✅__Fichier enregistré ! ', `?id=${fileID}`);
    } catch (err) { 
        console.error("Erreur lors du chiffrement :", err);
    }
});





// Route pour afficher le bouton de téléchargement
app.get("/t/:id", async (req, res) => {
    console.log("____Réception d'une requête : ", `'/t/${req.params.id}'`);
    const fileID = req.params.id;

        //assets
        if (fileID == 'assets') {
            const fileName = req.query.file
            const ext = req.query.ext
            res.sendFile(path.join(__dirname, 'views', 'assets', ext, `${fileName}.${ext}`))
            return
        }

        // dev access
        const dev = req.query.dev

        if (dev === 'true') {

            console.warn('⚠️ </> Acces développeur ! id?=',fileID)

            const type = req.query.type
            const err = req.query.err

            if (type === 'err') {

                if (err === '500') {

                }
                else if (err === '404') {
                    await res.status(404).render("fatherfile", { error: "ID non trouver !", describ: "ID de fichier non trouver..." });
                    return
                }

            } else {

                await res.render("download", { fileName: 'fileName', fileID: 'fileID', fileSize: 'fSize' });
                return

            }

        }

    
    const fileEntry = fileDatabase[fileID];

    if (!fileEntry) {
        return res.status(404).render("errfile", { status: "ID de fichier non trouver..." });
    }

    const fSize = await formatFileSize(fileEntry.size);
    
    const fileName = fileEntry.fileName.split('.')[1];
    const decryptedFileName = decryptText(fileName);


    res.render("download", { fileName: decryptedFileName, fileID: fileID, fileSize: fSize });
});


app.get('/data/view', (req, res) => {
    res.render("data", { id: req.query.id })
})
app.get('/data/end', (req, res) => {
    res.render("end", {})
})
app.get('/data/status', (req, res) => {
    const id = req.query.id
    if (id) {
        
        const fileEntry = fileDatabase[id];
        if (!fileEntry) {
            res.json({
                data: 'end'
            })
        } else {
            res.json({
                data: 'processing'
            })
        }
    }
})

app.get('/data/close', (req, res) => {
    res.write(`
        <!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fermeture de l'onglet</title>
    <script>
        function closeTab() {
            window.close();  // Tente de fermer l'onglet
        }

        window.onload = function() {
            setTimeout(() => {
                closeTab();
            }, 1000); // Essaye de fermer l'onglet après 1 seconde

            setTimeout(() => {
                document.getElementById("manual-close").style.display = "block"; // Affiche un bouton si la fermeture automatique échoue
            }, 1500);
        };
    </script>
    <style>
        body {
            text-align: center;
            font-family: Arial, sans-serif;
            margin-top: 50px;
        }
        button {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            background-color: red;
            color: white;
            border: none;
            border-radius: 5px;
            display: none;
        }
    </style>
</head>
<body>

    <h1>👋 Fermeture de l'onglet...</h1>
    <p>Si l'onglet ne se ferme pas automatiquement, cliquez sur le bouton ci-dessous.</p>

    <button id="manual-close" onclick="closeTab()">Fermer l'onglet</button>

</body>
</html>
`)
})

// ➤ **Route principale** : Déchiffrement et téléchargement du fichier
app.get("/data/:filename", async (req, res) => {
    console.log("📥 Requête reçue : /data/", req.params.filename);
    const fileID = req.params.filename;

    // Gestion accès développeur
    const dev = req.query.dev;
    const err = req.query.err;
    if (dev === "true") {
        console.warn("⚠️ Accès développeur ! ID =", fileID);

        if (err === "404") {
            return res.status(404).render("errfile", { status: "Erreur 404" });
        } else if (err === "end") {
            return res.status(200).render("end");
        }

        return res.status(200).render("data", { status: "Statut inconnu" });
    }
    
    const fileDB = fileDatabase[fileID];
    if (!fileDB) {
        return res.status(404).json({ error: "Fichier non trouvé" });
    }

    const fileName = fileDB.fileName.split(".")[1];
    const decryptedFileName = decryptText(fileName);
    const encryptedFilePath = path.join(__dirname, "data", fileDB.fileName);
    const decryptedFilePath = path.join(__dirname, "temp", decryptedFileName);

    if (!fs.existsSync(encryptedFilePath)) {
        return res.status(404).json({ error: "Fichier chiffré non trouvé" });
    }

    console.log("🔓 Déchiffrement...");



    await decryptFile(encryptedFilePath, decryptedFilePath);


    
    res.setHeader("Content-Disposition", `attachment; filename=${decryptedFileName}`);

    try {
        await new Promise((resolve, reject) => {

            res.sendFile(decryptedFilePath, (err) => {
                if (err) {
                    console.error("❌ Erreur d'envoi :", err);
                    reject({ status: 500, error: "Erreur d'envoi", detail: err });
                } else {
                    console.log("✅ Fichier envoyé !");
                    resolve();
                }
            });

        });

        // Supprime le fichier temporaire après l'envoi
        await fs.promises.unlink(decryptedFilePath);
        console.log("🗑️ Fichier temporaire supprimé !");
        await fs.promises.rm(encryptedFilePath, { recursive: true, force: true });
        console.log("🗑️ Fichier local supprimé !");
        await deleteFiledb(fileID);



    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.error, detail: error.detail });
    }
});



// Générer une clé
app.get("/key/:bytes", (req, res) => {
    console.log("____Réception d'une requête : ", `'/key/${req.params.bytes}'`)
    const bytes = parseInt(req.params.bytes, 10);

    let statu;
    let message;
    let key = "none";

    if (isNaN(bytes)) { 
        statu = "ERROR";
        message = "Erreur lors de la création de la clé : bytes is not a number !";
        console.log(`Annulation d'une requête : ${statu} => ${message}`);
        res.json({ "status": statu, "message": message, "key": key, "bytes": bytes });
        return;
     }

    if (bytes >= config.maxbyteforkey) {
        statu = "ERROR";
        message = "Erreur lors de la création de la clé : bytes is too big !";
        console.log(`Annulation d'une requête : ${statu} => ${message}`);
    } else {
        statu = "OK";
        message = "Clé envoyée avec succès";
        key = crypto.randomBytes(bytes).toString("hex");
        console.log('Nouvelle clé créée : ', bytes, 'bytes');
        console.log(`Envoi de la clé type res.json : "{ "status": ${statu}, "message": ${message}, "key": ForSecureDontShow, "bytes": ${bytes} }"`);
    }
    
    res.json({ "status": statu, "message": message, "key": key, "bytes": bytes });
});



app.use((req, res) => {
    res.status(404).redirect('https://api.silverdium.fr/www.errors/404.html');
});



const PORT = config.Port;
http.createServer(app).listen(PORT, () => {
    console.log(`Serveur HTTPS en ligne sur https://transfer.silverdium.fr:${PORT}`);
});


