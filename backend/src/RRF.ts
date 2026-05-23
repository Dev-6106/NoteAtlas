import { Document } from "@langchain/core/documents";

export function reciprocalRankFusion(
  results: Document[][],
  k = 60,
): Document[] {
  const fusedScores = new Map<string, number>();

  for (const docs of results) {
    docs.forEach((doc, rank) => {
      const key = doc.pageContent;

      const previousScore = fusedScores.get(key) || 0;

      fusedScores.set(key, previousScore + 1 / (rank + k));
    });
  }

  const reranked = Array.from(fusedScores.entries())
    .map(([key, score]) => {
      const doc = results.flat().find((d) => d.pageContent === key);

      return {
        doc,
        score,
      };
    })
    .filter((item) => item.doc !== undefined)
    .sort((a, b) => b.score - a.score);

  return reranked.map((item) => item.doc as Document);
}
