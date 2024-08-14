// import SparkMD5 from './spark-md5.js';
importScripts('./spark-md5.js');

function createChunk(file, index, chunkSize) {

  return new Promise((resolve) => {

    const start = index * chunkSize;

    const end = start + chunkSize;

    const spark = new SparkMD5.ArrayBuffer();

    const fileReader = new FileReader();

    const blob = file.slice(start, end);

    fileReader.onload = (e) => {

      spark.append(e.target.result)

      resolve({
        chunkStart: start,
        chunkEnd: end,
        chunkIndex: index,
        chunkHash: spark.end(),
        chunkBlob: blob
      })

    };

    fileReader.readAsArrayBuffer(blob);

  })

}