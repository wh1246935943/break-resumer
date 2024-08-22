importScripts('./createChunk.js');

onmessage = async (e) => {
  const { file, CHUNK_SIZE, start, end, uploadedChunks } = e.data;

  let doneNumber = 0

  for (let index = start; index < end; index++) {

    if (uploadedChunks.includes(index)) {

      doneNumber++;
  
      postMessage({
        isThreadDone: doneNumber === (end - start),
        chunkIndex: index,
        isUploaded: true
      })

      continue;
    }

    const res = await createChunk(file, index, CHUNK_SIZE);

    doneNumber++;

    if (doneNumber === (end - start)) {

      res.isThreadDone = true

    }

    postMessage(res)
  };

  // const chunks = await Promise.all(result)

  // postMessage(chunks)
}