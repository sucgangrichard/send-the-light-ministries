


const config = {
    refreshInterval: 30000, // 30s auto-refresh
    maxVideosPerChannel: Infinity,  
    defaultView: 'grid', // Initial layout    
    apiBaseUrl: '/api' // API endpoint       
};


const state = {
    channels: [],
    videos: [],
    selectedChannels: [], 
    viewMode: config.defaultView,
    lastUpdated: null,
    isLoading: true,
    hasError: false,
    searchQuery: ''
};


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
    videoLink: document.getElementById('videoLink'),
    searchInput: document.getElementById('searchInput'),
    searchButton: document.getElementById('searchButton')
};


function init() {
    
    loadChannels()
        .then(() => {
            
            populateChannelDropdown();

            
            setViewMode(state.viewMode);

            
            addEventListeners();

            
            loadVideos();

            
            setupAutoRefresh();
        })
        .catch(error => {
            console.error('Error initializing app:', error);
            state.hasError = true;
            elements.loadingSpinner.classList.add('d-none');
            elements.errorMessage.classList.remove('d-none');
        });
}


async function loadChannels() {
    try {
        const response = await fetch(`${config.apiBaseUrl}/channels`);
        if (!response.ok) {
            throw new Error(`Failed to load channels: ${response.status} ${response.statusText}`);
        }

        const channels = await response.json();
        state.channels = channels;

        
        state.selectedChannels = channels.map(channel => channel.id);

        return channels;
    } catch (error) {
        console.error('Error loading channels:', error);
        throw error;
    }
}


function populateChannelDropdown() {
    
    elements.channelList.innerHTML = '';

    
    const selectAllItem = document.createElement('li');
    const selectAllLink = document.createElement('a');
    selectAllLink.className = 'dropdown-item channel-select-all';
    selectAllLink.href = '#';
    selectAllLink.textContent = 'Select All Channels';
    selectAllItem.appendChild(selectAllLink);
    elements.channelList.appendChild(selectAllItem);

    
    const divider = document.createElement('li');
    divider.innerHTML = '<hr class="dropdown-divider">';
    elements.channelList.appendChild(divider);

    
    state.channels.forEach(channel => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item channel-item';
        a.href = '#';
        a.dataset.channelId = channel.id;

        
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

    
    const checkboxes = document.querySelectorAll('.channel-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}


function addEventListeners() {
    
    elements.gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    elements.listViewBtn.addEventListener('click', () => setViewMode('list'));

    
    document.querySelectorAll('.channel-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const checkbox = item.querySelector('.channel-checkbox');
            checkbox.checked = !checkbox.checked;

            
            updateSelectedChannels();

            
            loadVideos();

            
            e.stopPropagation();
        });
    });

    
    document.querySelector('.channel-select-all').addEventListener('click', (e) => {
        e.preventDefault();
        const checkboxes = document.querySelectorAll('.channel-checkbox');
        const allChecked = [...checkboxes].every(cb => cb.checked);

        checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });

        
        updateSelectedChannels();

        
        loadVideos();

        
        e.stopPropagation();
    });

    
    document.addEventListener('click', (e) => {
        const videoCard = e.target.closest('.video-card, .video-list-item');
        if (videoCard) {
            e.preventDefault();
            const videoId = videoCard.dataset.videoId;
            openVideoModal(videoId);
        }
    });

    
    elements.videoModal.addEventListener('hidden.bs.modal', () => {
        elements.videoIframe.src = '';
    });

    
    elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        renderVideos();
    });

    elements.searchButton.addEventListener('click', () => {
        state.searchQuery = elements.searchInput.value.trim();
        renderVideos();
    });
}


function updateSelectedChannels() {
    state.selectedChannels = [];
    document.querySelectorAll('.channel-checkbox:checked').forEach(checkbox => {
        state.selectedChannels.push(checkbox.value);
    });
}


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

    
    renderVideos();
}


async function loadVideos() {
    
    elements.loadingSpinner.classList.remove('d-none');
    elements.errorMessage.classList.add('d-none');
    state.isLoading = true;
    state.hasError = false;

    try {
        
        const queryParams = state.selectedChannels.length > 0
            ? `?channelIds=${state.selectedChannels.join(',')}`
            : '';

        
        const response = await fetch(`${config.apiBaseUrl}/videos${queryParams}`);

        if (!response.ok) {
            throw new Error(`Failed to load videos: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        state.videos = data.videos;
        state.lastUpdated = new Date(data.lastUpdated);
        state.isLoading = false;

        
        renderVideos();

        
        elements.loadingSpinner.classList.add('d-none');
    } catch (error) {
        console.error('Error loading videos:', error);
        state.isLoading = false;
        state.hasError = true;

        
        elements.loadingSpinner.classList.add('d-none');
        elements.errorMessage.classList.remove('d-none');
    }
}


function renderVideos() {
    if (state.isLoading) return;
    if (state.hasError) return;

    const filteredVideos = getFilteredVideos();

    
    if (filteredVideos.length === 0 || state.selectedChannels.length === 0) {
        renderEmptyState();
        return;
    }

    if (state.viewMode === 'grid') {
        renderGridView(filteredVideos);
    } else {
        renderListView(filteredVideos);
    }
}


function renderEmptyState() {
    let title, message;

    if (state.selectedChannels.length === 0) {
        title = 'No channels selected';
        message = 'Select at least one channel from the dropdown menu to see videos.';
    } else if (state.searchQuery) {
        title = 'No videos found';
        message = `No videos match your search for "${state.searchQuery}".`;
    } else {
        title = 'No videos to display';
        message = 'Check back later for new videos.';
    }

    const emptyState = `
        <div class="col-12">
            <div class="empty-state">
                <i class="fas fa-video-slash"></i>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        </div>
    `;

    elements.videosGrid.innerHTML = emptyState;
    elements.videosList.innerHTML = '';
}


function renderGridView(videos) {
    elements.videosGrid.innerHTML = '';
    videos.forEach(video => {
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


function renderListView(videos) {
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


function openVideoModal(videoId) {
    const video = state.videos.find(v => v.id === videoId);

    if (!video) return;

    
    elements.videoModalTitle.textContent = video.title;
    elements.videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    elements.videoChannel.textContent = video.channelTitle;
    elements.videoDescription.textContent = video.description;
    elements.videoPublished.textContent = `Published on ${formatDate(video.publishedAt, true)}`;
    elements.videoLink.href = `https://www.youtube.com/watch?v=${videoId}`;

    
    const videoModal = new bootstrap.Modal(elements.videoModal);
    videoModal.show();
}


function setupAutoRefresh() {
    setInterval(() => {
        
        checkForNewVideos();
    }, config.refreshInterval);
}


async function checkForNewVideos() {
    try {
        const response = await fetch(`${config.apiBaseUrl}/check-updates`);

        if (!response.ok) {
            throw new Error(`Failed to check for updates: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.hasNewVideos) {
            
            showUpdateNotification();
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
    }
}


function showUpdateNotification() {
    
    const existingNotification = document.querySelector('.update-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div>New videos available!</div>
        <button class="btn btn-sm btn-light ms-2 refresh-btn">Refresh</button>
    `;

    
    document.body.appendChild(notification);

    
    notification.querySelector('.refresh-btn').addEventListener('click', () => {
        
        notification.remove();

        
        loadVideos();
    });

    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
}


function formatDate(dateString, full = false) {
    const date = new Date(dateString);

    if (full) {
        
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

function getFilteredVideos() {
    let filtered = state.videos;

   
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(video => {
            return video.title.toLowerCase().includes(query) ||
                   video.description.toLowerCase().includes(query) ||
                   video.channelTitle.toLowerCase().includes(query);
        });
    }

    return filtered;
}