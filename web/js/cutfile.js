const CHUNK_SIZE = 1024 * 1024 * 5;

const THREAD_COUNT = navigator.hardwareConcurrency || 4;

export function cutFile(file, uploadedChunks, callback) {

  return new Promise((resolve, reject) => {
    
    const chunCount = Math.ceil(file.size / CHUNK_SIZE);

    const threadChunkCount = Math.ceil(chunCount / THREAD_COUNT);

    let createWorkerNumber = 0;

    let closeWorkerNumber = 0;

    for (let index = 0; index < THREAD_COUNT; index++) {
      
      const start = index * threadChunkCount;
      
      let end = (index + 1) * threadChunkCount;
      
      if (end > chunCount) end = chunCount;

      if (start >= end) continue;

      createWorkerNumber++
      
      const worker = new Worker('./../../web/js/worker.js');
      
      worker.onerror = (err) => console.log('worker error:::', index, err);

      worker.postMessage({
        file,
        CHUNK_SIZE,
        start,
        end,
        uploadedChunks
      });

      worker.onmessage = (e) => {

        if (e.data.isThreadDone) {
          worker.terminate()
          closeWorkerNumber++
        };

        if (e.data.isUploaded) return;

        callback(e.data, closeWorkerNumber === createWorkerNumber)
        
      }
      
    }

  })
}