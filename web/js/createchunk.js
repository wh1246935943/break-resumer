importScripts('./spark-md5.js');

function createChunk(file, index, chunkSize) {
  
  return new Promise((resolve, reject) => {
    
    const start = index * chunkSize;

    const end = start + chunkSize;

    const fileReader = new FileReader();

    const spark = new SparkMD5.ArrayBuffer();

    const blob = file.slice(start, end);

    fileReader.onload = (e) => {

      spark.append(e.target.result);

      resolve({
        chunkStart: start,
        chunkEnd: end,
        chunkIndex: index,
        chunkHash: spark.end(),
        chunkBlob: blob,
        isUploaded: false
      })

    }

    fileReader.readAsArrayBuffer(blob)

  })
}