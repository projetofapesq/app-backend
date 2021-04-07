require('dotenv').config();

//Imports de bibliotecas
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

//Maneiras de alocagem da imagem local ou web
const storageTypes = {
    local: multer.diskStorage({
        destination: (req, file, cb) =>{
            cb(null, path.resolve(__dirname,"..", "images"));
        },
        filename: (req, file, cb) =>{
            crypto.randomBytes(16, (err, hash) =>{
                if(err) cb(err);
    
                file.key = `${hash.toString("hex")}-${file.originalname}`;
    
                cb(null, file.key);
            })
        }
    })
}

//Maneira de exporta essas informações para todo o projeto
module.exports = {
    dest: path.resolve(__dirname, "images"),
    storage: storageTypes['local'],
    limits: {
      fileSize: 4 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        "image/jpeg",
        "image/pjpeg",
        "image/png",
        "image/gif"
      ];
  
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Tipo de arquivo invalido."));
      }
    }
  };

