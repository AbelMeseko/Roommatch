  (function() {
            // mobile handlers
            const toggleBtn = document.getElementById('mobileRibbonToggle');
            const closeBtn = document.getElementById('mobileRibbonClose');
            const panel = document.getElementById('mobileRibbonPanel');
            if (toggleBtn && closeBtn && panel) {
                toggleBtn.addEventListener('click', () => panel.classList.add('show'));
                closeBtn.addEventListener('click', () => panel.classList.remove('show'));
                panel.addEventListener('click', (e) => { if (e.target === panel) panel.classList.remove('show'); });
            }
            
            const desktopLogo = document.getElementById('desktopLogoRedirect');
            if (desktopLogo) desktopLogo.addEventListener('click', () => window.location.href = 'index.html');
            const mobileLogo = document.getElementById('mobileLogoRedirect');
            if (mobileLogo) mobileLogo.addEventListener('click', () => window.location.href = 'index.html');

            // --- GALLERY CODE ---
            const SHEET_ID = "1LlaotMgWRZdLZdFfW16-urkkbOuPdo-zMKAx-mZvSBo";
            
            const galleryGrid = document.getElementById('galleryGrid');
            const galleryWrapper = document.getElementById('galleryWrapper');
            const loadingDiv = document.getElementById('galleryLoading');
            const errorDiv = document.getElementById('galleryError');
            const listingCountSpan = document.getElementById('listingCount');
            const refreshBtn = document.getElementById('refreshGalleryBtn');
            
            // Filter elements
            const bedroomsFilter = document.getElementById('bedroomsFilter');
            const livingRoomFilter = document.getElementById('livingRoomFilter');
            const kitchenFilter = document.getElementById('kitchenFilter');
            const otherRoomsFilter = document.getElementById('otherRoomsFilter');
            const areaFilter = document.getElementById('areaFilter');
            const sectionFilter = document.getElementById('sectionFilter');
            const cityFilter = document.getElementById('cityFilter');
            const provinceFilter = document.getElementById('provinceFilter');
            const minPriceInput = document.getElementById('minPrice');
            const maxPriceInput = document.getElementById('maxPrice');
            const applyFiltersBtn = document.getElementById('applyFiltersBtn');
            const clearFiltersBtn = document.getElementById('clearFiltersBtn');
            const activeFiltersDiv = document.getElementById('activeFilters');

            let allListings = [];
            let filteredListings = [];
            
            // Unique values for filters
            let uniqueBedrooms = new Set();
            let uniqueLivingRooms = new Set();
            let uniqueKitchens = new Set();
            let uniqueOtherRooms = new Set();
            let uniqueAreas = new Set();
            let uniqueSections = new Set();
            let uniqueCities = new Set();
            let uniqueProvinces = new Set();

            function extractGoogleFileId(link) {
                if (!link || link === '') return null;
                let match;
                match = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                if (match) return match[1];
                match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
                if (match) return match[1];
                match = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                if (match) return match[1];
                match = link.match(/open\?id=([a-zA-Z0-9_-]+)/);
                if (match) return match[1];
                if (link.match(/^[a-zA-Z0-9_-]{25,}$/)) return link;
                return null;
            }

            function showError(msg) {
                errorDiv.style.display = 'block';
                errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${msg}`;
                loadingDiv.style.display = 'none';
            }

            function populateDynamicFilters() {
                // Bedrooms filter
                bedroomsFilter.innerHTML = '<option value="">All Bedrooms</option>';
                Array.from(uniqueBedrooms).sort((a, b) => {
                    const numA = parseInt(a) || 0;
                    const numB = parseInt(b) || 0;
                    return numA - numB;
                }).forEach(value => {
                    if (value && value.trim() !== '') {
                        const option = document.createElement('option');
                        option.value = value;
                        option.textContent = value + (parseInt(value) === 1 ? ' Bedroom' : ' Bedrooms');
                        bedroomsFilter.appendChild(option);
                    }
                });

                // Living Rooms filter
                livingRoomFilter.innerHTML = '<option value="">All Living Rooms</option>';
                Array.from(uniqueLivingRooms).sort().forEach(value => {
                    if (value && value.trim() !== '') {
                        const option = document.createElement('option');
                        option.value = value;
                        option.textContent = value;
                        livingRoomFilter.appendChild(option);
                    }
                });

                // Kitchens filter
                kitchenFilter.innerHTML = '<option value="">All Kitchens</option>';
                Array.from(uniqueKitchens).sort().forEach(value => {
                    if (value && value.trim() !== '') {
                        const option = document.createElement('option');
                        option.value = value;
                        option.textContent = value;
                        kitchenFilter.appendChild(option);
                    }
                });

                // Other Rooms filter
                otherRoomsFilter.innerHTML = '<option value="">All Other Rooms</option>';
                Array.from(uniqueOtherRooms).sort().forEach(value => {
                    if (value && value.trim() !== '' && value !== '—') {
                        const option = document.createElement('option');
                        option.value = value;
                        option.textContent = value;
                        otherRoomsFilter.appendChild(option);
                    }
                });

                // Suburbs filter
                areaFilter.innerHTML = '<option value="">All Suburbs</option>';
                Array.from(uniqueAreas).sort().forEach(value => {
                    if (value && value.trim() !== '') {
                        const option = document.createElement('option');
                        option.value = value;
                        option.textContent = value;
                        areaFilter.appendChild(option);
                    }
                });

                // Sections filter
                sectionFilter.innerHTML = '<option value="">All Sections</option>';
                Array.from(uniqueSections).sort().forEach(value => {
                    if (value && value.trim() !== '') {
                        const option = document.createElement('option');
                        option.value = value;
                        option.textContent = value;
                        sectionFilter.appendChild(option);
                    }
                });

                // Cities filter
                cityFilter.innerHTML = '<option value="">All Cities</option>';
                Array.from(uniqueCities).sort().forEach(value => {
                    if (value && value.trim() !== '') {
                        const option = document.createElement('option');
                        option.value = value;
                        option.textContent = value;
                        cityFilter.appendChild(option);
                    }
                });

                // Provinces filter
                provinceFilter.innerHTML = '<option value="">All Provinces</option>';
                Array.from(uniqueProvinces).sort().forEach(value => {
                    if (value && value.trim() !== '') {
                        const option = document.createElement('option');
                        option.value = value;
                        option.textContent = value;
                        provinceFilter.appendChild(option);
                    }
                });
            }

            function updateActiveFilters() {
                const bedrooms = bedroomsFilter.value;
                const livingRoom = livingRoomFilter.value;
                const kitchen = kitchenFilter.value;
                const otherRooms = otherRoomsFilter.value;
                const area = areaFilter.value;
                const section = sectionFilter.value;
                const city = cityFilter.value;
                const province = provinceFilter.value;
                const minPrice = minPriceInput.value;
                const maxPrice = maxPriceInput.value;
                
                activeFiltersDiv.innerHTML = '';
                
                if (bedrooms) addFilterTag(`🛏️ ${bedrooms} Bed`, 'bedrooms');
                if (livingRoom) addFilterTag(`🛋️ Living: ${livingRoom}`, 'livingRoom');
                if (kitchen) addFilterTag(`🍳 Kitchen: ${kitchen}`, 'kitchen');
                if (otherRooms) addFilterTag(`🚪 Other: ${otherRooms}`, 'otherRooms');
                if (area) addFilterTag(`📍 Suburb: ${area}`, 'area');
                if (section) addFilterTag(`🏷️ Section: ${section}`, 'section');
                if (city) addFilterTag(`🏙️ City: ${city}`, 'city');
                if (province) addFilterTag(`🗺️ Province: ${province}`, 'province');
                if (minPrice) addFilterTag(`💰 Min: R${minPrice}`, 'minPrice');
                if (maxPrice) addFilterTag(`💰 Max: R${maxPrice}`, 'maxPrice');
            }

            function addFilterTag(text, filterType) {
                const tag = document.createElement('span');
                tag.className = 'filter-tag';
                tag.innerHTML = `${text} <i class="fas fa-times" onclick="clearFilter('${filterType}')"></i>`;
                activeFiltersDiv.appendChild(tag);
            }

            // Make clearFilter function global
            window.clearFilter = function(filterType) {
                if (filterType === 'bedrooms') bedroomsFilter.value = '';
                if (filterType === 'livingRoom') livingRoomFilter.value = '';
                if (filterType === 'kitchen') kitchenFilter.value = '';
                if (filterType === 'otherRooms') otherRoomsFilter.value = '';
                if (filterType === 'area') areaFilter.value = '';
                if (filterType === 'section') sectionFilter.value = '';
                if (filterType === 'city') cityFilter.value = '';
                if (filterType === 'province') provinceFilter.value = '';
                if (filterType === 'minPrice') minPriceInput.value = '';
                if (filterType === 'maxPrice') maxPriceInput.value = '';
                applyFilters();
            };

            function applyFilters() {
                const bedrooms = bedroomsFilter.value;
                const livingRoom = livingRoomFilter.value;
                const kitchen = kitchenFilter.value;
                const otherRooms = otherRoomsFilter.value;
                const area = areaFilter.value;
                const section = sectionFilter.value;
                const city = cityFilter.value;
                const province = provinceFilter.value;
                const minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
                const maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
                
                updateActiveFilters();
                
                let results = allListings.filter(listing => {
                    if (bedrooms && listing.bedrooms !== bedrooms) return false;
                    if (livingRoom && listing.livingRoom !== livingRoom) return false;
                    if (kitchen && listing.kitchen !== kitchen) return false;
                    if (otherRooms && listing.otherRooms !== otherRooms) return false;
                    if (area && listing.area !== area) return false;
                    if (section && listing.section !== section) return false;
                    if (city && listing.city !== city) return false;
                    if (province && listing.province !== province) return false;
                    
                    const priceStr = listing.price.toString().replace(/[^0-9]/g, '');
                    const price = priceStr ? parseInt(priceStr) : null;
                    
                    if (minPrice !== null && (!price || price < minPrice)) return false;
                    if (maxPrice !== null && (!price || price > maxPrice)) return false;
                    
                    return true;
                });
                
                filteredListings = results;
                listingCountSpan.textContent = filteredListings.length;
                renderGallery(filteredListings);
            }

            async function loadSheetGallery() {
                galleryGrid.innerHTML = '';
                errorDiv.style.display = 'none';
                loadingDiv.style.display = 'flex';
                
                uniqueBedrooms.clear();
                uniqueLivingRooms.clear();
                uniqueKitchens.clear();
                uniqueOtherRooms.clear();
                uniqueAreas.clear();
                uniqueSections.clear();
                uniqueCities.clear();
                uniqueProvinces.clear();
                activeFiltersDiv.innerHTML = '';

                try {
                    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
                    
                    const response = await fetch(csvUrl, {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            'Accept': 'text/csv'
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const csvText = await response.text();
                    
                    // Parse CSV
                    const lines = csvText.split('\n').filter(line => line.trim() !== '');
                    
                    if (lines.length < 2) {
                        throw new Error('No data found in spreadsheet');
                    }
                    
                    const rows = [];
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i];
                        const values = [];
                        let inQuotes = false;
                        let currentValue = '';
                        
                        for (let j = 0; j < line.length; j++) {
                            const char = line[j];
                            
                            if (char === '"') {
                                inQuotes = !inQuotes;
                            } else if (char === ',' && !inQuotes) {
                                values.push(currentValue);
                                currentValue = '';
                            } else {
                                currentValue += char;
                            }
                        }
                        values.push(currentValue);
                        
                        const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());
                        rows.push(cleanValues);
                    }
                    
                    // Debug: Log first row to see columns
                    console.log('First row columns:', rows[0]);
                    console.log('Total rows:', rows.length);
                    
                    allListings = [];
                    let approvedCount = 0;
                    let skippedNoApprove = 0;
                    let skippedNoPhotos = 0;
                    
                    rows.forEach((row, index) => {
                        if (row.length < 14) {
                            console.log(`Row ${index + 1} skipped: insufficient columns`);
                            return;
                        }
                        
                        // Extract data based on column positions from your table
                        const timestamp = row[0] || '';
                        const name = row[1] || '';
                        const bedrooms = row[3] || '';
                        const livingRoom = row[4] || '';
                        const otherRooms = row[5] || '';
                        const kitchen = row[6] || '';
                        const price = row[7] || '—';
                        const area = row[8] || '';
                        const section = row[9] || '';
                        const city = row[10] || '';
                        const province = row[11] || '';
                        const landlord = row[12] || '';
                        const contact = row[13] || '';
                        
                        // Check Approve column (column 21, index 20 in zero-based array)
                        const approve = row[20] ? row[20].toLowerCase().trim() : '';
                        
                        console.log(`Row ${index + 1}: Approve = "${approve}"`);
                        
                        // ONLY SHOW LISTINGS WHERE APPROVE = "yes" (exact match)
                        if (approve !== 'yes') {
                            skippedNoApprove++;
                            return; // Skip this listing - not approved
                        }
                        
                        // Collect all photo IDs (columns 14-19)
                        const photoIds = [];
                        for (let col = 14; col <= 19; col++) {
                            if (row[col] && row[col] !== '' && row[col].includes('drive.google.com')) {
                                const photoId = extractGoogleFileId(row[col]);
                                if (photoId) {
                                    photoIds.push(photoId);
                                }
                            }
                        }
                        
                        // Only include if there's at least one photo
                        if (photoIds.length === 0) {
                            skippedNoPhotos++;
                            return;
                        }
                        
                        // Add to unique sets for filters (only from approved listings)
                        if (bedrooms && bedrooms.trim() !== '') uniqueBedrooms.add(bedrooms);
                        if (livingRoom && livingRoom.trim() !== '') uniqueLivingRooms.add(livingRoom);
                        if (kitchen && kitchen.trim() !== '') uniqueKitchens.add(kitchen);
                        if (otherRooms && otherRooms.trim() !== '' && otherRooms !== '—') uniqueOtherRooms.add(otherRooms);
                        if (area && area.trim() !== '') uniqueAreas.add(area);
                        if (section && section.trim() !== '') uniqueSections.add(section);
                        if (city && city.trim() !== '') uniqueCities.add(city);
                        if (province && province.trim() !== '') uniqueProvinces.add(province);
                        
                        allListings.push({
                            name: name,
                            price: price,
                            bedrooms: bedrooms,
                            livingRoom: livingRoom,
                            kitchen: kitchen,
                            otherRooms: otherRooms,
                            area: area,
                            section: section,
                            city: city,
                            province: province,
                            landlord: landlord,
                            contact: contact,
                            approve: approve,
                            photoIds: photoIds,
                            photoCount: photoIds.length
                        });
                        
                        approvedCount++;
                    });
                    
                    console.log(`Approved listings: ${approvedCount}`);
                    console.log(`Skipped (not approved): ${skippedNoApprove}`);
                    console.log(`Skipped (no photos): ${skippedNoPhotos}`);
                    
                    if (allListings.length === 0) {
                        showError('No approved listings found in the spreadsheet');
                        return;
                    }
                    
                    populateDynamicFilters();
                    
                    filteredListings = allListings;
                    listingCountSpan.textContent = filteredListings.length;
                    renderGallery(filteredListings);
                    
                } catch (err) {
                    console.error('Gallery error:', err);
                    showError('Failed to load: ' + err.message);
                } finally {
                    loadingDiv.style.display = 'none';
                }
            }

            function renderGallery(listings) {
                galleryGrid.innerHTML = '';

                if (listings.length === 0) {
                    const noResults = document.createElement('div');
                    noResults.className = 'no-results';
                    noResults.innerHTML = `
                        <i class="fas fa-search"></i>
                        <p>No approved listings match your filters</p>
                        <p style="font-size:0.9rem; color:#888;">Try adjusting or clearing filters</p>
                    `;
                    galleryGrid.appendChild(noResults);
                    return;
                }

                listings.forEach((listing, index) => {
                    const card = document.createElement('div');
                    card.className = 'gallery-card';
                    
                    // Image container
                    const imgContainer = document.createElement('div');
                    imgContainer.style.cssText = 'position:relative; width:100%; aspect-ratio:4/3; background:#f0f0f0; overflow:hidden;';
                    
                    const imgEl = document.createElement('img');
                    imgEl.className = 'gallery-img';
                    imgEl.alt = 'Room photo';
                    imgEl.loading = 'lazy';
                    
                    if (listing.photoIds && listing.photoIds.length > 0) {
                        const thumbnailUrl = `https://drive.google.com/thumbnail?id=${listing.photoIds[0]}&sz=w400`;
                        imgEl.src = thumbnailUrl;
                        
                        imgEl.onerror = function() {
                            this.src = `https://drive.google.com/uc?export=view&id=${listing.photoIds[0]}`;
                        };
                    }
                    
                    imgContainer.appendChild(imgEl);
                    
                    // Details section
                    const detailsDiv = document.createElement('div');
                    detailsDiv.className = 'room-details';
                    
                    // Price
                    const priceDiv = document.createElement('div');
                    priceDiv.className = 'price-badge';
                    priceDiv.textContent = `R ${listing.price}`;
                    detailsDiv.appendChild(priceDiv);
                    
                    // FILTER DETAILS SECTION
                    const filterDetails = document.createElement('div');
                    filterDetails.className = 'filter-details';
                    filterDetails.innerHTML = `
                        <div class="filter-details-grid">
                            <div class="filter-detail-item">
                                <span class="filter-label">Bedrooms</span>
                                <span class="filter-value"><i class="fas fa-bed"></i> ${listing.bedrooms || '—'}</span>
                            </div>
                            <div class="filter-detail-item">
                                <span class="filter-label">Living Room</span>
                                <span class="filter-value"><i class="fas fa-couch"></i> ${listing.livingRoom || '—'}</span>
                            </div>
                            <div class="filter-detail-item">
                                <span class="filter-label">Kitchen</span>
                                <span class="filter-value"><i class="fas fa-utensils"></i> ${listing.kitchen || '—'}</span>
                            </div>
                            <div class="filter-detail-item">
                                <span class="filter-label">Other Rooms</span>
                                <span class="filter-value"><i class="fas fa-door-open"></i> ${listing.otherRooms || '—'}</span>
                            </div>
                            <div class="filter-detail-item">
                                <span class="filter-label">Suburb</span>
                                <span class="filter-value"><i class="fas fa-map-pin"></i> ${listing.area || '—'}</span>
                            </div>
                            <div class="filter-detail-item">
                                <span class="filter-label">Section</span>
                                <span class="filter-value"><i class="fas fa-tag"></i> ${listing.section || '—'}</span>
                            </div>
                            <div class="filter-detail-item">
                                <span class="filter-label">City</span>
                                <span class="filter-value"><i class="fas fa-city"></i> ${listing.city || '—'}</span>
                            </div>
                            <div class="filter-detail-item">
                                <span class="filter-label">Province</span>
                                <span class="filter-value"><i class="fas fa-map-marker-alt"></i> ${listing.province || '—'}</span>
                            </div>
                        </div>
                    `;
                    detailsDiv.appendChild(filterDetails);
                    
                    // Location summary
                    const locationSummary = document.createElement('div');
                    locationSummary.className = 'location-summary';
                    locationSummary.innerHTML = `
                        <i class="fas fa-location-dot"></i>
                        <span>${listing.city || ''}${listing.city && listing.province ? ', ' : ''}${listing.province || ''}</span>
                    `;
                    detailsDiv.appendChild(locationSummary);
                    
                    // Photo indicator
                    const photoIndicator = document.createElement('div');
                    photoIndicator.className = 'photo-indicator';
                    
                    const photoCount = document.createElement('span');
                    photoCount.className = 'photo-count';
                    photoCount.innerHTML = `<i class="fas fa-camera"></i> ${listing.photoCount} photos`;
                    
                    const viewBtn = document.createElement('button');
                    viewBtn.className = 'view-photos-btn';
                    viewBtn.innerHTML = '<i class="fas fa-images"></i> View Photos';
                    
                    viewBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (listing.photoIds && listing.photoIds.length > 0) {
                            const photoIdsJson = encodeURIComponent(JSON.stringify(listing.photoIds));
                            window.location.href = `photo-viewer.html?ids=${photoIdsJson}`;
                        }
                    });
                    
                    card.addEventListener('click', () => {
                        if (listing.photoIds && listing.photoIds.length > 0) {
                            const photoIdsJson = encodeURIComponent(JSON.stringify(listing.photoIds));
                            window.location.href = `photo-viewer.html?ids=${photoIdsJson}`;
                        }
                    });
                    
                    photoIndicator.appendChild(photoCount);
                    photoIndicator.appendChild(viewBtn);
                    detailsDiv.appendChild(photoIndicator);
                    
                    card.appendChild(imgContainer);
                    card.appendChild(detailsDiv);
                    
                    galleryGrid.appendChild(card);
                });
                
                setTimeout(() => {
                    if (galleryWrapper && listings.length > 0) {
                        galleryWrapper.scrollLeft = 20;
                    }
                }, 100);
            }

            // Event listeners
            applyFiltersBtn.addEventListener('click', applyFilters);
            
            clearFiltersBtn.addEventListener('click', () => {
                bedroomsFilter.value = '';
                livingRoomFilter.value = '';
                kitchenFilter.value = '';
                otherRoomsFilter.value = '';
                areaFilter.value = '';
                sectionFilter.value = '';
                cityFilter.value = '';
                provinceFilter.value = '';
                minPriceInput.value = '';
                maxPriceInput.value = '';
                updateActiveFilters();
                filteredListings = allListings;
                listingCountSpan.textContent = filteredListings.length;
                renderGallery(filteredListings);
            });

            refreshBtn.addEventListener('click', loadSheetGallery);
            
            loadSheetGallery();

            document.addEventListener('contextmenu', (e) => e.preventDefault());
        })();