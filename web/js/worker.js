importScripts('./createchunk.js');

onmessage = async (e) => {

  const { start, end, file, CHUNK_SIZE, uploadedChunkIndexs } = e.data;

  const result = [];

  for (let i = start; i < end; i++) {

    // 如果已经上传过这个切片，则跳过
    if (uploadedChunkIndexs.includes(i)) {

      result.push({
        chunkIndex: i,
        isUploaded: true
      });

      continue
    };
    
    result.push(createChunk(file, i, CHUNK_SIZE)) ;
  }

  const chunks = await Promise.all(result);

  postMessage(chunks);

}