#!/usr/bin/env node

const piexif = require("piexifjs");
const fs = require("fs");
const path = require("path");
const convert = require("heic-convert");
const jimp = require("jimp");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");

const getFileNameInfo = (filePath) => {
  const dirName = path.dirname(filePath);
  const fileName = path.basename(filePath);
  const extName = path.extname(fileName);
  const prefixName = fileName.substr(0, fileName.length - extName.length);
  return { dirName, prefixName, extName };
};

const convertHEIC2JPEG = async (filePath) => {
  const { dirName, prefixName, extName } = getFileNameInfo(filePath);
  if (extName.toLowerCase() !== ".heic") {
    return filePath;
  }
  const targetPath = path.join(dirName, `${prefixName}.jpg`);

  const heicData = fs.readFileSync(filePath);
  const outputBuffer = await convert({
    buffer: heicData,
    format: "JPEG",
    quality: 0.7,
  });

  fs.writeFileSync(targetPath, outputBuffer);
  return targetPath;
};

const removeExifData = (filePath) => {
  const { extName } = getFileNameInfo(filePath);
  console.log(extName);
  if (![".jpg", ".jpeg", ".png"].includes(extName.toLowerCase())) {
    return;
  }
  console.log(extName);
  const jpegData = fs.readFileSync(filePath);
  const data = jpegData.toString("binary");
  const removedExifData = piexif.remove(data);
  const newJpegData = Buffer.from(removedExifData, "binary");

  fs.writeFileSync(filePath, newJpegData);
};

const blur = async (filePath) => {
  const image = await jimp.read(filePath);
  await image.blur(10).quality(60);
  await image.writeAsync(filePath);
  return filePath;
};

const compress = async (filePath) => {
  const { dirName } = getFileNameInfo(filePath);

  return await imagemin([filePath], {
    destination: dirName,
    plugins: [
      imageminJpegtran({ progressive: true }),
      imageminPngquant({ quality: [0.6, 0.8] }),
    ],
  });
};

const processFunc = async (_filePath) => {
  const filePath = await convertHEIC2JPEG(_filePath);
  console.log(filePath);
  await blur(filePath);
  await compress(filePath);
  removeExifData(filePath);
  console.log(`${_filePath} ===> ${filePath}`);
};

const main = () => {
  console.log(process.argv);
  if (process.argv.length < 3) {
    return;
  }

  const filePaths = process.argv.slice(2);

  filePaths.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      processFunc(path.resolve(filePath));
    }
  });
};
console.log("xxx")
main();
