#!/usr/bin/env node

const imagemin = require("imagemin");
const glob = require("glob");
// const imageminJpegtran = require("imagemin-jpegtran");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminOptipng = require("imagemin-optipng");
const imageminGifsicle = require("imagemin-gifsicle");
const imageminSvgo = require("imagemin-svgo");
const shelljs = require("shelljs");
const fs = require("fs");
const path = require("path");
const hasha = require("hasha");

const ROOT_DIR = path.resolve(__dirname);
const INPUT_PATH = "_assets/original/";
const INPUT_IMG = path.join(INPUT_PATH, "**/*.+(jpg|jpeg|png|gif)");
const INPUT_SVG = path.join(INPUT_PATH, "**/*.svg");
const OUTPUT = "_assets/compressed/";
const UPLOAD_LOG_FILE_PATH = path.join(
  ROOT_DIR,
  INPUT_PATH,
  ".compressed.log.json"
);

const saveCompressedFiles = (dirPath, originalFiles, imagesBuffer) => {
  if (!originalFiles.length) {
    return;
  }
  if (originalFiles.length !== imagesBuffer.length) {
    throw Error(
      `originalFiles.length:${originalFiles.length} !== imagesBuffer.length: ${imagesBuffer.length}`
    );
  }
  const dirPathLength = dirPath.length + 1 + INPUT_PATH.length;
  const distFiles = [];
  originalFiles.forEach((filePath, index) => {
    const outputPath = path.join(
      ROOT_DIR,
      OUTPUT,
      filePath.substr(dirPathLength)
    );
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }
    distFiles.push(outputPath);
    fs.writeFileSync(outputPath, imagesBuffer[index].data, {
      encoding: null,
      mode: 0o644,
      flag: "w"
    });
  });
  return distFiles;
};

const filterFiles = async originalFiles => {
  let upload_files_json = {};
  if (fs.existsSync(UPLOAD_LOG_FILE_PATH)) {
    upload_files_json = JSON.parse(
      fs.readFileSync(UPLOAD_LOG_FILE_PATH, {
        encoding: "utf8"
      })
    );
  }

  let newOrUpdatedFiles = [];
  for (let file of originalFiles) {
    let exitsHash = upload_files_json[file];
    if (!exitsHash) {
      newOrUpdatedFiles.push(file);
      continue;
    }
    const hash = await hasha.fromFile(file, { algorithm: "md5" });

    if (exitsHash !== hash) {
      newOrUpdatedFiles.push(file);
    }
  }
  return newOrUpdatedFiles;
};

const saveCompressedFilesLog = async originalFiles => {
  const allHash = await Promise.all(
    originalFiles.map(file => hasha.fromFile(file, { algorithm: "md5" }))
  );
  let jsonObj = {};
  originalFiles.forEach((file, index) => {
    jsonObj[file] = allHash[index];
  });

  let upload_files_json = {};
  if (fs.existsSync(UPLOAD_LOG_FILE_PATH)) {
    upload_files_json = JSON.parse(
      fs.readFileSync(UPLOAD_LOG_FILE_PATH, {
        encoding: "utf8"
      })
    );
  }

  upload_files_json = { ...upload_files_json, ...jsonObj };

  var jsonContent = JSON.stringify(upload_files_json);
  fs.writeFileSync(UPLOAD_LOG_FILE_PATH, jsonContent);
  return upload_files_json;
};

const optimiseSvgs = async dirPath => {
  let originalFiles = glob.sync(path.join(dirPath, INPUT_SVG));
  if (!originalFiles.length) {
    return originalFiles.length;
  }
  originalFiles = await filterFiles(originalFiles);
  if (!originalFiles.length) {
    return originalFiles.length;
  }
  const imagesBuffer = await imagemin(originalFiles, {
    glob: false,
    plugins: [
      imageminSvgo({
        plugins: [
          {
            removeViewBox: false,
            removeTitle: true,
            removeDesc: true
          }
        ]
      })
    ]
  });
  saveCompressedFiles(dirPath, originalFiles, imagesBuffer);
  saveCompressedFilesLog(originalFiles);
  return originalFiles.length;
};

const optimiseImages = async dirPath => {
  let originalFiles = glob.sync(path.join(dirPath, INPUT_IMG));
  if (!originalFiles.length) {
    return originalFiles.length;
  }
  originalFiles = await filterFiles(originalFiles);
  if (!originalFiles.length) {
    return originalFiles.length;
  }
  const imagesBuffer = await imagemin(originalFiles, {
    glob: false,
    plugins: [
      imageminMozjpeg({
        progressive: true,
        quality: 70
      }),
      imageminOptipng({
        optimizationLevel: 3
      }),
      imageminGifsicle({
        interlaced: true,
        optimizationLevel: 3
      })
    ]
  });
  saveCompressedFiles(dirPath, originalFiles, imagesBuffer);
  saveCompressedFilesLog(originalFiles);
  return originalFiles.length;
};

const compress = async (dirPath) => {
  try {
    let countImages = await optimiseImages(dirPath);
    console.log(`compress images down, count: ${countImages}!`);
    let countSvgs = await optimiseSvgs(dirPath);
    console.log(`compress svgs down, count: ${countSvgs}!`);
  } catch (error) {
    console.log(error);
  }
  console.log("compress down!");
};

const main = async dirPath => {
  await compress(dirPath);
  shelljs.exec(`qshell qupload --overwrite-list upload_overwrite.txt _assets/compressed/upload.json`);
  console.log("sync compressed OK.")
  shelljs.exec(`qshell cdnrefresh -i upload_overwrite.txt`);
  console.log("sync refresh CDN OK.")
  shelljs.exec(`qshell qupload _assets/original/upload.json`);
  console.log("sync original OK.")
  console.log("all down!")
};

if (require.main === module) {
  main(ROOT_DIR);
}
