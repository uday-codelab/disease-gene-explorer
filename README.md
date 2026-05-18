# Disease–Gene Mapping Explorer

A web-based bioinformatics app that lets users search diseases or genes and view associated genes, chromosome locations, gene summaries, and biological metadata — powered by NCBI Entrez and MyGene.info APIs.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# → http://localhost:5173
```

## Project Structure

```
src/
├── components/
│   ├── SearchBar.jsx       # Search input with mode toggle + suggestions
│   ├── GeneCard.jsx        # Gene result card with summary expand
│   ├── ChromosomeViewer.jsx # Visual chromosome map with gene position
│   └── DiseaseInfo.jsx     # OMIM disease association display
├── services/
│   └── api.js              # NCBI Entrez + MyGene.info API calls
├── App.jsx                 # Main app layout and state management
├── main.jsx                # React entry point
└── index.css               # Global styles + CSS variables
```

## Features (MVP Complete)

- ✅ Search by gene symbol (e.g. BRCA1, TP53) OR disease name (e.g. Breast Cancer)
- ✅ Gene information cards: symbol, name, chromosome, genomic coordinates
- ✅ Chromosome visualization with gene position marker
- ✅ OMIM disease association links
- ✅ Responsive dark UI with animation

## APIs Used

| API | Purpose |
|-----|---------|
| [MyGene.info](https://mygene.info) | Gene search, metadata, OMIM IDs |
| [NCBI E-utilities](https://www.ncbi.nlm.nih.gov/books/NBK25501/) | Disease-to-gene search |
| [OMIM](https://omim.org) | Disease links (external) |

## Next Steps (Optional)

- [ ] Dark/light mode toggle
- [ ] Save recent searches (localStorage)
- [ ] Gene comparison view
- [ ] Interactive SVG chromosome with zoom
- [ ] Export gene data as CSV
