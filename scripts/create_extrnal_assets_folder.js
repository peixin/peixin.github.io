const fs = require("fs");
const path = require("path");

hexo.on("new", post => {
  folderName = path.parse(post.path).name;
  folderPath = path.resolve(
    path.join(__dirname, "../_assets/origin/assets", folderName)
  );

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.info(`create assets folder: ${folderPath}`);
  } else {
    console.info(`folder assets existed: ${folderPath}`);
  }
});
