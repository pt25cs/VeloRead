# VeloRead Future Roadmap

## Phase 1 — Near-Term (Client-Side Enhancements)

### PDF Support
- Add `pdfjs-dist` for client-side PDF text extraction
- Use text item positioning (x/y coordinates, font size) to filter out margin content, headers, footers, page numbers
- Reconstruct reading order from position data
- Update parser, file upload accept attribute, and ALLOWED_EXTENSIONS

### About Page
- What VeloRead is and why it was built
- Document compatibility guide (what formats/types work well)
- Coming soon / changelog section for feature announcements
- Navigation shell (tabs or routes) to support multiple sections

## Phase 2 — Medium-Term (Navigation & Monetization)

### Multi-Page Navigation
- Tab/route system: Reader, About, Library
- Decide whether reader stays visible during navigation (persistent mini-display) or navigates away
- Distributed ad placement across non-reader pages (About, Library) — keep the reader minimal and distraction-free

### Ad Strategy
- Remove or reduce ads on the main reader display
- Place ads on About and Library pages where users are in a passive browsing state
- More tabs = more ad inventory without hurting reading UX

## Phase 3 — Long-Term (Backend & Library) ~1 year+

*Requires capital and stable user base before starting.*

### Library Database
- Backend storage for user-uploaded documents/PDFs
- Search capabilities within the library
- User accounts and authentication (to persist uploads and preferences)
- Content moderation considerations (copyrighted material)

### Adaptive PDF Parsing (Server-Side)
- Move PDF parsing to server-side for more robust extraction
- Position-based filtering with coordinate analysis
- Font size heuristics to identify body vs. footnotes/captions
- Structured PDF tag extraction when available (accessibility tags)
- Consider tools like Apache Tika or PyMuPDF for better structural analysis
- Handle complex layouts: multi-column, academic papers, textbooks

### Infrastructure Considerations
- Storage costs for document library
- Search indexing (full-text search across uploaded documents)
- Database design for documents, users, metadata
- CDN for document delivery
- Rate limiting and abuse prevention

## Notes
- Phases are sequential — each builds on the previous
- Phase 1 is all client-side, no backend needed
- Phase 2 introduces navigation but remains client-side
- Phase 3 is the architecture shift to server-side — only pursue after revenue/users justify the cost
