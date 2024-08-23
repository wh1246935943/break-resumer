const CHUNK_SIZE = 1024 * 1024 * 5;

const THREAD_COUNT = navigator.hardwareConcurrency || 4;

export function cutFile(file, uploadedChunks, callback) {

  return new Promise((resolve, reject) => {
    
    const chunkCount = Math.ceil(file.size / CHUNK_SIZE);

    const threadChunkCount = Math.ceil(chunkCount / THREAD_COUNT);

    for (let index = 0; index < THREAD_COUNT; index++) {
      
      const start = index * threadChunkCount;
      
      let end = (index + 1) * threadChunkCount;
      
      if (end > chunkCount) end = chunkCount;

      if (start >= end) continue;
      
      const worker = new Worker('./../../web/js/worker.js');
      
      worker.onerror = (err) => console.log('worker error:::', index, err);

      worker.postMessage({
        threadIndex: index,
        file,
        CHUNK_SIZE,
        start,
        end,
        uploadedChunks
      });

      worker.onmessage = (e) => {

        if (e.data.isThreadDone) {
          console.log('close thread index:::', index)
          worker.terminate();
          resolve()
        };

        callback(e.data, chunkCount)
        
      }
      
    }

  })
}