// services/api.js
// Uses NCBI Entrez E-utilities + MyGene.info for gene/disease data

const NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const MYGENE_BASE = 'https://mygene.info/v3';

// ── Search genes by name or symbol via MyGene.info ──────────────────────────
export async function searchGenesByQuery(query) {
  const url = `${MYGENE_BASE}/query?q=${encodeURIComponent(query)}&fields=symbol,name,taxid,chromosome,genomic_pos,summary,entrezgene,OMIM&species=human&size=10`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MyGene query failed: ${res.status}`);
  const data = await res.json();
  return data.hits || [];
}

// ── Get full gene details by Entrez Gene ID ──────────────────────────────────
export async function getGeneDetails(geneId) {
  const url = `${MYGENE_BASE}/gene/${geneId}?fields=symbol,name,chromosome,genomic_pos,summary,entrezgene,OMIM,alias,type_of_gene,genomic_pos_hg19,exac,MIM`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gene detail fetch failed: ${res.status}`);
  return res.json();
}

// ── Search diseases by name via NCBI MedGen ──────────────────────────────────
export async function searchDiseaseGenes(diseaseName) {
  // Step 1: search NCBI Gene db with disease term
  const searchUrl = `${NCBI_BASE}/esearch.fcgi?db=gene&term=${encodeURIComponent(diseaseName + '[disease]')}&retmax=10&retmode=json`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) throw new Error('NCBI search failed');
  const searchData = await searchRes.json();
  const ids = searchData.esearchresult?.idlist || [];
  if (ids.length === 0) return [];

  // Step 2: fetch summaries from NCBI
  const summaryUrl = `${NCBI_BASE}/esummary.fcgi?db=gene&id=${ids.join(',')}&retmode=json`;
  const summaryRes = await fetch(summaryUrl);
  if (!summaryRes.ok) throw new Error('NCBI summary failed');
  const summaryData = await summaryRes.json();

  const results = ids.map(id => {
    const doc = summaryData.result?.[id];
    if (!doc) return null;
    return {
      _id: id,
      entrezgene: id,
      symbol: doc.name,
      name: doc.description,
      chromosome: doc.chromosome,
      summary: doc.summary || '',
      genomic_pos: doc.genomicinfo?.[0]
        ? {
            chr: doc.chromosome,
            start: doc.genomicinfo[0].chrstart,
            end: doc.genomicinfo[0].chrstop,
          }
        : null,
    };
  }).filter(Boolean);

  return results;
}

// ── Fetch OMIM disease associations for a gene symbol ───────────────────────
export async function getDiseasesForGene(symbol) {
  const url = `${MYGENE_BASE}/query?q=symbol:${encodeURIComponent(symbol)}&fields=OMIM,MIM,name,symbol&species=human`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const hit = data.hits?.[0];
  if (!hit) return [];
  const omim = hit.OMIM || hit.MIM;
  if (!omim) return [];
  const ids = Array.isArray(omim) ? omim : [omim];
  return ids.map(id => ({ omimId: id, url: `https://omim.org/entry/${id}` }));
}
