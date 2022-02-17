const path = require("path");
const fs = require("fs");
const async = require("async");

function getFiles(dirPath, callback) {
  fs.readdir(dirPath, function (err, files) {
    if (err) return callback(err);

    let filePaths = [];

    async.eachSeries(
      files,
      function (fileName, eachCallback) {
        let filePath = path.join(dirPath, fileName);

        fs.stat(filePath, function (err, stat) {
          if (err) return eachCallback(err);

          if (stat.isDirectory()) {
            getFiles(filePath, function (err, subDirFiles) {
              if (err) return eachCallback(err);

              filePaths = filePaths.concat(subDirFiles);
              eachCallback(null);
            });
          } else {
            if (stat.isFile() && /\.json$/.test(filePath)) {
              fs.rename(
                filePath,
                filePath.replace(/\.json$/, "_developer’s-name.json"),
                (err) => {
                  if (err) throw err;
                }
              );

              filePaths.push(
                filePath.replace(/\.json$/, "_developer’s-name.json")
              );
            }

            eachCallback(null);
          }
        });
      },
      function (err) {
        callback(err, filePaths);
      }
    );
  });
}

getFiles("./", function (err, files) {
  console.table(err || files);
});
