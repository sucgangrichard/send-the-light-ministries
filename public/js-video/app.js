// YouTube Feed App - Frontend JavaScript

// Configuration
const config = {
    refreshInterval: 300000, // Check for new videos every 5 minutes (300000ms)
    maxVideosPerChannel: Infinity,  // Maximum number of videos to display per channel
    defaultView: 'grid',     // Default view mode: 'grid' or 'list'
    apiBaseUrl: '/api'       // Base URL for API endpoints
};

// State management
const state = {
    channels: [],
    videos: [],
    selectedChannels: [], // Will store IDs of selected channels
    viewMode: config.defaultView,
    lastUpdated: null,
    isLoading: true,
    hasError: false
};

// DOM Elements
const elements = {
    channelList: document.getElementById('channelList'),
    videosGrid: document.getElementById('videosGrid'),
    videosList: document.getElementById('videosList'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    errorMessage: document.getElementById('errorMessage'),
    gridViewBtn: document.getElementById('gridView'),
    listViewBtn: document.getElementById('listView'),
    videoModal: document.getElementById('videoModal'),
    videoModalTitle: document.getElementById('videoModalLabel'),
    videoIframe: document.getElementById('videoIframe'),
    videoChannel: document.getElementById('videoChannel'),
    videoDescription: document.getElementById('videoDescription'),
    videoPublished: document.getElementById('videoPublished'),
    videoLink: document.getElementById('videoLink')
};

// Initialize the application
function init() {
    // Load channels from API
    loadChannels()
        .then(() => {
            // Populate channel dropdown
            populateChannelDropdown();

            // Set initial view mode
            setViewMode(state.viewMode);

            // Add event listeners
            addEventListeners();

            // Load initial videos
            loadVideos();

            // Set up auto-refresh
            setupAutoRefresh();
        })
        .catch(error => {
            console.error('Error initializing app:', error);
            state.hasError = true;
            elements.loadingSpinner.classList.add('d-none');
            elements.errorMessage.classList.remove('d-none');
        });
}

// Load channels from API
async function loadChannels() {
    try {
        const response = await fetch(`${config.apiBaseUrl}/channels`);
        if (!response.ok) {
            throw new Error(`Failed to load channels: ${response.status} ${response.statusText}`);
        }

        const channels = await response.json();
        state.channels = channels;

        // By default, select all channels
        state.selectedChannels = channels.map(channel => channel.id);

        return channels;
    } catch (error) {
        console.error('Error loading channels:', error);
        throw error;
    }
}

// Populate channel dropdown with available channels
function populateChannelDropdown() {
    // Clear existing items
    elements.channelList.innerHTML = '';

    // Add "Select All" option
    const selectAllItem = document.createElement('li');
    const selectAllLink = document.createElement('a');
    selectAllLink.className = 'dropdown-item channel-select-all';
    selectAllLink.href = '#';
    selectAllLink.textContent = 'Select All Channels';
    selectAllItem.appendChild(selectAllLink);
    elements.channelList.appendChild(selectAllItem);

    // Add divider
    const divider = document.createElement('li');
    divider.innerHTML = '<hr class="dropdown-divider">';
    elements.channelList.appendChild(divider);

    // Add individual channels
    state.channels.forEach(channel => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item channel-item';
        a.href = '#';
        a.dataset.channelId = channel.id;

        // Create channel item with thumbnail and name
        a.innerHTML = `
            <div class="form-check">
                <input class="form-check-input channel-checkbox" type="checkbox" value="${channel.id}" id="channel-${channel.id}">
                <label class="form-check-label" for="channel-${channel.id}">
                    <img src="${channel.thumbnail}" alt="${channel.name}"> ${channel.name}
                </label>
            </div>
        `;

        li.appendChild(a);
        elements.channelList.appendChild(li);
    });

    // By default, select all channels
    const checkboxes = document.querySelectorAll('.channel-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}

// Add event listeners to interactive elements
function addEventListeners() {
    // View mode toggle
    elements.gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    elements.listViewBtn.addEventListener('click', () => setViewMode('list'));

    // Channel selection
    document.querySelectorAll('.channel-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const checkbox = item.querySelector('.channel-checkbox');
            checkbox.checked = !checkbox.checked;

            // Update selected channels
            updateSelectedChannels();

            // Reload videos
            loadVideos();

            // Prevent dropdown from closing
            e.stopPropagation();
        });
    });

    // Select all channels
    document.querySelector('.channel-select-all').addEventListener('click', (e) => {
        e.preventDefault();
        const checkboxes = document.querySelectorAll('.channel-checkbox');
        const allChecked = [...checkboxes].every(cb => cb.checked);

        checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });

        // Update selected channels
        updateSelectedChannels();

        // Reload videos
        loadVideos();

        // Prevent dropdown from closing
        e.stopPropagation();
    });

    // Video modal
    document.addEventListener('click', (e) => {
        const videoCard = e.target.closest('.video-card, .video-list-item');
        if (videoCard) {
            e.preventDefault();
            const videoId = videoCard.dataset.videoId;
            openVideoModal(videoId);
        }
    });

    // Close modal and stop video
    elements.videoModal.addEventListener('hidden.bs.modal', () => {
        elements.videoIframe.src = '';
    });
}

// Update the list of selected channels based on checkboxes
function updateSelectedChannels() {
    state.selectedChannels = [];
    document.querySelectorAll('.channel-checkbox:checked').forEach(checkbox => {
        state.selectedChannels.push(checkbox.value);
    });
}

// Set the view mode (grid or list)
function setViewMode(mode) {
    state.viewMode = mode;

    if (mode === 'grid') {
        elements.videosGrid.classList.remove('d-none');
        elements.videosList.classList.add('d-none');
        elements.gridViewBtn.classList.add('active');
        elements.listViewBtn.classList.remove('active');
    } else {
        elements.videosGrid.classList.add('d-none');
        elements.videosList.classList.remove('d-none');
        elements.gridViewBtn.classList.remove('active');
        elements.listViewBtn.classList.add('active');
    }

    // Render videos in the new view mode
    renderVideos();
}

// Load videos from the API
async function loadVideos() {
    // Show loading spinner
    elements.loadingSpinner.classList.remove('d-none');
    elements.errorMessage.classList.add('d-none');
    state.isLoading = true;
    state.hasError = false;

    try {
        // Build query string with selected channel IDs
        const queryParams = state.selectedChannels.length > 0
            ? `?channelIds=${state.selectedChannels.join(',')}`
            : '';

        // Fetch videos from API
        const response = await fetch(`${config.apiBaseUrl}/videos${queryParams}`);

        if (!response.ok) {
            throw new Error(`Failed to load videos: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        state.videos = data.videos;
        state.lastUpdated = new Date(data.lastUpdated);
        state.isLoading = false;

        // Render videos
        renderVideos();

        // Hide loading spinner
        elements.loadingSpinner.classList.add('d-none');
    } catch (error) {
        console.error('Error loading videos:', error);
        state.isLoading = false;
        state.hasError = true;

        // Show error message
        elements.loadingSpinner.classList.add('d-none');
        elements.errorMessage.classList.remove('d-none');
    }
}

// Render videos in the current view mode
function renderVideos() {
    // If still loading, don't render
    if (state.isLoading) return;

    // If there's an error, don't render
    if (state.hasError) return;

    // If no videos or no channels selected, show empty state
    if (state.videos.length === 0 || state.selectedChannels.length === 0) {
        renderEmptyState();
        return;
    }

    // Render based on view mode
    if (state.viewMode === 'grid') {
        renderGridView();
    } else {
        renderListView();
    }
}

// Render empty state when no videos are available
function renderEmptyState() {
    const emptyState = `
        <div class="col-12">
            <div class="empty-state">
                <i class="fas fa-video-slash"></i>
                <h3>No videos to display</h3>
                <p>Select at least one channel from the dropdown menu to see videos.</p>
            </div>
        </div>
    `;

    elements.videosGrid.innerHTML = emptyState;
    elements.videosList.innerHTML = '';
}

// Render videos in grid view
function renderGridView() {
    elements.videosGrid.innerHTML = '';

    state.videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'col';
        videoCard.innerHTML = `
            <div class="video-card" data-video-id="${video.id}">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <span class="video-duration">${video.duration}</span>
                </div>
                <div class="video-info">
                    <h5 class="video-title">${video.title}</h5>
                    <div class="video-channel">${video.channelTitle}</div>
                    <div class="video-meta">
                        <span>${video.viewCount} views</span>
                        <span>${formatDate(video.publishedAt)}</span>
                    </div>
                </div>
            </div>
        `;

        elements.videosGrid.appendChild(videoCard);
    });
}

// Render videos in list view
function renderListView() {
    elements.videosList.innerHTML = '';

    const listGroup = document.createElement('div');
    listGroup.className = 'list-group';

    state.videos.forEach(video => {
        const listItem = document.createElement('a');
        listItem.className = 'list-group-item list-group-item-action video-list-item';
        listItem.href = '#';
        listItem.dataset.videoId = video.id;

        listItem.innerHTML = `
            <div class="d-flex">
                <div class="video-list-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <span class="video-list-duration">${video.duration}</span>
                </div>
                <div class="video-list-info">
                    <h5 class="video-list-title">${video.title}</h5>
                    <div class="video-list-meta">
                        ${video.channelTitle} • ${video.viewCount} views • ${formatDate(video.publishedAt)}
                    </div>
                </div>
            </div>
        `;

        listGroup.appendChild(listItem);
    });

    elements.videosList.appendChild(listGroup);
}

// Open video modal with video details
function openVideoModal(videoId) {
    const video = state.videos.find(v => v.id === videoId);

    if (!video) return;

    // Set modal content
    elements.videoModalTitle.textContent = video.title;
    elements.videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    elements.videoChannel.textContent = video.channelTitle;
    elements.videoDescription.textContent = video.description;
    elements.videoPublished.textContent = `Published on ${formatDate(video.publishedAt, true)}`;
    elements.videoLink.href = `https://www.youtube.com/watch?v=${videoId}`;

    // Show modal
    const videoModal = new bootstrap.Modal(elements.videoModal);
    videoModal.show();
}

// Set up auto-refresh mechanism
function setupAutoRefresh() {
    setInterval(() => {
        // Check for new videos
        checkForNewVideos();
    }, config.refreshInterval);
}

// Check for new videos and notify if there are updates
async function checkForNewVideos() {
    try {
        const response = await fetch(`${config.apiBaseUrl}/check-updates`);

        if (!response.ok) {
            throw new Error(`Failed to check for updates: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.hasNewVideos) {
            // Show notification
            showUpdateNotification();
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
    }
}

// Show notification when new videos are available
function showUpdateNotification() {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.update-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div>New videos available!</div>
        <button class="btn btn-sm btn-light ms-2 refresh-btn">Refresh</button>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Add event listener to refresh button
    notification.querySelector('.refresh-btn').addEventListener('click', () => {
        // Remove notification
        notification.remove();

        // Reload videos
        loadVideos();
    });

    // In function showUpdateNotification, replace the setTimeout block with:
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
}

// Format date to relative time (e.g., "2 days ago")
function formatDate(dateString, full = false) {
    const date = new Date(dateString);

    if (full) {
        // Full date format: "January 1, 2023"
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffMonth / 12);

    if (diffSec < 60) {
        return 'just now';
    } else if (diffMin < 60) {
        return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHour < 24) {
        return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDay < 30) {
        return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
    } else if (diffMonth < 12) {
        return `${diffMonth} ${diffMonth === 1 ? 'month' : 'months'} ago`;
    } else {
        return `${diffYear} ${diffYear === 1 ? 'year' : 'years'} ago`;
    }
}