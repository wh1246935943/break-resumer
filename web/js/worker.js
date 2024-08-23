importScripts('./createchunk.js');

onmessage = async (e) => {
  const { threadIndex, file, CHUNK_SIZE, start, end, uploadedChunks } = e.data;

  console.log('open thread index:::', threadIndex);

  console.log('start:::', start, end);

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

    console.log('createChunk:::');
    const res = await createChunk(file, index, CHUNK_SIZE);

    doneNumber++;

    if (doneNumber === (end - start)) {

      res.isThreadDone = true

    }

    postMessage(res)
  };
}