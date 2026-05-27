export function getDocChunk(docSplit: any[]) {
  const docChunk: any[] = [];

  if (docSplit.length > 0) {
    docChunk.push(docSplit[0]);
  } else {
    throw new Error(
      "The provided document is empty",
    );
  }

  return docChunk;
} 