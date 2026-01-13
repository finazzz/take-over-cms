/**
 * TAKE OVER - Dynamic Content Manager
 * Fetches content from Google Sheets and Google Drive
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // Google Sheets API (dopo aver pubblicato lo script, incolla l'URL qui)
    GOOGLE_SHEETS_API_URL: 'https://script.google.com/macros/s/AKfycbziPrthbxbkRfb7SNPE4ju72MMxAG19_tD-gI3Z3CXJ6p1N_PExnXbdZpkbuVnl6MBD/exec', // Es: 'https://script.google.com/macros/s/xxx/exec'

    // Google Drive API Key (per caricare foto dalle cartelle)
    DRIVE_API_KEY: 'AIzaSyAwa5cFaLMFyMdB_PUK8-vrcTsO9kNH7Do',

    // Cartella root dove cercare le foto delle serate
    DRIVE_ROOT_FOLDER: '1U0Uyb-hgbXvRBhBoFIeJvy12vprhJ6xW',

    // Usa dati di fallback se Google Sheets non è configurato
    USE_FALLBACK: false
};

// ============================================
// FALLBACK DATA
// ============================================
const FALLBACK_DATA = {
    config: {
        site_title: 'TAKE OVER',
        hero_title: 'TAKE OVER',
        hero_subtitle: 'PREMIUM UNDERGROUND INFRASTRUCTURE',
        hero_image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
        hero_button_text: 'SECURE ACCESS',
        archive_title: 'ARCHIVE',
        archive_subtitle: 'VISUAL EVIDENCE // SELECT A NIGHT',
        schedule_title: 'SCHEDULE',
        schedule_subtitle: 'UPCOMING TRANSMISSIONS',
        footer_cta: 'JOIN THE VOID.',
        footer_copyright: '© 2024 TAKE OVER ENTERTAINMENT // PROTOCOL ZERO',
        back_button_text: 'BACK',
        loading_text: 'SYNCING_DATA...',
        error_title: 'UPLINK ERROR',
        instagram_url: 'https://instagram.com',
        twitter_url: 'https://twitter.com',
        spotify_url: 'https://spotify.com'
    },
    serate: [
        {
            id: 'e1',
            data: '31.10',
            nome: 'CARNAGE',
            venue: 'HELL CLUB',
            stato: 'SOLD OUT',
            descrizione: 'Initial disruption protocol.',
            cover_image: 'https://images.unsplash.com/photo-1514525253344-425b03c73f1a?q=80&w=800',
            cartella_foto: ''
        },
        {
            id: 'e2',
            data: '12.11',
            nome: 'VOID',
            venue: 'WAREHOUSE X',
            stato: 'ACTIVE',
            descrizione: 'Industrial heavy bass immersion.',
            cover_image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800',
            cartella_foto: ''
        },
        {
            id: 'e3',
            data: '01.12',
            nome: 'GENESIS',
            venue: 'PLAZA_0',
            stato: 'SOON',
            descrizione: 'The next phase of takeover.',
            cover_image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800',
            cartella_foto: ''
        },
        {
            id: 'e4',
            data: '20.12',
            nome: 'ABYSS',
            venue: 'BUNKER 7',
            stato: 'SOON',
            descrizione: 'Descend into darkness.',
            cover_image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800',
            cartella_foto: ''
        }
    ]
};

// Demo photos for gallery
const DEMO_PHOTOS = [
    { id: 'd1', url: 'https://images.unsplash.com/photo-1514525253344-425b03c73f1a?q=80&w=600', name: 'FRAG_001' },
    { id: 'd2', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600', name: 'FRAG_002' },
    { id: 'd3', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600', name: 'FRAG_003' },
    { id: 'd4', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600', name: 'FRAG_004' },
    { id: 'd5', url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=600', name: 'FRAG_005' },
    { id: 'd6', url: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=600', name: 'FRAG_006' }
];

// ============================================
// STATE
// ============================================
let siteData = { ...FALLBACK_DATA };
let currentEvent = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Load content
    await loadContent();

    // Initialize UI
    initNavigation();
    initScrollAnimations();
    initGallery();

    // Hide loader
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 800);
}

// ============================================
// CONTENT LOADING
// ============================================
async function loadContent() {
    // Try to fetch from Google Sheets
    if (CONFIG.GOOGLE_SHEETS_API_URL && !CONFIG.USE_FALLBACK) {
        try {
            const response = await fetch(CONFIG.GOOGLE_SHEETS_API_URL);
            if (response.ok) {
                const data = await response.json();
                siteData = data;
            }
        } catch (error) {
            console.warn('Could not fetch from Google Sheets, using fallback:', error);
        }
    }

    // Populate content
    populateConfig(siteData.config);
    populateEvents(siteData.serate);
}

function populateConfig(config) {
    // Hero
    updateText('hero-title', config.hero_title);
    updateText('hero-subtitle', config.hero_subtitle);
    updateText('hero-btn-text', config.hero_button_text);
    updateDataAttr('hero-title', 'data-text', config.hero_title);

    const heroImage = document.getElementById('hero-image');
    if (heroImage && config.hero_image) {
        heroImage.src = config.hero_image;
    }

    // Sections
    updateText('archive-title', config.archive_title);
    updateText('archive-subtitle', config.archive_subtitle);
    updateText('schedule-title', config.schedule_title);
    updateText('schedule-subtitle', config.schedule_subtitle);

    // Footer
    if (config.footer_cta) {
        const words = config.footer_cta.split(' ');
        const lastWord = words.pop();
        document.getElementById('footer-cta').innerHTML =
            words.join(' ') + ' <span class="text-red">' + lastWord + '</span>';
    }
    updateText('footer-copyright', config.footer_copyright);

    // Navigation logo
    if (config.site_title) {
        const parts = config.site_title.split(' ');
        document.getElementById('nav-logo').innerHTML =
            parts[0] + ' <span class="text-red">' + (parts[1] || 'OVER') + '</span>';
    }

    // Gallery
    updateText('back-text', config.back_button_text);
    updateText('loading-text', config.loading_text);
    updateText('error-title', config.error_title);

    // Social links
    updateLink('social-instagram', config.instagram_url);
    updateLink('social-twitter', config.twitter_url);
    updateLink('social-spotify', config.spotify_url);
    updateLink('footer-instagram', config.instagram_url);
    updateLink('footer-twitter', config.twitter_url);
    updateLink('footer-spotify', config.spotify_url);
}

function populateEvents(events) {
    const archiveGrid = document.getElementById('archive-grid');
    const eventsList = document.getElementById('events-list');

    if (!events || events.length === 0) return;

    // Archive Grid (first 4 events)
    archiveGrid.innerHTML = events.slice(0, 4).map((event, index) => `
        <div class="archive-card reveal" data-event-index="${index}" style="transition-delay: ${index * 0.1}s">
            <img src="${event.cover_image}" alt="${event.nome}" class="archive-card-image">
            <div class="archive-card-content">
                <h3 class="archive-card-name">${event.nome}</h3>
                <p class="archive-card-date">${event.data}</p>
            </div>
        </div>
    `).join('');

    // Events List
    eventsList.innerHTML = events.map((event, index) => `
        <div class="event-item reveal" data-event-index="${index}" style="transition-delay: ${index * 0.05}s">
            <div class="event-item-main">
                <span class="event-date">${event.data}</span>
                <div class="event-info">
                    <h3 class="event-name">${event.nome}</h3>
                    <p class="event-venue">${event.venue}</p>
                </div>
            </div>
            <span class="event-status ${getStatusClass(event.stato)}">${event.stato}</span>
            <div class="event-arrow"><i data-lucide="arrow-right"></i></div>
        </div>
    `).join('');

    // Re-init icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Add click handlers
    document.querySelectorAll('.archive-card, .event-item').forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.dataset.eventIndex);
            openGallery(siteData.serate[index]);
        });
    });
}

function getStatusClass(status) {
    const s = status?.toLowerCase() || '';
    if (s.includes('sold') || s.includes('esaurito')) return 'sold-out';
    if (s.includes('active') || s.includes('attivo')) return 'active';
    return 'soon';
}

function updateText(id, text) {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
}

function updateDataAttr(id, attr, value) {
    const el = document.getElementById(id);
    if (el && value) el.setAttribute(attr, value);
}

function updateLink(id, url) {
    const el = document.getElementById(id);
    if (el && url) el.href = url;
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuLinks = document.querySelectorAll('.mobile-menu-link');

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0,0,0,0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)';
            navbar.style.backdropFilter = 'none';
        }
    });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => observer.observe(el));

    // Parallax effect on hero image
    window.addEventListener('scroll', () => {
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            const scrolled = window.scrollY;
            heroImage.style.transform = `scale(1.1) translateY(${scrolled * 0.3}px)`;
        }
    });
}

// ============================================
// GALLERY
// ============================================
function initGallery() {
    const galleryBack = document.getElementById('galleryBack');
    const errorRetry = document.getElementById('errorRetry');

    galleryBack.addEventListener('click', closeGallery);
    errorRetry.addEventListener('click', () => loadGalleryPhotos(true));

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeGallery();
    });
}

function openGallery(event) {
    currentEvent = event;
    const modal = document.getElementById('galleryModal');
    const title = document.getElementById('galleryTitle');

    title.innerHTML = `${event.nome} <span class="text-red">ARCHIVE</span>`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    loadGalleryPhotos(false);
}

function closeGallery() {
    const modal = document.getElementById('galleryModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentEvent = null;
}

async function loadGalleryPhotos(useDemo = false) {
    const loading = document.getElementById('galleryLoading');
    const error = document.getElementById('galleryError');
    const grid = document.getElementById('galleryGrid');

    // Reset state
    loading.classList.add('active');
    error.classList.remove('active');
    grid.innerHTML = '';
    grid.style.display = 'none';

    // If demo mode requested, show demo photos immediately
    if (useDemo) {
        loading.classList.remove('active');
        grid.style.display = 'grid';
        renderGalleryPhotos(DEMO_PHOTOS);
        return;
    }

    try {
        let photos = [];

        // Fetch photos via Apps Script (bypasses CORS and API key issues)
        if (CONFIG.GOOGLE_SHEETS_API_URL) {
            const eventName = encodeURIComponent(currentEvent.nome || '');
            const eventDate = encodeURIComponent(currentEvent.data || '');

            const photosUrl = `${CONFIG.GOOGLE_SHEETS_API_URL}?action=photos&event=${eventName}&date=${eventDate}`;

            console.log('Fetching photos via Apps Script:', photosUrl);

            const response = await fetch(photosUrl);

            if (response.ok) {
                const data = await response.json();
                if (data.photos && data.photos.length > 0) {
                    photos = data.photos;
                    console.log(`Received ${photos.length} photos from Apps Script`);
                }
            }
        }

        // Check if we got photos
        if (!photos || photos.length === 0) {
            throw new Error('NO_PHOTOS_FOUND');
        }

        // Success - render photos
        loading.classList.remove('active');
        grid.style.display = 'grid';
        renderGalleryPhotos(photos);

    } catch (err) {
        console.error('Gallery load error:', err.message);
        loading.classList.remove('active');
        error.classList.add('active');
    }
}

/**
 * Extract folder ID from various input formats
 */
function extractFolderId(input) {
    if (!input) return null;

    const str = input.toString().trim();

    // Already a folder ID (alphanumeric, underscores, hyphens)
    if (/^[a-zA-Z0-9_-]{20,}$/.test(str)) {
        return str;
    }

    // Google Drive URL format
    const urlMatch = str.match(/folders\/([a-zA-Z0-9_-]+)/);
    if (urlMatch) {
        return urlMatch[1];
    }

    // Open URL format
    const openMatch = str.match(/id=([a-zA-Z0-9_-]+)/);
    if (openMatch) {
        return openMatch[1];
    }

    return null;
}

/**
 * Search for a folder matching the event name in the root folder
 */
async function searchEventFolder(event) {
    if (!CONFIG.DRIVE_ROOT_FOLDER || !CONFIG.DRIVE_API_KEY) {
        return null;
    }

    // Build search patterns from most specific to least
    const eventDate = event.data ? event.data.replace(/\./g, '_').replace(/\//g, '_') : '';
    const eventName = event.nome ? event.nome.trim() : '';

    const searchPatterns = [];
    if (eventName && eventDate) {
        searchPatterns.push(`${eventName}_${eventDate}`);
        searchPatterns.push(`${eventName} ${eventDate}`);
    }
    if (eventName) {
        searchPatterns.push(eventName);
    }

    for (const pattern of searchPatterns) {
        try {
            console.log(`Trying pattern: "${pattern}"`);

            // Search for folders with matching name
            const query = encodeURIComponent(
                `'${CONFIG.DRIVE_ROOT_FOLDER}' in parents and ` +
                `mimeType = 'application/vnd.google-apps.folder' and ` +
                `name contains '${pattern}' and ` +
                `trashed = false`
            );

            const url = `https://www.googleapis.com/drive/v3/files?` +
                `q=${query}&` +
                `key=${CONFIG.DRIVE_API_KEY}&` +
                `fields=files(id,name)&` +
                `supportsAllDrives=true&` +
                `includeItemsFromAllDrives=true`;

            const response = await fetch(url);

            if (!response.ok) {
                console.warn(`Search failed for "${pattern}": ${response.status}`);
                continue;
            }

            const data = await response.json();

            if (data.files && data.files.length > 0) {
                console.log(`Found folder: ${data.files[0].name} (${data.files[0].id})`);
                return data.files[0].id;
            }
        } catch (err) {
            console.warn(`Search error for "${pattern}":`, err);
        }
    }

    return null;
}

/**
 * Fetch all image files from a Google Drive folder
 */
async function fetchPhotosFromDrive(folderId) {
    if (!folderId || !CONFIG.DRIVE_API_KEY) {
        return [];
    }

    try {
        // Query for images in the folder
        const query = encodeURIComponent(
            `'${folderId}' in parents and ` +
            `mimeType contains 'image/' and ` +
            `trashed = false`
        );

        const url = `https://www.googleapis.com/drive/v3/files?` +
            `q=${query}&` +
            `key=${CONFIG.DRIVE_API_KEY}&` +
            `fields=files(id,name,mimeType,thumbnailLink,webContentLink)&` +
            `orderBy=name&` +
            `pageSize=100&` +
            `supportsAllDrives=true&` +
            `includeItemsFromAllDrives=true`;

        console.log('Fetching photos from Drive...');
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Drive API error:', response.status, errorData);
            throw new Error(`DRIVE_API_ERROR_${response.status}`);
        }

        const data = await response.json();

        if (!data.files || data.files.length === 0) {
            console.log('No images found in folder');
            return [];
        }

        console.log(`Found ${data.files.length} images`);

        // Convert to our photo format
        return data.files.map(file => {
            // Build the best available image URL
            let imageUrl = '';

            // Option 1: Use thumbnail link (most reliable, resize to large)
            if (file.thumbnailLink) {
                // Replace size parameter to get larger image
                imageUrl = file.thumbnailLink.replace(/=s\d+/, '=s1600');
            }
            // Option 2: Direct link via export (works for public files)
            else {
                imageUrl = `https://lh3.googleusercontent.com/d/${file.id}=s1600`;
            }

            return {
                id: file.id,
                name: file.name,
                url: imageUrl
            };
        }).filter(photo => photo.url); // Only keep photos with valid URLs

    } catch (err) {
        console.error('fetchPhotosFromDrive error:', err);
        throw err;
    }
}

/**
 * Render photos in the gallery grid
 */
function renderGalleryPhotos(photos) {
    const grid = document.getElementById('galleryGrid');

    grid.innerHTML = photos.map((photo, i) => `
        <div class="gallery-item" style="animation: fadeInUp 0.5s ease ${i * 0.05}s forwards; opacity: 0;">
            <img 
                src="${photo.url}" 
                alt="${photo.name}" 
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/400x400/111/333?text=Image+Error'"
            >
        </div>
    `).join('');
}
