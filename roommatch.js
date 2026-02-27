  (function() {
            // Mobile ribbon
            const toggleBtn = document.getElementById('mobileRibbonToggle');
            const closeBtn = document.getElementById('mobileRibbonClose');
            const panel = document.getElementById('mobileRibbonPanel');
            if (toggleBtn && closeBtn && panel) {
                toggleBtn.addEventListener('click', function() { panel.classList.add('show'); });
                closeBtn.addEventListener('click', function() { panel.classList.remove('show'); });
                panel.addEventListener('click', function(e) { if (e.target === panel) panel.classList.remove('show'); });
            }
            
            const desktopLogo = document.getElementById('desktopLogoRedirect');
            if (desktopLogo) desktopLogo.addEventListener('click', function() { window.location.href = 'index.html'; });
            const mobileLogo = document.getElementById('mobileLogoRedirect');
            if (mobileLogo) mobileLogo.addEventListener('click', function() { window.location.href = 'index.html'; });

            // ---------- GALLERY CODE ----------
            const SHEET_ID = "1EnJ_MzsCTnwWhiJ0ClQgcR7phU_uyu3Y17XX9AC67mI";
            const galleryGrid = document.getElementById('galleryGrid');
            const loadingDiv = document.getElementById('galleryLoading');
            const errorDiv = document.getElementById('galleryError');
            const statsDiv = document.getElementById('galleryStats');
            const imageCountSpan = document.getElementById('imageCount');
            const refreshBtn = document.getElementById('refreshGalleryBtn');
            
            const areaFilter = document.getElementById('areaFilter');
            const sectionFilter = document.getElementById('sectionFilter');
            const clearFiltersBtn = document.getElementById('clearFiltersBtn');
            const activeFiltersDiv = document.getElementById('activeFilters');

            let allListings = [];
            let filteredListings = [];
            let uniqueSections = new Set();
            let uniqueAreas = new Set();

            function extractGoogleFileId(link) {
                if (!link || link === '') return null;
                let match;
                match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
                if (match) return match[1];
                match = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                if (match) return match[1];
                if (link.match(/^[a-zA-Z0-9_-]{25,}$/)) return link;
                return null;
            }

            function showError(msg) {
                errorDiv.style.display = 'block';
                errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${msg}<br>
                    <button onclick="location.reload()" style="margin-top:8px; padding:6px 14px; background:#b91c1c; color:white; border:none; border-radius:5px; cursor:pointer;">Try Again</button>`;
                loadingDiv.style.display = 'none';
            }

            function updateFilters() {
                const sections = Array.from(uniqueSections).sort();
                sectionFilter.innerHTML = '<option value="">All Sections</option>';
                sections.forEach(section => {
                    if (section && section.trim() !== '') {
                        const option = document.createElement('option');
                        option.value = section;
                        option.textContent = section;
                        sectionFilter.appendChild(option);
                    }
                });

                const areas = Array.from(uniqueAreas).sort();
                areaFilter.innerHTML = '<option value="">All Areas</option>';
                areas.forEach(area => {
                    if (area && area.trim() !== '') {
                        const option = document.createElement('option');
                        option.value = area;
                        option.textContent = area;
                        areaFilter.appendChild(option);
                    }
                });
            }

            function updateActiveFilters() {
                const area = areaFilter.value;
                const section = sectionFilter.value;
                activeFiltersDiv.innerHTML = '';
                if (area) {
                    const tag = document.createElement('span');
                    tag.className = 'filter-tag';
                    tag.innerHTML = `Area: ${area} <i class="fas fa-times" onclick="document.getElementById('areaFilter').value = ''; window.applyFilters();"></i>`;
                    activeFiltersDiv.appendChild(tag);
                }
                if (section) {
                    const tag = document.createElement('span');
                    tag.className = 'filter-tag';
                    tag.innerHTML = `Section: ${section} <i class="fas fa-times" onclick="document.getElementById('sectionFilter').value = ''; window.applyFilters();"></i>`;
                    activeFiltersDiv.appendChild(tag);
                }
            }

            function applyFilters() {
                const area = areaFilter.value;
                const section = sectionFilter.value;
                updateActiveFilters();
                
                let results = allListings;
                if (area) {
                    results = results.filter(listing => listing.jhbNorth === area || listing.jhbSouth === area);
                }
                if (section) {
                    results = results.filter(listing => listing.section === section);
                }
                filteredListings = results;
                imageCountSpan.textContent = filteredListings.length;
                renderGallery(filteredListings);
            }
            window.applyFilters = applyFilters;

            async function loadSheetGallery() {
                galleryGrid.innerHTML = '';
                errorDiv.style.display = 'none';
                loadingDiv.style.display = 'flex';
                statsDiv.style.display = 'none';
                
                areaFilter.innerHTML = '<option value="">All Areas</option>';
                sectionFilter.innerHTML = '<option value="">All Sections</option>';
                uniqueSections.clear();
                uniqueAreas.clear();
                activeFiltersDiv.innerHTML = '';

                const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

                try {
                    const response = await fetch(csvUrl);
                    if (!response.ok) throw new Error('Could not load sheet');
                    const csv = await response.text();
                    
                    const rows = csv.split('\n').filter(line => line.trim() !== '');
                    if (rows.length < 2) throw new Error('No data found');
                    
                    const header = rows[0].split(',').map(c => c.replace(/^"|"$/g, '').trim());
                    
                    let nameIdx = header.findIndex(h => h.toLowerCase().includes('your name'));
                    let timestampIdx = 0;
                    let mainPhotoIdx = header.findIndex(h => h.toLowerCase() === 'main photo');
                    
                    let otherPhotoIndices = [];
                    for (let i = 0; i < header.length; i++) {
                        if (header[i].toLowerCase().includes('other photos')) {
                            otherPhotoIndices.push(i);
                        }
                    }
                    
                    let rentIdx = header.findIndex(h => h.toLowerCase().includes('rent amount'));
                    let jhbNorthIdx = header.findIndex(h => h.toLowerCase().includes('johannesburg north'));
                    let jhbSouthIdx = header.findIndex(h => h.toLowerCase().includes('johannesburg south'));
                    let sectionIdx = header.findIndex(h => h.toLowerCase().includes('section'));
                    
                    allListings = [];
                    
                    for (let i = 1; i < rows.length; i++) {
                        const cols = [];
                        let inQuotes = false;
                        let currentCol = '';
                        
                        for (let char of rows[i]) {
                            if (char === '"') {
                                inQuotes = !inQuotes;
                            } else if (char === ',' && !inQuotes) {
                                cols.push(currentCol.replace(/^"|"$/g, '').trim());
                                currentCol = '';
                            } else {
                                currentCol += char;
                            }
                        }
                        cols.push(currentCol.replace(/^"|"$/g, '').trim());
                        
                        const timestamp = cols[timestampIdx] || '';
                        const name = (nameIdx !== -1 && cols[nameIdx]) ? cols[nameIdx] : 'Anonymous';
                        
                        let mainId = null;
                        if (mainPhotoIdx !== -1 && cols[mainPhotoIdx]) {
                            mainId = extractGoogleFileId(cols[mainPhotoIdx]);
                        }
                        
                        if (!mainId) continue;
                        
                        let otherIds = [];
                        for (let idx of otherPhotoIndices) {
                            if (idx < cols.length && cols[idx] && cols[idx].trim() !== '') {
                                const id = extractGoogleFileId(cols[idx]);
                                if (id) otherIds.push(id);
                            }
                        }
                        
                        otherIds = [...new Set(otherIds)];
                        
                        let rent = (rentIdx !== -1 && cols[rentIdx]) ? cols[rentIdx] : '—';
                        let jhbNorth = (jhbNorthIdx !== -1 && cols[jhbNorthIdx]) ? cols[jhbNorthIdx] : '';
                        let jhbSouth = (jhbSouthIdx !== -1 && cols[jhbSouthIdx]) ? cols[jhbSouthIdx] : '';
                        let section = (sectionIdx !== -1 && cols[sectionIdx]) ? cols[sectionIdx] : '';
                        
                        if (section && section.trim() !== '') uniqueSections.add(section);
                        if (jhbNorth && jhbNorth.trim() !== '') uniqueAreas.add(jhbNorth);
                        if (jhbSouth && jhbSouth.trim() !== '') uniqueAreas.add(jhbSouth);
                        
                        allListings.push({
                            name: name,
                            timestamp: timestamp,
                            mainId: mainId,
                            otherIds: otherIds,
                            totalPhotos: 1 + otherIds.length,
                            rent: rent,
                            jhbNorth: jhbNorth,
                            jhbSouth: jhbSouth,
                            section: section
                        });
                    }
                    
                    if (allListings.length === 0) {
                        showError('No photos found. Please check back later.');
                        return;
                    }
                    
                    allListings.sort((a, b) => (a.timestamp < b.timestamp) ? 1 : -1);
                    
                    updateFilters();
                    
                    // Initially show NO results
                    filteredListings = [];
                    imageCountSpan.textContent = 0;
                    renderGallery([]);
                    
                } catch (err) {
                    console.error('Gallery error:', err);
                    showError('Unable to load gallery. Please try again.');
                }
            }

            function renderGallery(listings) {
                loadingDiv.style.display = 'none';
                if (listings.length > 0) {
                    statsDiv.style.display = 'inline-block';
                } else {
                    statsDiv.style.display = 'none';
                }
                galleryGrid.innerHTML = '';

                if (listings.length === 0) {
                    const noResults = document.createElement('div');
                    noResults.className = 'no-results';
                    noResults.innerHTML = `
                        <i class="fas fa-search"></i>
                        <p>Select filters above to view photos</p>
                        <p style="font-size:0.9rem; color:var(--gray-600); margin-top:10px;">Use the area and section filters to find specific rooms</p>
                    `;
                    galleryGrid.appendChild(noResults);
                    return;
                }

                listings.forEach((listing) => {
                    const card = document.createElement('div');
                    card.className = 'gallery-card';
                    
                    const imgEl = document.createElement('img');
                    imgEl.className = 'gallery-img';
                    imgEl.src = `https://drive.google.com/thumbnail?id=${listing.mainId}&sz=w400`;
                    imgEl.alt = 'room photo';
                    imgEl.loading = 'lazy';
                    
                    imgEl.onerror = function() {
                        this.src = 'https://via.placeholder.com/400x300?text=Photo+Not+Available';
                    };
                    
                    const detailsDiv = document.createElement('div');
                    detailsDiv.className = 'gallery-details';
                    
                    const rentDiv = document.createElement('div');
                    rentDiv.className = 'rent-badge';
                    rentDiv.innerHTML = `R ${listing.rent}`;
                    
                    const locRow = document.createElement('div');
                    locRow.className = 'location-row';
                    if (listing.jhbNorth) {
                        locRow.innerHTML += `<span class="location-item"><i class="fas fa-map-pin"></i> North: ${listing.jhbNorth}</span>`;
                    }
                    if (listing.jhbSouth) {
                        locRow.innerHTML += `<span class="location-item"><i class="fas fa-map-pin"></i> South: ${listing.jhbSouth}</span>`;
                    }
                    
                    const sectionSpan = document.createElement('div');
                    if (listing.section) {
                        sectionSpan.className = 'section-tag';
                        sectionSpan.innerHTML = `<i class="fas fa-tag"></i> ${listing.section}`;
                    }
                    
                    detailsDiv.appendChild(rentDiv);
                    if (locRow.children.length > 0) detailsDiv.appendChild(locRow);
                    if (listing.section) detailsDiv.appendChild(sectionSpan);
                    
                    const metaDiv = document.createElement('div');
                    metaDiv.className = 'gallery-meta';
                    metaDiv.innerHTML = `
                        <i class="fas fa-user-circle"></i>
                        <span>${listing.name}</span>
                        <div class="photo-count-badge">
                            <i class="fas fa-images"></i> ${listing.totalPhotos}
                        </div>
                    `;
                    
                    card.appendChild(imgEl);
                    card.appendChild(detailsDiv);
                    card.appendChild(metaDiv);
                    
                    card.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const allPhotoIds = [listing.mainId, ...listing.otherIds].filter(id => id);
                        
                        if (allPhotoIds.length === 0) {
                            alert('No photos available for this listing');
                            return;
                        }
                        
                        const params = new URLSearchParams({
                            ids: encodeURIComponent(JSON.stringify(allPhotoIds)),
                            owner: listing.name,
                            rent: listing.rent,
                            index: '0'
                        });
                        
                        window.location.href = `photo-viewer.html?${params.toString()}`;
                    });
                    
                    galleryGrid.appendChild(card);
                });
            }

            areaFilter.addEventListener('change', applyFilters);
            sectionFilter.addEventListener('change', applyFilters);
            
            clearFiltersBtn.addEventListener('click', () => {
                areaFilter.value = '';
                sectionFilter.value = '';
                updateActiveFilters();
                filteredListings = [];
                imageCountSpan.textContent = 0;
                renderGallery([]);
            });

            refreshBtn.addEventListener('click', loadSheetGallery);

            loadSheetGallery();

            // Prevent inspect
            document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'a' || e.key === 'A')) {
                    e.preventDefault(); return false;
                }
                if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j'))) {
                    e.preventDefault(); return false;
                }
            });

        })();