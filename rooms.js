   // Get parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        let photoIds = [];
        
        try {
            const idsParam = urlParams.get('ids');
            if (idsParam) {
                photoIds = JSON.parse(decodeURIComponent(idsParam));
            }
        } catch (e) {
            console.error('Error parsing photo IDs:', e);
        }

        const ownerParam = urlParams.get('owner') || 'Anonymous';
        const rentParam = urlParams.get('rent') || '—';

        // Elements
        const loadingOverlay = document.getElementById('loadingOverlay');
        const errorDisplay = document.getElementById('errorDisplay');
        const errorText = document.getElementById('errorText');
        const photoViewer = document.getElementById('photoViewer');
        const photoCounter = document.getElementById('photoCounter');
        const photoOwner = document.getElementById('photoOwner');
        const photoRent = document.getElementById('photoRent');
        const photoGrid = document.getElementById('photoGrid');

        // Track loaded images count
        let loadedImages = 0;
        let totalImages = photoIds.length;

        // Validate photo IDs
        if (!photoIds || photoIds.length === 0) {
            loadingOverlay.style.display = 'none';
            errorText.textContent = 'No photos to display. Please go back and try again.';
            errorDisplay.style.display = 'block';
        } else {
            // Initialize
            initializeGallery();
        }

        function initializeGallery() {
            // Set owner and rent info
            photoOwner.innerHTML = `<i class="fas fa-user-circle"></i> ${escapeHtml(ownerParam)}`;
            photoRent.textContent = `R ${escapeHtml(rentParam)}`;
            photoCounter.textContent = `${totalImages} photo${totalImages !== 1 ? 's' : ''}`;
            
            // Load all photos
            loadAllPhotos();
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function getPhotoUrls(photoId) {
            return {
                thumbnail: `https://drive.google.com/thumbnail?id=${photoId}&sz=w800`,
                uc: `https://drive.google.com/uc?export=view&id=${photoId}`,
                id: `https://drive.google.com/uc?id=${photoId}`,
                lh3: `https://lh3.googleusercontent.com/d/${photoId}=w800`,
                proxy: `https://images.weserv.nl/?url=drive.google.com/uc?id=${photoId}`,
                view: `https://drive.google.com/file/d/${photoId}/view`
            };
        }

        function loadAllPhotos() {
            // Clear grid
            photoGrid.innerHTML = '';
            
            // Create loading skeletons first
            for (let i = 0; i < totalImages; i++) {
                const skeletonCard = document.createElement('div');
                skeletonCard.className = 'photo-card';
                skeletonCard.innerHTML = `
                    <div class="photo-card-loading">
                        <div class="loading-spinner-small"></div>
                        <span>Loading photo ${i + 1}...</span>
                    </div>
                `;
                skeletonCard.id = `skeleton-${i}`;
                photoGrid.appendChild(skeletonCard);
            }

            // Load each photo
            photoIds.forEach((photoId, index) => {
                loadSinglePhoto(photoId, index);
            });
        }

        function loadSinglePhoto(photoId, index) {
            const urls = getPhotoUrls(photoId);
            
            // Try multiple image sources
            tryLoadImage(urls.thumbnail, index, photoId, 0);
        }

        function tryLoadImage(url, index, photoId, attempt) {
            const imageSources = [
                url,
                `https://drive.google.com/uc?export=view&id=${photoId}`,
                `https://lh3.googleusercontent.com/d/${photoId}=w800`,
                `https://images.weserv.nl/?url=drive.google.com/uc?id=${photoId}`
            ];

            const img = new Image();
            const timeout = setTimeout(() => {
                if (attempt < imageSources.length - 1) {
                    // Try next source
                    tryLoadImage(imageSources[attempt + 1], index, photoId, attempt + 1);
                } else {
                    // All attempts failed
                    createPhotoCard(index, photoId, null);
                }
            }, 8000);

            img.onload = () => {
                clearTimeout(timeout);
                createPhotoCard(index, photoId, img.src);
            };

            img.onerror = () => {
                clearTimeout(timeout);
                if (attempt < imageSources.length - 1) {
                    // Try next source
                    tryLoadImage(imageSources[attempt + 1], index, photoId, attempt + 1);
                } else {
                    // All attempts failed
                    createPhotoCard(index, photoId, null);
                }
            };

            img.src = imageSources[attempt];
        }

        function createPhotoCard(index, photoId, imageUrl) {
            // Remove skeleton
            const skeleton = document.getElementById(`skeleton-${index}`);
            if (skeleton) skeleton.remove();

            // Create photo card
            const card = document.createElement('div');
            card.className = 'photo-card';
            
            // Create image element
            const img = document.createElement('img');
            img.className = 'photo-card-image';
            
            if (imageUrl) {
                img.src = imageUrl;
            } else {
                // Fallback for failed images
                img.src = 'https://via.placeholder.com/400x300?text=Click+to+open';
                img.classList.add('image-error');
            }
            
            img.alt = `Room photo ${index + 1}`;
            img.loading = 'lazy';
            
            // Click to open in new tab
            img.addEventListener('click', () => {
                const urls = getPhotoUrls(photoId);
                window.open(urls.view, '_blank');
            });

            // Create footer
            const footer = document.createElement('div');
            footer.className = 'photo-card-footer';
            
            const photoNumber = document.createElement('span');
            photoNumber.className = 'photo-card-number';
            photoNumber.textContent = `Photo ${index + 1}`;
            
            const photoLink = document.createElement('a');
            photoLink.href = getPhotoUrls(photoId).view;
            photoLink.target = '_blank';
            photoLink.className = 'photo-card-link';
            photoLink.innerHTML = '<i class="fas fa-external-link-alt"></i> Open';
            
            footer.appendChild(photoNumber);
            footer.appendChild(photoLink);
            
            // Assemble card
            card.appendChild(img);
            card.appendChild(footer);
            
            // Add to grid
            photoGrid.appendChild(card);
            
            // Update loaded count
            loadedImages++;
            
            // Hide loading overlay when all images are loaded or failed
            if (loadedImages === totalImages) {
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    photoViewer.style.display = 'block';
                }, 500);
            }
        }

        function retryLoading() {
            errorDisplay.style.display = 'none';
            loadingOverlay.style.display = 'flex';
            loadedImages = 0;
            loadAllPhotos();
        }

        // Make retry function global
        window.retryLoading = retryLoading;roo