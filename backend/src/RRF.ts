

export function reciprocalRankFusion(results,k = 60){
    const fusedScores = new Map();

    for(const docs of results){
        docs.forEach((doc,rank) => {
            const key = doc.pageContent;
            const previousScore = fusedScores.get(key) || 0;
            fusedScores.set(key, previousScore + 1 /(rank + k));
        });
    }

    const reranked = Array.from(fusedScores.entries())
        .map(([key,score])=>{
            const doc = results.flat().find(d=>d.pageContent === key),
            return {doc, score};
        })
        .sort((a,b)=>b.score - a.score);
}