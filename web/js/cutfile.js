const CHUNK_SIZE = 1024 * 1024 * 5; // 5MB

const THREAD_COUNT = navigator.hardwareConcurrency || 4;

export async function cutFile(file, uploadedChunkIndexs) {

  return new Promise((resolve, reject) => {
    
    const chunkCount = Math.ceil(file.size / CHUNK_SIZE);

    const threadChunkCounts = Math.ceil(chunkCount / THREAD_COUNT);

    let finished = 0;

    const result = [];

    for (let i = 0; i < THREAD_COUNT; i++) {

      const worker = new Worker('./../../web/js/worker.js');

      let end = (i + 1) * threadChunkCounts;

      const start = i * threadChunkCounts;

      if (end > chunkCount) {

        end = chunkCount;

      }

      worker.onerror = (err) => console.error('Worker error:', i, err);

      worker.postMessage({
        start,
        end,
        file,
        CHUNK_SIZE,
        uploadedChunkIndexs
      });

      worker.onmessage = (e) => {

        for (let i = start; i < end; i++) {

          result[i] = e.data[i - start];

        }

        finished++;

        worker.terminate();

        if (finished === THREAD_COUNT) {

          resolve(result)

        }

      };
    }
  })
}