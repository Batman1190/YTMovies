// Import configuration
import { YOUTUBE_CONFIG } from './config.js';

// DOM Elements
const videoContainer = document.getElementById('video-container');
const videoPlayerContainer = document.getElementById('video-player-container');
const closePlayerBtn = document.getElementById('close-player');
const searchInput = document.querySelector('.search-box input');
const searchButton = document.querySelector('.search-box button:last-child');
const loadingSpinner = document.getElementById('loading');

// App State
const appState = {
    currentVideo: null,
    searchQuery: '',
    isLoading: false,
    watchHistory: [],
    autoplayEnabled: JSON.parse(localStorage.getItem('autoplayEnabled') || 'true'),
    userInteracted: false,
    // Current list of video IDs displayed on the page (for next/previous navigation)
    currentList: [],
    // Index of the currently playing video within currentList
    currentIndex: -1,
    // Video queue for reserved videos (max 7)
    videoQueue: JSON.parse(localStorage.getItem('videoQueue') || '[]'),
    // Search results for video reservation
    searchResults: [],
    // Sidebar visibility state
    sidebarHidden: JSON.parse(localStorage.getItem('sidebarHidden') || 'false')
};

// Load watch history from storage
function loadWatchHistory() {
    const history = localStorage.getItem('watchHistory');
    return history ? JSON.parse(history) : [];
}

// Save watch history to storage
function saveWatchHistory() {
    localStorage.setItem('watchHistory', JSON.stringify(appState.watchHistory));
}

function saveAutoplaySetting() {
    localStorage.setItem('autoplayEnabled', JSON.stringify(appState.autoplayEnabled));
}

function saveSidebarVisibility() {
    localStorage.setItem('sidebarHidden', JSON.stringify(appState.sidebarHidden));
}

// Sidebar visibility management
function hideSidebar() {
    const videoQueueSidebar = document.querySelector('.video-queue-sidebar');
    const content = document.querySelector('.content');
    const showSidebarBtn = document.getElementById('show-sidebar-btn');
    const hideSidebarBtn = document.getElementById('hide-sidebar-btn');
    
    if (videoQueueSidebar && content) {
        videoQueueSidebar.classList.add('hidden');
        content.classList.add('sidebar-hidden');
        appState.sidebarHidden = true;
        saveSidebarVisibility();
        
        // Show the show sidebar button
        if (showSidebarBtn) {
            showSidebarBtn.classList.remove('hidden');
        }
        
        // Update hide button icon
        if (hideSidebarBtn) {
            hideSidebarBtn.innerHTML = '<i class="fas fa-eye"></i>';
            hideSidebarBtn.title = 'Show Sidebar';
        }
        
        console.log('Sidebar hidden');
    }
}

function showSidebar() {
    const videoQueueSidebar = document.querySelector('.video-queue-sidebar');
    const content = document.querySelector('.content');
    const showSidebarBtn = document.getElementById('show-sidebar-btn');
    const hideSidebarBtn = document.getElementById('hide-sidebar-btn');
    
    if (videoQueueSidebar && content) {
        videoQueueSidebar.classList.remove('hidden');
        content.classList.remove('sidebar-hidden');
        appState.sidebarHidden = false;
        saveSidebarVisibility();
        
        // Hide the show sidebar button
        if (showSidebarBtn) {
            showSidebarBtn.classList.add('hidden');
        }
        
        // Update hide button icon
        if (hideSidebarBtn) {
            hideSidebarBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            hideSidebarBtn.title = 'Hide Sidebar';
        }
        
        console.log('Sidebar shown');
    }
}

function toggleSidebarVisibility() {
    if (appState.sidebarHidden) {
        showSidebar();
    } else {
        hideSidebar();
    }
}

// Video Queue Management
function saveVideoQueue() {
    localStorage.setItem('videoQueue', JSON.stringify(appState.videoQueue));
}

// Update mobile queue badge
function updateMobileQueueBadge() {
    try {
        const mobileQueueBadge = document.getElementById('mobile-queue-badge');
        console.log('updateMobileQueueBadge called, queue length:', appState.videoQueue.length);
        if (mobileQueueBadge) {
            mobileQueueBadge.textContent = appState.videoQueue.length;
            console.log('Mobile badge updated to:', mobileQueueBadge.textContent);
        } else {
            console.log('Mobile queue badge element not found');
        }
    } catch (error) {
        console.error('Error updating mobile queue badge:', error);
    }
}

// Update mini queue display (placeholder function)
function updateMiniQueueDisplay() {
    try {
        console.log('updateMiniQueueDisplay called, queue length:', appState.videoQueue.length);
        // This function can be implemented later if needed
    } catch (error) {
        console.error('Error updating mini queue display:', error);
    }
}

// Update clear all button state
function updateClearAllButtonState() {
    try {
        const clearAllBtn = document.getElementById('clear-all-queue-btn');
        if (clearAllBtn) {
            if (appState.videoQueue.length === 0) {
                clearAllBtn.disabled = true;
                clearAllBtn.title = 'No videos to clear';
            } else {
                clearAllBtn.disabled = false;
                clearAllBtn.title = `Clear all ${appState.videoQueue.length} videos`;
            }
        }
    } catch (error) {
        console.error('Error updating clear all button state:', error);
    }
}

// Update Play Next button state
function updatePlayNextButtonState() {
    try {
        const playNextBtn = document.getElementById('play-next-btn');
        if (playNextBtn) {
            if (appState.videoQueue.length === 0) {
                playNextBtn.disabled = true;
                playNextBtn.title = 'No videos in queue';
                playNextBtn.style.opacity = '0.6';
            } else {
                playNextBtn.disabled = false;
                playNextBtn.title = `Play next video (${appState.videoQueue.length} in queue)`;
                playNextBtn.style.opacity = '1';
            }
        }
    } catch (error) {
        console.error('Error updating play next button state:', error);
    }
}

function addToVideoQueue(videoData) {
    console.log('addToVideoQueue called with:', videoData);
    console.log('Current queue length:', appState.videoQueue.length);
    console.log('Current queue contents:', appState.videoQueue);
    
    if (appState.videoQueue.length >= 7) {
        console.log('Queue is full, cannot add video');
        showError('Queue is full! Remove a video first to add another.');
        return false;
    }
    
    // Check if video is already in queue
    if (appState.videoQueue.some(v => v.videoId === videoData.videoId)) {
        console.log('Video already in queue');
        showError('Video is already in your queue!');
        return false;
    }
    
    appState.videoQueue.push(videoData);
    console.log('Video added to queue, new length:', appState.videoQueue.length);
    console.log('Updated queue contents:', appState.videoQueue);
    saveVideoQueue();
    updateQueueDisplay();
    updateMobileQueueBadge();
    updateClearAllButtonState();
    updatePlayNextButtonState();
    return true;
}

function removeFromVideoQueue(videoId) {
    appState.videoQueue = appState.videoQueue.filter(v => v.videoId !== videoId);
    saveVideoQueue();
    updateQueueDisplay();
    updateMobileQueueBadge();
    updateClearAllButtonState();
    updatePlayNextButtonState();
}

function clearVideoQueue() {
    appState.videoQueue = [];
    saveVideoQueue();
    updateQueueDisplay();
    updateMiniQueueDisplay();
    updateSidebarQueueDisplay();
    updateMobileQueueBadge();
    updateClearAllButtonState();
    updatePlayNextButtonState();
}

function getNextQueuedVideo() {
    if (appState.videoQueue.length > 0) {
        const nextVideo = appState.videoQueue.shift();
        saveVideoQueue(); // Save the updated queue to localStorage
        return nextVideo;
    }
    return null;
}

// Play next video from queue
function playNextVideo() {
    console.log('Play Next button clicked');
    
    // Check if there are videos in the queue
    if (appState.videoQueue.length === 0) {
        showError('No videos in queue! Add videos to your queue first.');
        return;
    }
    
    // Get the next video from queue
    const nextVideo = getNextQueuedVideo();
    if (nextVideo) {
        console.log('Playing next video from queue:', nextVideo.title);
        
        // Play the next video
        playVideo(nextVideo.videoId);
        
        // Update all queue displays
        updateQueueDisplay();
        updateMiniQueueDisplay();
        updateSidebarQueueDisplay();
        updateMobileQueueBadge();
        
        // Show success message
        showSuccessMessage(`Now playing: ${nextVideo.title}`);
    } else {
        showError('No videos available in queue!');
    }
}

// Add video to watch history
function addToHistory(videoId, videoData) {
    const timestamp = new Date().toISOString();
    const historyEntry = {
        videoId,
        title: videoData.title,
        thumbnail: videoData.thumbnails?.medium?.url,
        channelTitle: videoData.channelTitle,
        watchedAt: timestamp
    };
    
    // Remove if already exists and add to beginning
    appState.watchHistory = appState.watchHistory.filter(v => v.videoId !== videoId);
    appState.watchHistory.unshift(historyEntry);
    
    // Keep only last 50 videos
    if (appState.watchHistory.length > 50) {
        appState.watchHistory.pop();
    }
    
    saveWatchHistory();
}

// Utility Functions
function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// Filter helpers: allow only videos clearly related to pelikula/movie
function isKaraokeOrVideokeText(text) {
	if (!text || typeof text !== 'string') return false;
	return /(pelikula|movie)/i.test(text);
}

function itemMatchesKaraokeOrVideoke(item) {
    try {
        const title = item?.snippet?.title || '';
        // Strict: title must contain pelikula/movie
        return isKaraokeOrVideokeText(title);
    } catch (_) {
        return false;
    }
}

// YouTube API Functions
async function fetchTrendingVideos(region = 'GB') {
    console.log('fetchTrendingVideos called with region:', region);
    try {
        const videoContainer = document.getElementById('video-container');
        if (!videoContainer) {
            console.error('Video container not found!');
            return;
        }
        console.log('Video container found:', videoContainer);

        // Show loading state
        videoContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;

        let attempts = 0;
        const maxAttempts = YOUTUBE_CONFIG.getKeyCount();
        let lastError = null;

        while (attempts < maxAttempts) {
            try {
                const apiKey = await YOUTUBE_CONFIG.getAPIKey();
                console.log(`Attempt ${attempts + 1}/${maxAttempts} with API key index: ${YOUTUBE_CONFIG.getCurrentKeyIndex()}`);

                const response = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&regionCode=${region}&maxResults=24&key=${apiKey}`);
                
                if (response.status === 403) {
                    console.log('API key quota exceeded, marking key as failed and trying next key...');
                    YOUTUBE_CONFIG.markKeyAsFailed(YOUTUBE_CONFIG.getCurrentKeyIndex());
                    lastError = 'API key quota exceeded';
                    attempts++;
                    continue;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('API response received:', data);
                if (data.items && data.items.length > 0) {
                    // Filter trending to pelikula/movie only
                    let filteredItems = data.items.filter(itemMatchesKaraokeOrVideoke);
                    console.log('Found', data.items.length, 'videos, filtered to', filteredItems.length);

                    // Strict mode: if no matches, fetch a random pelikula/movie set
                    if (!filteredItems || filteredItems.length === 0) {
                        console.log('No pelikula/movie matches in trending; loading random pelikula/movie videos...');
                        await fetchRandomKaraokeVideos(region);
                        return;
                    }

                    // Track list with trending results only when we are actually showing trending
                    appState.currentList = filteredItems.map(v => v.id?.videoId || v.id).filter(Boolean);
                    appState.currentIndex = -1;
                    displayVideos(filteredItems);
                    return; // Success, exit the function
                } else {
                    console.log('No videos found in API response');
                }
            } catch (error) {
                console.error('Error with current API key:', error);
                lastError = error.message;
                attempts++;
            }
        }

        // If we get here, all attempts failed
        throw new Error(`Failed to fetch videos after ${maxAttempts} attempts. Last error: ${lastError}`);
    } catch (error) {
        console.error('Error fetching trending videos:', error);
        const videoContainer = document.getElementById('video-container');
        if (videoContainer) {
            // Show error message with debug info
            videoContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load videos. Please try again later.</p>
                    <p><small>Error: ${error.message}</small></p>
                    <button onclick="fetchTrendingVideos('${region}')" class="retry-button">
                        Retry
                    </button>
                    <button onclick="testVideoLoading()" class="retry-button">
                        Debug
                    </button>
                </div>
            `;
        }
    }
}

// Fallback: fetch random pelikula/movie videos when trending has no strict matches
async function fetchRandomKaraokeVideos(region = 'GB') {
    try {
        const videoContainer = document.getElementById('video-container');
        if (!videoContainer) return;
        videoContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;

        let attempts = 0;
        const maxAttempts = Math.min(5, YOUTUBE_CONFIG.getKeyCount());
        let lastError = null;

        // Build a random pelikula query seed
        const seeds = ['pelikula', 'movie', 'movie hits', 'OPM pelikula', 'instrumental movie'];
        const seed = seeds[Math.floor(Math.random() * seeds.length)];

        while (attempts < maxAttempts) {
            try {
                const apiKey = await YOUTUBE_CONFIG.getAPIKey();
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&q=${encodeURIComponent(seed)}&type=video&key=${apiKey}`);

                if (response.status === 403) {
                    YOUTUBE_CONFIG.markKeyAsFailed(YOUTUBE_CONFIG.getCurrentKeyIndex());
                    lastError = 'API key quota exceeded';
                    attempts++;
                    continue;
                }
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const filtered = (data.items || []).filter(itemMatchesKaraokeOrVideoke);
                appState.currentList = filtered.map(i => i.id?.videoId).filter(Boolean);
                appState.currentIndex = -1;

                // Convert search result format to video format expected by displayVideos
                const videos = filtered.map(item => ({ id: item.id.videoId, snippet: item.snippet }));
                displayVideos(videos);
                return;
            } catch (err) {
                lastError = err.message;
                attempts++;
            }
        }

        // If all attempts fail, show no results state
        videoContainer.innerHTML = '<div class="no-results">No videos available</div>';
    } catch (_) {
        const videoContainer = document.getElementById('video-container');
        if (videoContainer) {
            videoContainer.innerHTML = '<div class="no-results">No videos available</div>';
        }
    }
}

function createVideoCard(video) {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    videoCard.setAttribute('itemscope', '');
    videoCard.setAttribute('itemtype', 'http://schema.org/VideoObject');
    
    videoCard.innerHTML = `
        <div class="thumbnail" onclick="playVideo('${video.id}')">
            <img src="${video.snippet.thumbnails.medium.url}" 
                 alt="${escapeHtml(video.snippet.title)}"
                 itemprop="thumbnailUrl">
            <div class="play-button">
                <i class="fas fa-play"></i>
            </div>
        </div>
        <div class="video-info">
            <div class="channel-icon">
                <img alt="${escapeHtml(video.snippet.channelTitle)}" itemprop="author">
            </div>
            <div class="details">
                <h3 itemprop="name">${escapeHtml(video.snippet.title)}</h3>
                <meta itemprop="uploadDate" content="${video.snippet.publishedAt}">
                <span class="channel-name" itemprop="author">${escapeHtml(video.snippet.channelTitle)}</span>
                <div class="video-meta">
                    <span class="views" itemprop="interactionCount">Loading views...</span>
                    <span class="separator">•</span>
                    <span class="time">${formatTimeAgo(video.snippet.publishedAt)}</span>
                </div>
                <meta itemprop="description" content="${escapeHtml(video.snippet.description || '')}">
            </div>
        </div>
    `;
    
    // Fetch additional video data
    fetchVideoStatistics(video.id, videoCard);
    fetchChannelIcon(video.snippet.channelId, videoCard);
    
    return videoCard;
}

// Create search result card for queue
function createSearchResultCard(item) {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.dataset.videoId = item.id.videoId;
    
    const thumbnailUrl = item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || 'images/placeholder.jpg';
    const isInQueue = appState.videoQueue.some(v => v.videoId === item.id.videoId);
    const isQueueFull = appState.videoQueue.length >= 7;
    
    card.innerHTML = `
        <img src="${thumbnailUrl}" 
             alt="${escapeHtml(item.snippet.title)}"
             class="search-result-thumbnail"
             onerror="this.src='images/placeholder.jpg'">
        <div class="search-result-title">${escapeHtml(item.snippet.title)}</div>
        <div class="search-result-channel">${escapeHtml(item.snippet.channelTitle)}</div>
        <div class="search-result-actions">
            <button class="add-to-queue-btn" 
                    ${isInQueue || isQueueFull ? 'disabled' : ''}
                    data-video-id="${item.id.videoId}">
                <i class="fas fa-plus"></i>
                ${isInQueue ? 'In Queue' : isQueueFull ? 'Queue Full' : 'Add to Queue'}
            </button>
            <button class="play-now-btn" data-video-id="${item.id.videoId}">
                <i class="fas fa-play"></i>
                Play Now
            </button>
        </div>
    `;
    
    // Add event listeners
    const addToQueueBtn = card.querySelector('.add-to-queue-btn');
    const playNowBtn = card.querySelector('.play-now-btn');
    
    addToQueueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!addToQueueBtn.disabled) {
            const videoData = {
                videoId: item.id.videoId,
                title: item.snippet.title,
                channelTitle: item.snippet.channelTitle,
                thumbnail: thumbnailUrl,
                publishedAt: item.snippet.publishedAt
            };
            
            if (addToVideoQueue(videoData)) {
                // Update button appearance
                addToQueueBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
                addToQueueBtn.disabled = true;
                addToQueueBtn.style.background = '#28a745';
                addToQueueBtn.style.color = 'white';
                addToQueueBtn.style.cursor = 'not-allowed';
                
                // Update all queue displays
                updateQueueDisplay();
                updateMiniQueueDisplay();
                updateSidebarQueueDisplay();
                
                console.log('Video added to queue:', videoData.title);
            } else {
                console.log('Failed to add video to queue');
            }
        }
    });
    
    playNowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playVideo(item.id.videoId);
    });
    
    return card;
}

// Update queue display
function updateQueueDisplay() {
    const queueContainer = document.getElementById('video-queue');
    const queueCount = document.getElementById('queue-count');
    
    if (!queueContainer || !queueCount) return;
    
    queueCount.textContent = `${appState.videoQueue.length}/7`;
    
    if (appState.videoQueue.length === 0) {
        queueContainer.innerHTML = `
            <div class="queue-empty">
                <i class="fas fa-list-ul"></i>
                <p>No videos reserved yet</p>
                <small>Search and click the + button to reserve videos</small>
            </div>
        `;
    } else {
        queueContainer.innerHTML = '';
        appState.videoQueue.forEach((video, index) => {
            const queueItem = document.createElement('div');
            queueItem.className = 'queue-item';
            queueItem.dataset.videoId = video.videoId;
            
            queueItem.innerHTML = `
                <img src="${video.thumbnail}" 
                     alt="${escapeHtml(video.title)}"
                     class="queue-item-thumbnail"
                     onerror="this.src='images/placeholder.jpg'">
                <div class="queue-item-info">
                    <div class="queue-item-title">${escapeHtml(video.title)}</div>
                    <div class="queue-item-channel">${escapeHtml(video.channelTitle)}</div>
                </div>
                <div class="queue-item-actions">
                    <button class="queue-action-btn play" title="Play Now" data-video-id="${video.videoId}">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="queue-action-btn remove" title="Remove from Queue" data-video-id="${video.videoId}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Add event listeners
            const playBtn = queueItem.querySelector('.play');
            const removeBtn = queueItem.querySelector('.remove');
            
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                playVideo(video.videoId);
            });
            
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromVideoQueue(video.videoId);
            });
            
            queueContainer.appendChild(queueItem);
        });
    }
    
    // Also update mini queue display
    updateMiniQueueDisplay();
    // Also update sidebar queue display
    updateSidebarQueueDisplay();
    // Update mobile queue badge
    updateMobileQueueBadge();
}

// Sidebar Search Functions
async function searchVideosForSidebar(query) {
    console.log('searchVideosForSidebar called with query:', query);
    try {
        const sidebarResultsContainer = document.getElementById('sidebar-search-results');
        if (!sidebarResultsContainer) {
            console.error('Sidebar results container not found');
            return;
        }
        console.log('Sidebar results container found:', sidebarResultsContainer);

        // Show loading in sidebar search results
        sidebarResultsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;
        sidebarResultsContainer.classList.remove('hidden');

        let attempts = 0;
        const maxAttempts = YOUTUBE_CONFIG.getKeyCount();
        let lastError = null;

        while (attempts < maxAttempts) {
            try {
                const apiKey = await YOUTUBE_CONFIG.getAPIKey();
                console.log(`Sidebar search attempt ${attempts + 1}/${maxAttempts} with API key index: ${YOUTUBE_CONFIG.getCurrentKeyIndex()}`);

                // Ensure sidebar searches include pelikula/movie terms by default
                const normalized = (query || '').trim();
                const hasKaraoke = /(pelikula|movie)/i.test(normalized);
                const enforcedQuery = hasKaraoke ? normalized : `${normalized} pelikula movie`;
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(enforcedQuery)}&type=video&key=${apiKey}`);
                
                if (response.status === 403) {
                    console.log('API key quota exceeded, marking key as failed and trying next key...');
                    YOUTUBE_CONFIG.markKeyAsFailed(YOUTUBE_CONFIG.getCurrentKeyIndex());
                    lastError = 'API key quota exceeded';
                    attempts++;
                    continue;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                // Clear loading state
                sidebarResultsContainer.innerHTML = '';
                
                // Process and display search results for sidebar (strict title filter)
                if (data.items && data.items.length > 0) {
                    const filtered = data.items.filter(itemMatchesKaraokeOrVideoke);
                    if (filtered.length === 0) {
                        sidebarResultsContainer.innerHTML = '<div class="no-results">No videos found</div>';
                    } else {
                        filtered.forEach(item => {
                            const sidebarSearchCard = createSidebarSearchCard(item);
                            sidebarResultsContainer.appendChild(sidebarSearchCard);
                        });
                    }
                } else {
                    sidebarResultsContainer.innerHTML = '<div class="no-results">No videos found</div>';
                }
                
                return; // Success, exit the function
            } catch (error) {
                console.error('Error with current API key:', error);
                lastError = error.message;
                attempts++;
            }
        }

        // If we get here, all attempts failed
        throw new Error(`Failed to search videos after ${maxAttempts} attempts. Last error: ${lastError}`);

    } catch (error) {
        console.error('Sidebar search error:', error);
        const errorMessage = error.message === 'All API keys exhausted'
            ? 'Unable to perform search. Please try again later.'
            : 'Failed to search videos. Please try again.';
        
        const sidebarResultsContainer = document.getElementById('sidebar-search-results');
        if (sidebarResultsContainer) {
            sidebarResultsContainer.innerHTML = `
                <div class="error-message">
                    <p>${errorMessage}</p>
                    <button onclick="searchVideosForSidebar('${encodeURIComponent(query)}')" class="retry-button">
                        Retry Search
                    </button>
                </div>
            `;
        }
    }
}

// Create sidebar search result card
function createSidebarSearchCard(item) {
    const card = document.createElement('div');
    card.className = 'sidebar-search-result-card';
    card.dataset.videoId = item.id.videoId;
    
    const thumbnailUrl = item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || 'images/placeholder.jpg';
    const isInQueue = appState.videoQueue.some(v => v.videoId === item.id.videoId);
    const isQueueFull = appState.videoQueue.length >= 7;
    
    card.innerHTML = `
        <img src="${thumbnailUrl}" 
             alt="${escapeHtml(item.snippet.title)}"
             class="sidebar-search-result-thumbnail"
             onerror="this.src='images/placeholder.jpg'">
        <div class="sidebar-search-result-title">${escapeHtml(item.snippet.title)}</div>
        <div class="sidebar-search-result-channel">${escapeHtml(item.snippet.channelTitle)}</div>
        <div class="sidebar-search-result-actions">
            <button class="sidebar-add-to-queue-btn" 
                    ${isInQueue || isQueueFull ? 'disabled' : ''}
                    data-video-id="${item.id.videoId}">
                <i class="fas fa-plus"></i>
                ${isInQueue ? 'In Queue' : isQueueFull ? 'Queue Full' : 'Add'}
            </button>
            <button class="sidebar-play-now-btn" data-video-id="${item.id.videoId}">
                <i class="fas fa-play"></i>
                Play
            </button>
        </div>
    `;
    
    // Add event listeners
    const addToQueueBtn = card.querySelector('.sidebar-add-to-queue-btn');
    const playNowBtn = card.querySelector('.sidebar-play-now-btn');
    
    addToQueueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!addToQueueBtn.disabled) {
            const videoData = {
                videoId: item.id.videoId,
                title: item.snippet.title,
                channelTitle: item.snippet.channelTitle,
                thumbnail: thumbnailUrl,
                publishedAt: item.snippet.publishedAt
            };
            
            if (addToVideoQueue(videoData)) {
                // Update button appearance
                addToQueueBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
                addToQueueBtn.disabled = true;
                addToQueueBtn.style.background = '#28a745';
                addToQueueBtn.style.color = 'white';
                addToQueueBtn.style.cursor = 'not-allowed';
                
                // Update all queue displays
                updateQueueDisplay();
                updateMiniQueueDisplay();
                updateSidebarQueueDisplay();
                
                console.log('Video added to queue:', videoData.title);
            } else {
                console.log('Failed to add video to queue');
            }
        }
    });
    
    playNowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playVideo(item.id.videoId);
    });
    
    return card;
}

// Update sidebar queue display
function updateSidebarQueueDisplay() {
    console.log('updateSidebarQueueDisplay called, queue length:', appState.videoQueue.length);
    const sidebarQueueContainer = document.getElementById('sidebar-video-queue');
    const sidebarQueueCount = document.getElementById('sidebar-queue-count');
    
    console.log('Sidebar elements found:', {
        container: !!sidebarQueueContainer,
        count: !!sidebarQueueCount
    });
    
    if (!sidebarQueueContainer || !sidebarQueueCount) {
        console.error('Sidebar queue elements not found!');
        return;
    }
    
    sidebarQueueCount.textContent = `${appState.videoQueue.length}/7`;
    console.log('Updated queue count to:', sidebarQueueCount.textContent);
    
    if (appState.videoQueue.length === 0) {
        console.log('Showing empty queue message');
        sidebarQueueContainer.innerHTML = `
            <div class="sidebar-queue-empty">
                <i class="fas fa-list-ul"></i>
                <p>No videos reserved</p>
                <small>Search and add videos to your queue</small>
            </div>
        `;
    } else {
        console.log('Showing queue items:', appState.videoQueue);
        sidebarQueueContainer.innerHTML = '';
        appState.videoQueue.forEach((video, index) => {
            console.log('Creating queue item for:', video.title);
            const sidebarQueueItem = document.createElement('div');
            sidebarQueueItem.className = 'sidebar-queue-item';
            sidebarQueueItem.dataset.videoId = video.videoId;
            
            sidebarQueueItem.innerHTML = `
                <img src="${video.thumbnail}" 
                     alt="${escapeHtml(video.title)}"
                     class="sidebar-queue-item-thumbnail"
                     onerror="this.src='images/placeholder.jpg'">
                <div class="sidebar-queue-item-info">
                    <div class="sidebar-queue-item-title">${escapeHtml(video.title)}</div>
                    <div class="sidebar-queue-item-channel">${escapeHtml(video.channelTitle)}</div>
                </div>
                <div class="sidebar-queue-item-actions">
                    <button class="sidebar-queue-action-btn play" title="Play Now" data-video-id="${video.videoId}">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="sidebar-queue-action-btn remove" title="Remove from Queue" data-video-id="${video.videoId}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Add event listeners
            const playBtn = sidebarQueueItem.querySelector('.play');
            const removeBtn = sidebarQueueItem.querySelector('.remove');
            
            console.log('Setting up sidebar queue item buttons for:', video.title);
            console.log('Play button found:', !!playBtn);
            console.log('Remove button found:', !!removeBtn);
            
            if (playBtn) {
                playBtn.addEventListener('click', (e) => {
                    console.log('Play button clicked for:', video.title);
                    e.stopPropagation();
                    playVideo(video.videoId);
                });
            } else {
                console.warn('Play button not found for video:', video.title);
            }
            
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    console.log('Remove button clicked for:', video.title);
                    e.stopPropagation();
                    removeFromVideoQueue(video.videoId);
                });
            } else {
                console.warn('Remove button not found for video:', video.title);
            }
            
            sidebarQueueContainer.appendChild(sidebarQueueItem);
        });
    }
}

// Add styles for error message and retry button
const style = document.createElement('style');
style.textContent = `
    .error-message {
        text-align: center;
        padding: 20px;
        color: var(--primary-color);
    }
    
    .retry-button {
        margin-top: 15px;
        padding: 8px 16px;
        background: var(--hover-color);
        border: none;
        border-radius: 20px;
        color: var(--primary-color);
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .retry-button:hover {
        background: var(--border-color);
    }
`;
document.head.appendChild(style);

async function fetchRecommendedVideos() {
    return fetchTrendingVideos('US');
}

// Fetch related video IDs for a given video
async function fetchRelatedVideoIds(videoId, maxResults = 10) {
    try {
        const apiKey = await YOUTUBE_CONFIG.getAPIKey();
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&type=video&relatedToVideoId=${encodeURIComponent(videoId)}&key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const ids = (data.items || [])
            .map(it => it.id && it.id.videoId)
            .filter(Boolean);
        return ids;
    } catch (e) {
        console.warn('Failed to fetch related videos:', e);
        return [];
    }
}

async function searchVideos(query) {
    try {
        const videoContainer = document.getElementById('video-container');
        if (!videoContainer) return;

        showLoading();
        videoContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;

        let attempts = 0;
        const maxAttempts = YOUTUBE_CONFIG.getKeyCount();
        let lastError = null;

        while (attempts < maxAttempts) {
            try {
                const apiKey = await YOUTUBE_CONFIG.getAPIKey();
                console.log(`Search attempt ${attempts + 1}/${maxAttempts} with API key index: ${YOUTUBE_CONFIG.getCurrentKeyIndex()}`);

                // Ensure query targets pelikula/movie if user didn't include it
                const normalized = (query || '').trim();
                const hasKaraoke = /(pelikula|movie)/i.test(normalized);
                const enforcedQuery = hasKaraoke ? normalized : `${normalized} pelikula`;
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&q=${encodeURIComponent(enforcedQuery)}&type=video&key=${apiKey}`);
                
                if (response.status === 403) {
                    console.log('API key quota exceeded, marking key as failed and trying next key...');
                    YOUTUBE_CONFIG.markKeyAsFailed(YOUTUBE_CONFIG.getCurrentKeyIndex());
                    lastError = 'API key quota exceeded';
                    attempts++;
                    continue;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                // Clear loading state
                videoContainer.innerHTML = '';
                
                // Create video grid
                const videoGrid = document.createElement('div');
                videoGrid.className = 'video-grid';
                
                // Process and display search results
                if (data.items && data.items.length > 0) {
                    const filtered = data.items.filter(itemMatchesKaraokeOrVideoke);
                    // Track current list from search results (by ID) for correct autoplay order
                    appState.currentList = filtered
                        .map(item => item && item.id && item.id.videoId)
                        .filter(Boolean);
                    appState.currentIndex = -1;
                    filtered.forEach(item => {
                        // Convert search result format to video format
                        const video = {
                            id: item.id.videoId,
                            snippet: item.snippet
                        };
                        const videoCard = createVideoCard(video);
                        videoGrid.appendChild(videoCard);
                    });
                    videoContainer.appendChild(videoGrid);
                } else {
                    videoContainer.innerHTML = '<div class="no-results">No videos found</div>';
                }
                
                hideLoading();
                return; // Success, exit the function
            } catch (error) {
                console.error('Error with current API key:', error);
                lastError = error.message;
                attempts++;
            }
        }

        // If we get here, all attempts failed
        throw new Error(`Failed to search videos after ${maxAttempts} attempts. Last error: ${lastError}`);

    } catch (error) {
        console.error('Search error:', error);
        hideLoading();
        const errorMessage = error.message === 'All API keys exhausted'
            ? 'Unable to perform search. Please try again later.'
            : 'Failed to search videos. Please try again.';
        
        if (videoContainer) {
            videoContainer.innerHTML = `
                <div class="error-message">
                    <p>${errorMessage}</p>
                    <button onclick="searchVideos('${encodeURIComponent(query)}')" class="retry-button">
                        Retry Search
                    </button>
                </div>
            `;
        }
    }
}

// Video Search for Queue (separate from main search)
async function searchVideosForQueue(query) {
    try {
        const searchResultsContainer = document.getElementById('search-results');
        if (!searchResultsContainer) return;

        // Show loading in search results
        searchResultsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;
        searchResultsContainer.classList.remove('hidden');

        let attempts = 0;
        const maxAttempts = YOUTUBE_CONFIG.getKeyCount();
        let lastError = null;

        while (attempts < maxAttempts) {
            try {
                const apiKey = await YOUTUBE_CONFIG.getAPIKey();
                console.log(`Queue search attempt ${attempts + 1}/${maxAttempts} with API key index: ${YOUTUBE_CONFIG.getCurrentKeyIndex()}`);

                const normalized = (query || '').trim();
                const hasKaraoke = /(pelikula|movie)/i.test(normalized);
                const enforcedQuery = hasKaraoke ? normalized : `${normalized} pelikula`;
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(enforcedQuery)}&type=video&key=${apiKey}`);
                
                if (response.status === 403) {
                    console.log('API key quota exceeded, marking key as failed and trying next key...');
                    YOUTUBE_CONFIG.markKeyAsFailed(YOUTUBE_CONFIG.getCurrentKeyIndex());
                    lastError = 'API key quota exceeded';
                    attempts++;
                    continue;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                // Clear loading state
                searchResultsContainer.innerHTML = '';
                
                // Process and display search results for queue
                if (data.items && data.items.length > 0) {
                    const filtered = data.items.filter(itemMatchesKaraokeOrVideoke);
                    appState.searchResults = filtered;
                    filtered.forEach(item => {
                        const searchResultCard = createSearchResultCard(item);
                        searchResultsContainer.appendChild(searchResultCard);
                    });
                } else {
                    searchResultsContainer.innerHTML = '<div class="no-results">No videos found</div>';
                }
                
                return; // Success, exit the function
            } catch (error) {
                console.error('Error with current API key:', error);
                lastError = error.message;
                attempts++;
            }
        }

        // If we get here, all attempts failed
        throw new Error(`Failed to search videos after ${maxAttempts} attempts. Last error: ${lastError}`);

    } catch (error) {
        console.error('Queue search error:', error);
        const errorMessage = error.message === 'All API keys exhausted'
            ? 'Unable to perform search. Please try again later.'
            : 'Failed to search videos. Please try again.';
        
        const searchResultsContainer = document.getElementById('search-results');
        if (searchResultsContainer) {
            searchResultsContainer.innerHTML = `
                <div class="error-message">
                    <p>${errorMessage}</p>
                    <button onclick="searchVideosForQueue('${encodeURIComponent(query)}')" class="retry-button">
                        Retry Search
                    </button>
                </div>
            `;
        }
    }
}

// Overlay Search Functions
async function searchVideosForOverlay(query) {
    try {
        const overlayResultsContainer = document.getElementById('overlay-search-results');
        if (!overlayResultsContainer) return;

        // Show loading in overlay search results
        overlayResultsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;
        overlayResultsContainer.classList.remove('hidden');

        let attempts = 0;
        const maxAttempts = YOUTUBE_CONFIG.getKeyCount();
        let lastError = null;

        while (attempts < maxAttempts) {
            try {
                const apiKey = await YOUTUBE_CONFIG.getAPIKey();
                console.log(`Overlay search attempt ${attempts + 1}/${maxAttempts} with API key index: ${YOUTUBE_CONFIG.getCurrentKeyIndex()}`);

                const normalized = (query || '').trim();
                const hasKaraoke = /(pelikula|movie)/i.test(normalized);
                const enforcedQuery = hasKaraoke ? normalized : `${normalized} pelikula`;
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(enforcedQuery)}&type=video&key=${apiKey}`);
                
                if (response.status === 403) {
                    console.log('API key quota exceeded, marking key as failed and trying next key...');
                    YOUTUBE_CONFIG.markKeyAsFailed(YOUTUBE_CONFIG.getCurrentKeyIndex());
                    lastError = 'API key quota exceeded';
                    attempts++;
                    continue;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                // Clear loading state
                overlayResultsContainer.innerHTML = '';
                
                // Process and display search results for overlay
                if (data.items && data.items.length > 0) {
                    const filtered = data.items.filter(itemMatchesKaraokeOrVideoke);
                    filtered.forEach(item => {
                        const overlaySearchCard = createOverlaySearchCard(item);
                        overlayResultsContainer.appendChild(overlaySearchCard);
                    });
                } else {
                    overlayResultsContainer.innerHTML = '<div class="no-results">No videos found</div>';
                }
                
                return; // Success, exit the function
            } catch (error) {
                console.error('Error with current API key:', error);
                lastError = error.message;
                attempts++;
            }
        }

        // If we get here, all attempts failed
        throw new Error(`Failed to search videos after ${maxAttempts} attempts. Last error: ${lastError}`);

    } catch (error) {
        console.error('Overlay search error:', error);
        const errorMessage = error.message === 'All API keys exhausted'
            ? 'Unable to perform search. Please try again later.'
            : 'Failed to search videos. Please try again.';
        
        const overlayResultsContainer = document.getElementById('overlay-search-results');
        if (overlayResultsContainer) {
            overlayResultsContainer.innerHTML = `
                <div class="error-message">
                    <p>${errorMessage}</p>
                    <button onclick="searchVideosForOverlay('${encodeURIComponent(query)}')" class="retry-button">
                        Retry Search
                    </button>
                </div>
            `;
        }
    }
}

// Create overlay search result card
function createOverlaySearchCard(item) {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.dataset.videoId = item.id.videoId;
    
    const thumbnailUrl = item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || 'images/placeholder.jpg';
    const isInQueue = appState.videoQueue.some(v => v.videoId === item.id.videoId);
    const isQueueFull = appState.videoQueue.length >= 7;
    
    card.innerHTML = `
        <img src="${thumbnailUrl}" 
             alt="${escapeHtml(item.snippet.title)}"
             class="search-result-thumbnail"
             onerror="this.src='images/placeholder.jpg'">
        <div class="search-result-title">${escapeHtml(item.snippet.title)}</div>
        <div class="search-result-channel">${escapeHtml(item.snippet.channelTitle)}</div>
        <div class="search-result-actions">
            <button class="add-to-queue-btn" 
                    ${isInQueue || isQueueFull ? 'disabled' : ''}
                    data-video-id="${item.id.videoId}">
                <i class="fas fa-plus"></i>
                ${isInQueue ? 'In Queue' : isQueueFull ? 'Queue Full' : 'Add to Queue'}
            </button>
            <button class="play-now-btn" data-video-id="${item.id.videoId}">
                <i class="fas fa-play"></i>
                Play Now
            </button>
        </div>
    `;
    
    // Add event listeners
    const addToQueueBtn = card.querySelector('.add-to-queue-btn');
    const playNowBtn = card.querySelector('.play-now-btn');
    
    addToQueueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!addToQueueBtn.disabled) {
            const videoData = {
                videoId: item.id.videoId,
                title: item.snippet.title,
                channelTitle: item.snippet.channelTitle,
                thumbnail: thumbnailUrl,
                publishedAt: item.snippet.publishedAt
            };
            
            if (addToVideoQueue(videoData)) {
                // Update button appearance
                addToQueueBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
                addToQueueBtn.disabled = true;
                addToQueueBtn.style.background = '#28a745';
                addToQueueBtn.style.color = 'white';
                addToQueueBtn.style.cursor = 'not-allowed';
                
                // Update all queue displays
                updateQueueDisplay();
                updateMiniQueueDisplay();
                updateSidebarQueueDisplay();
                
                console.log('Video added to queue:', videoData.title);
            } else {
                console.log('Failed to add video to queue');
            }
        }
    });
    
    playNowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playVideo(item.id.videoId);
        closeSearchOverlay(); // Close overlay when playing video
    });
    
    return card;
}

// Search Overlay Functions
function showSearchOverlay(query = '') {
    const searchOverlay = document.getElementById('search-overlay');
    if (searchOverlay) {
        searchOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        // Pre-populate and focus on search input
        const searchInput = document.getElementById('overlay-search-input');
        if (searchInput) {
            searchInput.value = query;
            setTimeout(() => searchInput.focus(), 100);
        }
    }
}

function closeSearchOverlay() {
    const searchOverlay = document.getElementById('search-overlay');
    if (searchOverlay) {
        searchOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
        // Clear search results
        const overlayResults = document.getElementById('overlay-search-results');
        if (overlayResults) {
            overlayResults.innerHTML = '';
            overlayResults.classList.add('hidden');
        }
        // Clear search input
        const searchInput = document.getElementById('overlay-search-input');
        if (searchInput) {
            searchInput.value = '';
        }
    }
}

// Voice Search Functionality
class VoiceSearch {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.currentInput = null;
        this.initSpeechRecognition();
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateButtonStates();
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (this.currentInput) {
                    this.currentInput.value = transcript;
                    // Trigger search if it's a search input
                    if (this.currentInput.id === 'sidebar-search-input') {
                        searchVideosForSidebar(transcript);
                    } else if (this.currentInput.id === 'overlay-search-input') {
                        // Trigger overlay search
                        const searchBtn = document.getElementById('overlay-search-btn');
                        if (searchBtn) searchBtn.click();
                    } else {
                        // Main search
                        const searchBtn = document.querySelector('.search-box button:last-child');
                        if (searchBtn) searchBtn.click();
                    }
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopListening();
            };

            this.recognition.onend = () => {
                this.stopListening();
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
        }
    }

    startListening(inputElement) {
        if (!this.recognition) {
            alert('Voice search is not supported in your browser. Please use Chrome or Edge.');
            return;
        }

        if (this.isListening) {
            this.stopListening();
            return;
        }

        this.currentInput = inputElement;
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
        }
    }

    stopListening() {
        this.isListening = false;
        this.currentInput = null;
        this.updateButtonStates();
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    updateButtonStates() {
        const buttons = document.querySelectorAll('.voice-search-btn');
        buttons.forEach(button => {
            if (this.isListening) {
                button.classList.add('recording');
                button.title = 'Stop Recording';
            } else {
                button.classList.remove('recording');
                button.title = 'Voice Search';
            }
        });
    }
}

// Initialize voice search
const voiceSearch = new VoiceSearch();

// Add event listeners for search
document.addEventListener('DOMContentLoaded', function() {
    // Existing search listeners
    const searchInput = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button:last-child');

    // Video search for queue listeners (removed - now using sidebar search)

    // Voice search listeners
    const voiceSearchButtons = document.querySelectorAll('.voice-search-btn');
    voiceSearchButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Find the associated input field
            let inputElement = null;
            if (button.classList.contains('sidebar-voice-btn')) {
                inputElement = document.getElementById('sidebar-search-input');
            } else if (button.classList.contains('overlay-voice-btn')) {
                inputElement = document.getElementById('overlay-search-input');
            } else {
                // Main search box
                inputElement = document.querySelector('.search-box input');
            }
            
            if (inputElement) {
                voiceSearch.startListening(inputElement);
            }
        });
    });

    // Overlay search listeners
    const overlaySearchInput = document.getElementById('overlay-search-input');
    const overlaySearchButton = document.getElementById('overlay-search-btn');
    const searchQueueBtn = document.querySelector('.search-queue-btn');
    const closeSearchOverlayBtn = document.getElementById('close-search-overlay');

    // Sidebar search listeners
    const sidebarSearchInput = document.getElementById('sidebar-search-input');
    const sidebarSearchButton = document.getElementById('sidebar-search-btn');

    // Sidebar search event listeners
    if (sidebarSearchButton && sidebarSearchInput) {
        console.log('Setting up sidebar search listeners');
        sidebarSearchButton.addEventListener('click', () => {
            const query = sidebarSearchInput.value.trim();
            console.log('Sidebar search clicked with query:', query);
            if (query) {
                searchVideosForSidebar(query);
            }
        });

        sidebarSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = sidebarSearchInput.value.trim();
                console.log('Sidebar search enter pressed with query:', query);
                if (query) {
                    searchVideosForSidebar(query);
                }
            }
        });
    } else {
        console.log('Sidebar search elements not found:', {
            button: !!sidebarSearchButton,
            input: !!sidebarSearchInput
        });
    }

    // Add region selector listener
    const regionSelect = document.getElementById('region-select');
    if (regionSelect) {
        regionSelect.addEventListener('change', (e) => {
            const selectedRegion = e.target.value;
            console.log('Region changed to:', selectedRegion);
            // Close video player if open
            closeVideoPlayer();
            // Fetch videos for selected region
            fetchTrendingVideos(selectedRegion);
        });
    }

    // Add logo click handler
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Close video player if open
            closeVideoPlayer();
            // Load trending videos
            fetchTrendingVideos('US');
        });
    }

    // Add back button listener
    const backButton = document.getElementById('back-to-home');
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            console.log('Back button clicked');
            e.preventDefault();
            e.stopPropagation();
            closeVideoPlayer();
            // Optionally refresh the video list
            fetchTrendingVideos('US');
        });
        
        // Add debugging info
        console.log('Back button element:', backButton);
        console.log('Back button styles:', backButton ? getComputedStyle(backButton) : 'Not found');
    } else {
        console.warn('Back button not found!');
    }

    // Note: close-player button removed - using back-to-home button instead

    // Existing search listeners
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                searchVideos(query);
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    searchVideos(query);
                }
            }
        });
    }

    // Video search for queue listeners (removed - now using sidebar search)

    // Player search listeners (removed - no longer needed)

    // Overlay search listeners
    if (closeSearchOverlayBtn) {
        closeSearchOverlayBtn.addEventListener('click', () => {
            closeSearchOverlay();
        });
    }

    if (overlaySearchButton && overlaySearchInput) {
        overlaySearchButton.addEventListener('click', () => {
            const query = overlaySearchInput.value.trim();
            if (query) {
                searchVideosForOverlay(query);
            }
        });

        overlaySearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = overlaySearchInput.value.trim();
                if (query) {
                    searchVideosForOverlay(query);
                }
            }
        });
    }

    // Close overlay when clicking outside
    const searchOverlay = document.getElementById('search-overlay');
    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                closeSearchOverlay();
            }
        });
    }

    // Mobile menu functionality
	const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
	const mobileSearchToggle = document.getElementById('mobile-search-toggle');
    const mobileQueueToggle = document.getElementById('mobile-queue-toggle');
    const mobileQueueBadge = document.getElementById('mobile-queue-badge');
    const sidebar = document.querySelector('.sidebar');
    const videoQueueSidebar = document.querySelector('.video-queue-sidebar');
    
    // Debug mobile elements
	console.log('Mobile elements found:', {
        menuToggle: !!mobileMenuToggle,
		searchToggle: !!mobileSearchToggle,
        queueToggle: !!mobileQueueToggle,
        queueBadge: !!mobileQueueBadge,
        sidebar: !!sidebar,
        videoQueueSidebar: !!videoQueueSidebar
    });

    // Mobile menu toggle (pointer-based, debounced)
    let __mobileMenuToggleBusy = false;
    let __lastMenuToggleAt = 0;
    if (mobileMenuToggle && sidebar) {
        const handleMenuPointerUp = (e) => {
            try {
                e.preventDefault();
                e.stopPropagation();
                if (__mobileMenuToggleBusy) return;
                __mobileMenuToggleBusy = true;
                __lastMenuToggleAt = Date.now();

                const willOpen = !sidebar.classList.contains('active');
                sidebar.classList.toggle('active');

                // Manage shared overlay and body scroll
                const overlay = document.getElementById('sidebar-overlay') || document.querySelector('.sidebar-overlay');
                if (overlay) {
                    if (willOpen) {
                        overlay.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    } else {
                        overlay.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }

                // Close queue sidebar if open
                if (videoQueueSidebar) {
                    videoQueueSidebar.classList.remove('active');
                }
                console.log('Mobile menu toggled');
            } catch (error) {
                console.error('Error toggling mobile menu:', error);
            } finally {
                setTimeout(() => { __mobileMenuToggleBusy = false; }, 350);
            }
        };
        mobileMenuToggle.addEventListener('pointerup', handleMenuPointerUp, { passive: false });
    } else {
        console.warn('Mobile menu toggle or sidebar not found');
    }

    // Mobile queue toggle
    if (mobileQueueToggle && videoQueueSidebar) {
        mobileQueueToggle.addEventListener('click', (e) => {
            try {
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = videoQueueSidebar.classList.contains('active');
                const isHidden = videoQueueSidebar.classList.contains('hidden');
                
                if (isHidden) {
                    // If sidebar is hidden, show it first
                    showSidebar();
                    // Then activate it for mobile
                    videoQueueSidebar.classList.add('active');
                    document.body.style.overflow = 'hidden';
                } else if (isActive) {
                    // Close the queue sidebar
                    videoQueueSidebar.classList.remove('active');
                    document.body.style.overflow = 'auto';
                } else {
                    // Open the queue sidebar
                    videoQueueSidebar.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    // Close main sidebar if open
                    if (sidebar) {
                        sidebar.classList.remove('active');
                    }
                }
                
                console.log('Mobile queue toggled, active:', !isActive, 'hidden:', isHidden);
            } catch (error) {
                console.error('Error toggling mobile queue:', error);
            }
        });
    } else {
        console.warn('Mobile queue toggle or video queue sidebar not found');
    }

	// Mobile search toggle -> open search overlay
	if (mobileSearchToggle) {
		mobileSearchToggle.addEventListener('click', (e) => {
			try {
				e.preventDefault();
				e.stopPropagation();
				const mainQuery = (searchInput && typeof searchInput.value === 'string') ? searchInput.value.trim() : '';
				showSearchOverlay(mainQuery);
				console.log('Mobile search toggled (overlay opened)');
			} catch (error) {
				console.error('Error toggling mobile search:', error);
			}
		});
	} else {
		console.warn('Mobile search toggle not found');
	}

    // Clear all queue button
    const clearAllQueueBtn = document.getElementById('clear-all-queue-btn');
    if (clearAllQueueBtn) {
        clearAllQueueBtn.addEventListener('click', (e) => {
            try {
                e.preventDefault();
                e.stopPropagation();
                
                if (appState.videoQueue.length === 0) {
                    console.log('Queue is already empty');
                    return;
                }
                
                // Show confirmation dialog
                const confirmed = confirm(`Are you sure you want to clear all ${appState.videoQueue.length} videos from your queue?`);
                
                if (confirmed) {
                    const videoCount = appState.videoQueue.length;
                    console.log('Clearing all videos from queue');
                    clearVideoQueue();
                    
                    // Show success message
                    showSuccessMessage(`Cleared ${videoCount} videos from queue`);
                }
            } catch (error) {
                console.error('Error clearing queue:', error);
            }
        });
    } else {
        console.warn('Clear all queue button not found');
    }

    // Hide sidebar button
    const hideSidebarBtn = document.getElementById('hide-sidebar-btn');
    if (hideSidebarBtn) {
        hideSidebarBtn.addEventListener('click', (e) => {
            try {
                e.preventDefault();
                e.stopPropagation();
                hideSidebar();
            } catch (error) {
                console.error('Error hiding sidebar:', error);
            }
        });
    } else {
        console.warn('Hide sidebar button not found');
    }

    // Show sidebar button
    const showSidebarBtn = document.getElementById('show-sidebar-btn');
    if (showSidebarBtn) {
        showSidebarBtn.addEventListener('click', (e) => {
            try {
                e.preventDefault();
                e.stopPropagation();
                showSidebar();
            } catch (error) {
                console.error('Error showing sidebar:', error);
            }
        });
    } else {
        console.warn('Show sidebar button not found');
    }

    // Close sidebars when clicking outside (ignore immediate clicks after toggling)
    document.addEventListener('click', (e) => {
        try {
            if (__lastMenuToggleAt && Date.now() - __lastMenuToggleAt < 350) {
                return; // avoid immediate close right after open
            }
            if (sidebar && mobileMenuToggle && !sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
                const overlay = document.getElementById('sidebar-overlay') || document.querySelector('.sidebar-overlay');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            if (videoQueueSidebar && mobileQueueToggle && !videoQueueSidebar.contains(e.target) && !mobileQueueToggle.contains(e.target)) {
                videoQueueSidebar.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        } catch (error) {
            console.error('Error handling click outside:', error);
        }
    });
    
    // Handle mobile queue sidebar close button
    if (videoQueueSidebar) {
        const queueHeader = videoQueueSidebar.querySelector('.queue-sidebar-header');
        if (queueHeader) {
            queueHeader.addEventListener('click', (e) => {
                // Check if click is on the close button (::after pseudo-element)
                const rect = queueHeader.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                
                // Close button is positioned at right: 15px, top: 10px with 30px width/height
                const closeButtonX = rect.width - 15 - 30; // right: 15px + width: 30px
                const closeButtonY = 10; // top: 10px
                
                if (clickX >= closeButtonX && clickX <= closeButtonX + 30 && 
                    clickY >= closeButtonY && clickY <= closeButtonY + 30) {
                    e.preventDefault();
                    e.stopPropagation();
                    videoQueueSidebar.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    console.log('Mobile queue sidebar closed via close button');
                }
            });
        }
    }

    // Functions are now defined at the top of the file

    // Debug queue initialization
    console.log('Initial queue from localStorage:', localStorage.getItem('videoQueue'));
    console.log('Parsed queue:', appState.videoQueue);
    console.log('Queue length on init:', appState.videoQueue.length);
    
    // Check if queue is corrupted or has invalid data
    if (!Array.isArray(appState.videoQueue)) {
        console.log('Queue is not an array, resetting...');
        appState.videoQueue = [];
        saveVideoQueue();
    }
    
    // Ensure queue doesn't exceed 7 items
    if (appState.videoQueue.length > 7) {
        console.log('Queue has more than 7 items, truncating...');
        appState.videoQueue = appState.videoQueue.slice(0, 7);
        saveVideoQueue();
    }

    // Initialize queue display
    updateQueueDisplay();
    updateMiniQueueDisplay();
    updateSidebarQueueDisplay();
    updateMobileQueueBadge();
    
    // Update clear all button state
    updateClearAllButtonState();
    
    // Update play next button state
    updatePlayNextButtonState();
    
    // Initialize sidebar visibility state
    if (appState.sidebarHidden) {
        hideSidebar();
    } else {
        showSidebar();
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Toggle sidebar (Ctrl/Cmd + B)
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            toggleSidebarVisibility();
        }
        
        // Play next video (Ctrl/Cmd + N)
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            playNextVideo();
        }
        
        // Close video player (Escape key)
        if (e.key === 'Escape') {
            const videoPlayerContainer = document.getElementById('video-player-container');
            if (videoPlayerContainer && !videoPlayerContainer.classList.contains('hidden')) {
                e.preventDefault();
                closeVideoPlayer();
            }
        }
    });

    // Smart TV Remote Control Navigation
    let currentFocusIndex = 0;
    let focusableElements = [];
    
    function updateFocusableElements() {
        focusableElements = Array.from(document.querySelectorAll(
            '.video-card, .control-button, .sidebar-add-to-queue-btn, .sidebar-play-now-btn, .search-box input, .voice-search-btn, .sidebar-search-input, .sidebar-search-btn, .sidebar-voice-btn, .clear-all-btn, .hide-sidebar-btn'
        )).filter(el => !el.disabled && !el.hidden && el.offsetParent !== null);
    }
    
    function setFocus(index) {
        if (focusableElements.length === 0) return;
        
        // Remove previous focus
        focusableElements.forEach(el => el.classList.remove('smart-tv-focused'));
        
        // Set new focus
        currentFocusIndex = Math.max(0, Math.min(index, focusableElements.length - 1));
        const focusedElement = focusableElements[currentFocusIndex];
        focusedElement.classList.add('smart-tv-focused');
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    function handleSmartTVNavigation(e) {
        // Only handle navigation on very large screens (Smart TV)
        if (window.innerWidth < 2560) return;
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                setFocus(currentFocusIndex - 1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                setFocus(currentFocusIndex + 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                setFocus(currentFocusIndex - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                setFocus(currentFocusIndex + 1);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                const focusedElement = focusableElements[currentFocusIndex];
                if (focusedElement) {
                    focusedElement.click();
                }
                break;
        }
    }
    
    // Initialize Smart TV navigation
    document.addEventListener('keydown', handleSmartTVNavigation);
    
    // Update focusable elements when content changes
    const observer = new MutationObserver(() => {
        updateFocusableElements();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Initialize on page load
    updateFocusableElements();
});

// Make functions globally available
window.searchVideos = searchVideos;
window.searchVideosForQueue = searchVideosForQueue;
window.searchVideosForOverlay = searchVideosForOverlay;
window.showSearchOverlay = showSearchOverlay;
window.closeSearchOverlay = closeSearchOverlay;
window.searchVideosForSidebar = searchVideosForSidebar;
window.updateSidebarQueueDisplay = updateSidebarQueueDisplay;
window.updateMobileQueueBadge = updateMobileQueueBadge;
window.updateMiniQueueDisplay = updateMiniQueueDisplay;
window.updateClearAllButtonState = updateClearAllButtonState;
window.clearVideoQueue = clearVideoQueue;
window.fetchTrendingVideos = fetchTrendingVideos;
window.playVideo = playVideo;
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.hideSidebar = hideSidebar;
window.showSidebar = showSidebar;
window.toggleSidebarVisibility = toggleSidebarVisibility;
window.playNextVideo = playNextVideo;
window.updatePlayNextButtonState = updatePlayNextButtonState;

// Debug function to check sidebar state
window.debugSidebar = function() {
    const videoQueueSidebar = document.querySelector('.video-queue-sidebar');
    const showSidebarBtn = document.getElementById('show-sidebar-btn');
    const hideSidebarBtn = document.getElementById('hide-sidebar-btn');
    
    console.log('=== Sidebar Debug Info ===');
    console.log('Sidebar element:', videoQueueSidebar);
    console.log('Show button element:', showSidebarBtn);
    console.log('Hide button element:', hideSidebarBtn);
    console.log('Sidebar classes:', videoQueueSidebar ? videoQueueSidebar.className : 'Not found');
    console.log('Show button classes:', showSidebarBtn ? showSidebarBtn.className : 'Not found');
    console.log('App state sidebarHidden:', appState.sidebarHidden);
    console.log('Show button display style:', showSidebarBtn ? getComputedStyle(showSidebarBtn).display : 'Not found');
    console.log('Show button visibility:', showSidebarBtn ? getComputedStyle(showSidebarBtn).visibility : 'Not found');
    console.log('Window width:', window.innerWidth);
    console.log('Is mobile:', window.innerWidth <= 768);
};

// Debug function to check video player close button
window.debugCloseButton = function() {
    const backButton = document.getElementById('back-to-home');
    const videoPlayerContainer = document.getElementById('video-player-container');
    
    console.log('=== Close Button Debug Info ===');
    console.log('Back button element:', backButton);
    console.log('Video player container:', videoPlayerContainer);
    console.log('Back button classes:', backButton ? backButton.className : 'Not found');
    console.log('Back button display style:', backButton ? getComputedStyle(backButton).display : 'Not found');
    console.log('Back button visibility:', backButton ? getComputedStyle(backButton).visibility : 'Not found');
    console.log('Back button z-index:', backButton ? getComputedStyle(backButton).zIndex : 'Not found');
    console.log('Back button pointer-events:', backButton ? getComputedStyle(backButton).pointerEvents : 'Not found');
    console.log('Video player hidden:', videoPlayerContainer ? videoPlayerContainer.classList.contains('hidden') : 'Not found');
};

// Debug function to check sidebar queue buttons
window.debugQueueButtons = function() {
    const queueItems = document.querySelectorAll('.sidebar-queue-item');
    console.log('=== Sidebar Queue Buttons Debug Info ===');
    console.log('Queue items found:', queueItems.length);
    
    queueItems.forEach((item, index) => {
        const playBtn = item.querySelector('.sidebar-queue-action-btn.play');
        const removeBtn = item.querySelector('.sidebar-queue-action-btn.remove');
        const videoId = item.dataset.videoId;
        
        console.log(`Item ${index + 1}:`, {
            videoId: videoId,
            playButton: !!playBtn,
            removeButton: !!removeBtn,
            playButtonClasses: playBtn ? playBtn.className : 'Not found',
            removeButtonClasses: removeBtn ? removeBtn.className : 'Not found',
            playButtonPointerEvents: playBtn ? getComputedStyle(playBtn).pointerEvents : 'Not found',
            removeButtonPointerEvents: removeBtn ? getComputedStyle(removeBtn).pointerEvents : 'Not found'
        });
    });
};

async function fetchVideoStatistics(videoId, videoCard) {
    try {
        const apiKey = await YOUTUBE_CONFIG.getAPIKey();
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch video statistics');
        }
        
        const data = await response.json();
        if (data.items && data.items[0]) {
            const stats = data.items[0].statistics;
            const viewCount = parseInt(stats.viewCount).toLocaleString();
            videoCard.querySelector('.views').textContent = `${viewCount} views`;
        }
    } catch (error) {
        console.error('Error fetching video statistics:', error);
        videoCard.querySelector('.views').textContent = 'Views unavailable';
    }
}

async function fetchChannelIcon(channelId, videoCard) {
    if (!channelId || !videoCard) {
        console.error('Missing channelId or videoCard element');
        return;
    }

    const channelIcon = videoCard.querySelector('.channel-icon img');
    if (!channelIcon) {
        console.error('Channel icon element not found');
        return;
    }

    // Set initial loading state
    channelIcon.classList.add('loading');
    channelIcon.src = 'images/default-channel.svg';

    try {
        const apiKey = await YOUTUBE_CONFIG.getAPIKey();
        const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.items?.[0]?.snippet?.thumbnails?.default?.url) {
            const iconUrl = data.items[0].snippet.thumbnails.default.url;
            
            // Create a new image to preload
            const tempImg = new Image();
            tempImg.onload = () => {
                channelIcon.src = iconUrl;
                channelIcon.classList.remove('loading');
                channelIcon.classList.add('loaded');
            };
            tempImg.onerror = () => {
                console.error('Failed to load channel icon:', iconUrl);
                channelIcon.src = 'images/default-channel.svg';
                channelIcon.classList.remove('loading');
            };
            tempImg.src = iconUrl;
        } else {
            throw new Error('No channel data found');
        }
    } catch (error) {
        console.error(`Error fetching channel icon for ${channelId}:`, error);
        channelIcon.src = 'images/default-channel.svg';
        channelIcon.classList.remove('loading');
    }
}

// Display Videos
function displayVideos(videos) {
    console.log(`Displaying ${videos?.length || 0} videos`);
    console.log('Videos data:', videos);

    // Do not override currentList here; it is set by the caller (search or trending)

    const videoContainer = document.getElementById('video-container');
    if (!videoContainer) {
        console.error('Video container not found');
        return;
    }
    console.log('Video container found for display:', videoContainer);

    if (!videos || videos.length === 0) {
        console.log('No videos to display, showing no-results message');
        videoContainer.innerHTML = '<div class="no-results">No videos available</div>';
        return;
    }

    console.log('Starting to create video cards...');

    // Clear existing content
    videoContainer.innerHTML = '';
    
    // Create video grid
    const videoGrid = document.createElement('div');
    videoGrid.className = 'video-grid';
    videoContainer.appendChild(videoGrid);

    videos.forEach((video, index) => {
        try {
            const videoData = video.snippet;
            const videoId = video.id?.videoId || video.id;
            if (!videoData || !videoId) {
                console.error(`Invalid video data at index ${index}:`, video);
                return;
            }

            const videoCard = document.createElement('div');
            videoCard.className = 'video-card';
            videoCard.dataset.videoId = videoId;
            videoCard.dataset.videoIndex = String(index);

            const thumbnailUrl = videoData.thumbnails?.medium?.url || videoData.thumbnails?.default?.url || 'images/placeholder.jpg';
            
            videoCard.innerHTML = `
                <div class="thumbnail">
                    <img src="${thumbnailUrl}" 
                         alt="${escapeHtml(videoData.title)}"
                         onerror="this.onerror=null; this.src='images/placeholder.jpg';">
                    <div class="duration"></div>
                    <div class="play-button">
                        <i class="material-icons">play_circle_filled</i>
                    </div>
                </div>
                <div class="video-info">
                    <div class="channel-icon">
                        <img src="images/default-channel.svg" alt="${escapeHtml(videoData.channelTitle)}" class="loading">
                    </div>
                    <div class="details">
                        <h3 title="${escapeHtml(videoData.title)}">${escapeHtml(videoData.title)}</h3>
                        <p class="channel-name">${escapeHtml(videoData.channelTitle)}</p>
                        <p class="views-time">
                            <span class="views">Loading...</span> • 
                            <span class="time">${formatDate(videoData.publishedAt)}</span>
                        </p>
                    </div>
                </div>
            `;
            
            // Add click handler
            videoCard.addEventListener('click', function() {
                const id = this.dataset.videoId;
                const idx = parseInt(this.dataset.videoIndex, 10);
                console.log('Video clicked:', id, 'index:', idx);
                if (typeof idx === 'number' && !isNaN(idx)) {
                    appState.currentIndex = idx;
                }
                if (id) {
                    playVideo(id);
                }
            });
            
            videoGrid.appendChild(videoCard);
            
            // Fetch additional data
            fetchVideoStatistics(videoId, videoCard);
            fetchChannelIcon(videoData.channelId, videoCard);
            
            console.log(`Video card created for: ${videoData.title}`);
        } catch (error) {
            console.error(`Error creating video card at index ${index}:`, error);
        }
    });
    
    console.log(`Finished creating ${videoGrid.children.length} video cards`);
    console.log('Video container final content:', videoContainer.innerHTML.substring(0, 200) + '...');
}
 

// Video Player
let player = null;
let playerReady = false;
const videoQueue = [];

// Video Player Controls
let isPlaying = false;
let currentVolume = 1;

function initializePlayerControls() {
    const playPauseBtn = document.querySelector('.play-pause');
    const backwardBtn = document.querySelector('.backward');
    const forwardBtn = document.querySelector('.forward');
    const volumeToggle = document.querySelector('.volume-toggle');
    const autoplayToggle = document.querySelector('.autoplay-toggle');
    const progressBar = document.querySelector('.progress-bar');
    const fullscreenBtn = document.querySelector('.fullscreen');
    const currentTimeDisplay = document.querySelector('.current-time');
    const totalTimeDisplay = document.querySelector('.total-time');
    const playerWrapper = document.querySelector('.player-wrapper');

    if (!playPauseBtn || !backwardBtn || !forwardBtn || !volumeToggle || !progressBar || !fullscreenBtn) {
        console.error('Player control elements not found');
        return;
    }
    
        // Prev/Next track buttons for playlist navigation
        const prevTrackBtn = document.querySelector('.prev-track');
        const nextTrackBtn = document.querySelector('.next-track');
    
        if (prevTrackBtn) {
            prevTrackBtn.addEventListener('click', () => {
                if (Array.isArray(appState.currentList) && appState.currentList.length > 0) {
                    let idx = typeof appState.currentIndex === 'number' ? appState.currentIndex : -1;
                    if (idx <= 0) return; // no previous
                    idx = idx - 1;
                    const prevId = appState.currentList[idx];
                    if (prevId) {
                        appState.currentIndex = idx;
                        playVideo(prevId);
                    }
                }
            });
        }
    
        if (nextTrackBtn) {
            nextTrackBtn.addEventListener('click', () => {
                if (Array.isArray(appState.currentList) && appState.currentList.length > 0) {
                    let idx = typeof appState.currentIndex === 'number' ? appState.currentIndex : -1;
                    const nextIdx = idx + 1;
                    if (nextIdx >= appState.currentList.length) return; // no next
                    const nextId = appState.currentList[nextIdx];
                    if (nextId) {
                        appState.currentIndex = nextIdx;
                        playVideo(nextId);
                    }
                }
            });
        }

    // Play/Pause
    playPauseBtn.addEventListener('click', () => {
        appState.userInteracted = true;
        if (player && player.unMute) {
            player.unMute();
            player.setVolume(100);
            currentVolume = 1;
            volumeToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
        if (isPlaying) {
            player.pauseVideo();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            player.playVideo();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    });

    // Forward/Backward (10 seconds)
    backwardBtn.addEventListener('click', () => {
        const currentTime = player.getCurrentTime();
        player.seekTo(currentTime - 10, true);
    });

    forwardBtn.addEventListener('click', () => {
        const currentTime = player.getCurrentTime();
        player.seekTo(currentTime + 10, true);
    });

    // Volume Control
    volumeToggle.addEventListener('click', () => {
        appState.userInteracted = true;
        if (currentVolume > 0) {
            player.setVolume(0);
            currentVolume = 0;
            volumeToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            if (player && player.unMute) player.unMute();
            player.setVolume(100);
            currentVolume = 1;
            volumeToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    });

    // Progress Bar
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        player.seekTo(pos * player.getDuration(), true);
    });

    // Fullscreen
    fullscreenBtn.addEventListener('click', () => {
        const playerWrapper = document.querySelector('.player-wrapper');
        if (!document.fullscreenElement) {
            playerWrapper.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // Clicking anywhere in the player area counts as interaction and unmutes
    if (playerWrapper) {
        playerWrapper.addEventListener('click', () => {
            appState.userInteracted = true;
            try {
                if (player && player.unMute) {
                    player.unMute();
                    player.setVolume(100);
                    currentVolume = 1;
                    if (volumeToggle) {
                        volumeToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                    }
                }
            } catch (_) {}
        }, { capture: true });
    }

    // Play Next button
    const playNextBtn = document.getElementById('play-next-btn');
    if (playNextBtn) {
        playNextBtn.addEventListener('click', () => {
            playNextVideo();
        });
    }

    // Autoplay toggle
    if (autoplayToggle) {
        const icon = autoplayToggle.querySelector('i');
        const setIcon = () => {
            if (appState.autoplayEnabled) {
                icon.classList.remove('fa-toggle-off');
                icon.classList.add('fa-toggle-on');
            } else {
                icon.classList.remove('fa-toggle-on');
                icon.classList.add('fa-toggle-off');
            }
        };
        setIcon();
        autoplayToggle.addEventListener('click', () => {
            appState.autoplayEnabled = !appState.autoplayEnabled;
            saveAutoplaySetting();
            setIcon();
        });
    }

    // Update time display
    setInterval(() => {
        if (player && player.getCurrentTime) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            
            currentTimeDisplay.textContent = formatTime(currentTime);
            totalTimeDisplay.textContent = formatTime(duration);
            
            // Update progress bar
            const progress = (currentTime / duration) * 100;
            document.querySelector('.progress-bar-fill').style.width = `${progress}%`;
        }
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Initialize YouTube Player
function initYouTubePlayer() {
    if (typeof YT === 'undefined' || !YT.Player) {
        console.log('YouTube IFrame API not ready, waiting...');
        setTimeout(initYouTubePlayer, 100);
        return;
    }

    if (player) {
        console.log('Player already initialized');
        return;
    }

    const playerDiv = document.getElementById('player');
    if (!playerDiv) {
        console.error('Player element not found');
        return;
    }

    console.log('Initializing YouTube player...');
    try {
        // Build playerVars and only set origin when served over http/https (not file://)
        const playerVars = {
            'playsinline': 1,
            'autoplay': 1,
            'enablejsapi': 1,
            'rel': 0,
            'modestbranding': 1,
            'showinfo': 0,
            'controls': 0
        };
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            playerVars.origin = window.location.origin;
            playerVars.widget_referrer = window.location.origin;
        }

        player = new YT.Player('player', {
            width: '100%',
            height: '100%',
            playerVars,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });

        // Initialize player controls
        const playerControls = document.querySelector('.player-controls');
        if (!playerControls) {
            console.log('Creating player controls...');
            const controls = document.createElement('div');
            controls.className = 'player-controls hidden';
            controls.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-bar-fill"></div>
                </div>
                <div class="controls-row">
                    <button class="control-btn backward" title="Backward 10 seconds">
                        <i class="fas fa-backward"></i>
                    </button>
                    <button class="control-btn play-pause" title="Play/Pause">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="control-btn forward" title="Forward 10 seconds">
                        <i class="fas fa-forward"></i>
                    </button>
                    <button class="control-btn volume-toggle" title="Toggle Volume">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <div class="time-display">
                        <span class="current-time">0:00</span>
                        <span>/</span>
                        <span class="total-time">0:00</span>
                    </div>
                    <button class="control-btn fullscreen" title="Toggle Fullscreen">
                        <i class="fas fa-expand"></i>
                    </button>
                </div>
            `;
            playerDiv.parentElement.appendChild(controls);
        }
    } catch (error) {
        console.error('Error initializing player:', error);
        setTimeout(initYouTubePlayer, 1000);
    }
}

function onYouTubeIframeAPIReady() {
    console.log('YouTube IFrame API Ready');
    initYouTubePlayer();
}

function showPlayerControls() {
    const controls = document.querySelector('.player-controls');
    if (controls) {
        controls.classList.remove('hidden');
    }
}

function hidePlayerControls() {
    const controls = document.querySelector('.player-controls');
    if (controls) {
        controls.classList.add('hidden');
    }
}

function onPlayerReady(event) {
    console.log('Player Ready Event:', event);
    playerReady = true;
    hideLoading();
    
    if (videoQueue.length > 0) {
        const nextVideo = videoQueue.shift();
        console.log('Playing queued video:', nextVideo);
        playVideo(nextVideo);
    }

    player = event.target;
    initializePlayerControls();
    showPlayerControls();

    // Start muted to allow autoplay, unmute after user interaction
    if (player && player.mute) {
        player.mute();
        currentVolume = 0;
        const volumeToggle = document.querySelector('.volume-toggle');
        if (volumeToggle) {
            volumeToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
        const resumeAudioOnFirstInteraction = () => {
            if (!appState.userInteracted) return;
            try {
                if (player && player.unMute) {
                    player.unMute();
                    player.setVolume(100);
                    currentVolume = 1;
                    if (volumeToggle) {
                        volumeToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                    }
                }
            } catch (_) {}
            document.removeEventListener('click', interactionHandler, true);
            document.removeEventListener('keydown', interactionHandler, true);
        };
        const interactionHandler = () => {
            appState.userInteracted = true;
            resumeAudioOnFirstInteraction();
        };
        document.addEventListener('click', interactionHandler, true);
        document.addEventListener('keydown', interactionHandler, true);
    }
}

function onPlayerStateChange(event) {
    console.log('Player State Change:', event.data);
    // If playback starts after user action, ensure unmuted and volume up
    if (event.data === YT.PlayerState.PLAYING && appState.userInteracted) {
        try {
            if (player && player.unMute) {
                player.unMute();
                player.setVolume(100);
                currentVolume = 1;
                const volumeToggle = document.querySelector('.volume-toggle');
                if (volumeToggle) {
                    volumeToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                }
            }
        } catch (_) {}
    }
    if (event.data === YT.PlayerState.ENDED) {
        // When video ends, if autoplay is enabled, check queue first
        if (appState.autoplayEnabled) {
            // First priority: Check if there are videos in the queue
            const nextQueuedVideo = getNextQueuedVideo();
            if (nextQueuedVideo) {
                console.log('Autoplaying queued video:', nextQueuedVideo.title);
                playVideo(nextQueuedVideo.videoId);
                updateQueueDisplay(); // Update display after removing from queue
                return;
            }
            
            // Second priority: Try related videos
            const currentId = appState.currentVideo;
            if (currentId) {
                fetchRelatedVideoIds(currentId, 10).then((relatedIds) => {
                    const uniqueNext = relatedIds.find(id => id && id !== currentId);
                    if (uniqueNext) {
                        console.log('Autoplaying related video:', uniqueNext);
                        playVideo(uniqueNext);
                        return;
                    }
                    // Fallback to next in currentList
                    if (Array.isArray(appState.currentList) && appState.currentList.length > 0) {
                        const nextIndex = (typeof appState.currentIndex === 'number' ? appState.currentIndex + 1 : 0);
                        if (nextIndex < appState.currentList.length) {
                            const nextVideoId = appState.currentList[nextIndex];
                            appState.currentIndex = nextIndex;
                            console.log('Autoplaying next in list:', nextVideoId, 'index:', nextIndex);
                            playVideo(nextVideoId);
                            return;
                        }
                    }
                    closeVideoPlayer();
                }).catch(() => {
                    // On error, fallback to next in list
                    if (Array.isArray(appState.currentList) && appState.currentList.length > 0) {
                        const nextIndex = (typeof appState.currentIndex === 'number' ? appState.currentIndex + 1 : 0);
                        if (nextIndex < appState.currentList.length) {
                            const nextVideoId = appState.currentList[nextIndex];
                            appState.currentIndex = nextIndex;
                            console.log('Autoplaying next in list (fallback):', nextVideoId, 'index:', nextIndex);
                            playVideo(nextVideoId);
                            return;
                        }
                    }
                    closeVideoPlayer();
                });
                return;
            }
        }
        // Autoplay disabled or no current video
        closeVideoPlayer();
    }
}

function onPlayerError(event) {
    console.error('Player Error:', event.data);
    hideLoading();
    showError('Error playing video. Please try again.');
    closeVideoPlayer();
}

function closeVideoPlayer() {
    if (player && player.stopVideo) {
        player.stopVideo();
    }
    const videoPlayerContainer = document.getElementById('video-player-container');
    if (videoPlayerContainer) {
        videoPlayerContainer.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    // Reset player state
    isPlaying = false;
    const playPauseBtn = document.querySelector('.play-pause');
    if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function showVideoPlayer() {
    if (videoPlayerContainer) {
        videoPlayerContainer.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function playVideo(videoId) {
    if (!videoId) {
        console.error('No video ID provided');
        return;
    }

    console.log('Attempting to play video:', videoId);
    showLoading();
    
    // Get video data and add to history
    const videoCard = document.querySelector(`.video-card[data-video-id="${videoId}"]`);
    if (videoCard) {
        const videoData = {
            title: videoCard.querySelector('.details h3').textContent,
            thumbnails: {
                medium: {
                    url: videoCard.querySelector('.thumbnail img').src
                }
            },
            channelTitle: videoCard.querySelector('.channel-name').textContent
        };
        addToHistory(videoId, videoData);
    }
    // Mark user interaction since this is a click on a video card
    appState.userInteracted = true;
    appState.currentVideo = videoId;
    // Set currentVideo and determine currentIndex
    appState.currentVideo = videoId;
    try {
        const idxFromCard = videoCard ? parseInt(videoCard.dataset.videoIndex, 10) : NaN;
        if (!isNaN(idxFromCard)) {
            appState.currentIndex = idxFromCard;
        } else if (appState.currentList && appState.currentList.length > 0) {
            const found = appState.currentList.indexOf(videoId);
            appState.currentIndex = found >= 0 ? found : appState.currentIndex;
        }
    } catch (e) {
        console.warn('Could not determine video index for autoplay:', e);
    }
    
    if (!playerReady || !player) {
        console.log('Player not ready, queueing video:', videoId);
        videoQueue.push(videoId);
        initYouTubePlayer(); // Try to initialize if not ready
        return;
    }

    try {
        console.log('Loading video:', videoId);
        showVideoPlayer();
        if (appState.autoplayEnabled) {
            player.loadVideoById(videoId);
            if (player && player.playVideo) {
                player.playVideo();
                if (player && player.unMute) {
                    player.unMute();
                    player.setVolume(100);
                    currentVolume = 1;
                    const volumeToggle = document.querySelector('.volume-toggle');
                    if (volumeToggle) {
                        volumeToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                    }
                }
                isPlaying = true;
                const playPauseBtn = document.querySelector('.play-pause');
                if (playPauseBtn) {
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                }
            }
        } else {
            player.cueVideoById(videoId);
            isPlaying = false;
            const playPauseBtn = document.querySelector('.play-pause');
            if (playPauseBtn) {
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        }
        hideLoading();
    } catch (error) {
        console.error('Error playing video:', error);
        hideLoading();
        showError('Error playing video. Please try again.');
        closeVideoPlayer();
    }
}

// Load YouTube API
function loadYouTubeAPI() {
    if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        return; // API already loading
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Display History
function displayHistory() {
    const historyContainer = document.getElementById('video-container');
    historyContainer.innerHTML = '';
    
    if (appState.watchHistory.length === 0) {
        historyContainer.innerHTML = '<div class="no-results">No watch history available</div>';
        return;
    }
    
    appState.watchHistory.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.dataset.videoId = video.videoId;
        videoCard.innerHTML = `
            <div class="thumbnail">
                <img src="${video.thumbnail || 'images/placeholder.jpg'}" 
                     alt="${escapeHtml(video.title)}"
                     onerror="this.src='images/placeholder.jpg'">
                <div class="play-button">
                    <i class="material-icons">play_circle_filled</i>
                </div>
            </div>
            <div class="video-info">
                <div class="channel-icon">
                    <img src="images/default-channel.svg" alt="Channel">
                </div>
                <div class="details">
                    <h3>${escapeHtml(video.title)}</h3>
                    <p class="channel-name">${escapeHtml(video.channelTitle)}</p>
                    <p class="views-time">
                        <span class="time">Watched ${formatDate(video.watchedAt)}</span>
                    </p>
                </div>
            </div>
        `;
    });
}

// Add navigation event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Handle home and trending navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            
            if (page === 'home' || page === 'trending') {
                // Get current region
                const regionSelect = document.getElementById('region-select');
                const selectedRegion = regionSelect ? regionSelect.value : 'GB';
                
                // Fetch trending videos for the current region
                fetchTrendingVideos(selectedRegion);
                
                // Update active state
                document.querySelectorAll('.nav-link').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                link.classList.add('active');
            }
        });
    });
});

// Daily reset for API keys (reset failed keys every 24 hours)
function resetAPIKeysDaily() {
    const lastReset = localStorage.getItem('lastAPIKeyReset');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (!lastReset || (now - parseInt(lastReset)) > oneDay) {
        console.log('Performing daily API key reset...');
        YOUTUBE_CONFIG.resetFailedKeys();
        localStorage.setItem('lastAPIKeyReset', now.toString());
    }
}

// Debug function to check API key status
function debugAPIKeys() {
    const stats = YOUTUBE_CONFIG.getUsageStats();
    const available = YOUTUBE_CONFIG.getAvailableKeysCount();
    const total = YOUTUBE_CONFIG.getKeyCount();
    
    console.log('=== API Key Status ===');
    console.log(`Available keys: ${available}/${total}`);
    console.log('Usage statistics:', stats);
    
    // Show failed keys
    const failedKeys = Object.entries(stats)
        .filter(([_, data]) => data.isFailed)
        .map(([index, _]) => index);
    
    if (failedKeys.length > 0) {
        console.log('Failed keys:', failedKeys.join(', '));
    }
}

// Make debug function globally available
window.debugAPIKeys = debugAPIKeys;

// Load trending videos on page load
console.log('Loading trending videos on page startup...');

// Ensure videos load after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, fetching trending videos...');
    
    // Reset API keys daily
    resetAPIKeysDaily();
    
    // Debug API key status
    console.log('API Key Status:', {
        totalKeys: YOUTUBE_CONFIG.getKeyCount(),
        availableKeys: YOUTUBE_CONFIG.getAvailableKeysCount(),
        currentIndex: YOUTUBE_CONFIG.getCurrentKeyIndex()
    });
    
    setTimeout(() => {
        console.log('Starting fetchTrendingVideos...');
        fetchTrendingVideos('US');
    }, 100);
});

// Also try immediately
console.log('Trying immediate fetchTrendingVideos...');
fetchTrendingVideos('US');

// Test function to check if everything is working
window.testVideoLoading = function() {
    console.log('=== Testing Video Loading ===');
    console.log('Video container exists:', !!document.getElementById('video-container'));
    console.log('YOUTUBE_CONFIG available:', !!YOUTUBE_CONFIG);
    console.log('API keys count:', YOUTUBE_CONFIG.getKeyCount());
    console.log('Current app state:', appState);
    
    // Test a simple API call
    YOUTUBE_CONFIG.getAPIKey().then(key => {
        console.log('API key retrieved:', key ? 'Success' : 'Failed');
        console.log('Key preview:', key ? key.substring(0, 10) + '...' : 'None');
    }).catch(err => {
        console.error('API key error:', err);
    });
};

// Test function to show sample videos
window.testDisplayVideos = function() {
    console.log('=== Testing Video Display ===');
    const testVideos = [
        {
            id: 'test1',
            snippet: {
                title: 'Test Video 1',
                channelTitle: 'Test Channel',
                publishedAt: new Date().toISOString(),
                thumbnails: {
                    medium: { url: 'images/placeholder.jpg' }
                }
            }
        },
        {
            id: 'test2',
            snippet: {
                title: 'Test Video 2',
                channelTitle: 'Test Channel 2',
                publishedAt: new Date().toISOString(),
                thumbnails: {
                    medium: { url: 'images/placeholder.jpg' }
                }
            }
        }
    ];
    
    console.log('Testing displayVideos with test data...');
    displayVideos(testVideos);
};