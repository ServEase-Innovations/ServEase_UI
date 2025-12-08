const fs = require("fs");
const path = require("path");

const targetRoot = path.join(__dirname, "src", "components");

function generateIndexFile(dirPath) {
  const files = fs.readdirSync(dirPath);
  const exportLines = [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      generateIndexFile(fullPath); // Recursively process subdirectories
    } else if (
      stats.isFile() &&
      (file.endsWith(".ts") || file.endsWith(".tsx")) &&
      file !== "index.ts"
    ) {
      const fileNameWithoutExt = file.replace(/\.[^.]+$/, "");
      exportLines.push(`export * from './${fileNameWithoutExt}';`);
    }
  }

  if (exportLines.length > 0) {
    const indexPath = path.join(dirPath, "index.ts");
    fs.writeFileSync(indexPath, exportLines.join("\n") + "\n", "utf8");
    console.log(`✅ Created index.ts in ${dirPath}`);
  }
}

generateIndexFile(targetRoot);
