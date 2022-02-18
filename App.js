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
              fs.readFile(filePath, "utf8", (err, data) => {
                if (err) eachCallback(err);
                let newData = data.replace(
                  /"name"\:\s".{0,300}"/g,
                  '"name": "Arthur"'
                );

                fs.writeFile(filePath, newData, (err) => {
                  if (err) eachCallback(err);
                  else {
                    const isChanged =
                      JSON.stringify(data) === JSON.stringify(newData);
                    !isChanged &&
                      console.log(
                        `The file ${filePath} has been changed successfully.`
                      );
                  }
                });
              });
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

getFiles("./", function () {});
