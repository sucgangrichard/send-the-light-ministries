const { google } = require('googleapis');
const cron = require('node-cron');
require('dotenv').config();


const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

class AutoUpdateService {
    constructor(channelStore) {
        this.channelStore = channelStore;
        this.youtube = google.youtube({
            version: 'v3',
            key: YOUTUBE_API_KEY
        });
        this.isRunning = false;
        this.lastUpdateTime = null;
        this.updateInterval = '0 * * * *'; // Adjust update frequency
        this.scheduledJob = null;
    }


    init() {
        console.log('Initializing auto-update service...');
        this.startScheduler();
        return this;
    }


    startScheduler() {
        if (this.scheduledJob) {
            this.scheduledJob.stop();
        }

        console.log(`Setting up auto-update schedule: ${this.updateInterval}`);
        this.scheduledJob = cron.schedule(this.updateInterval, () => {
            console.log('Running scheduled video update');
            this.fetchAllVideos();
        });

        console.log('Auto-update service initialized successfully');
        return this;
    }

  
    setUpdateInterval(interval) {
        this.updateInterval = interval;
        this.startScheduler();
        return this;
    }


    async fetchAllVideos() {
        if (this.isRunning) {
            console.log('Update already in progress, skipping');
            return;
        }

        try {
            this.isRunning = true;
            console.log('Fetching videos for all channels...');
            

            const fetchPromises = this.channelStore.channels.map(channel => 
                this.fetchVideosForChannel(channel.id)
            );
            
            await Promise.all(fetchPromises);
            
            this.lastUpdateTime = new Date();
            this.channelStore.lastUpdated = this.lastUpdateTime;
            
            console.log(`Videos fetched successfully at ${this.lastUpdateTime}`);
        } catch (error) {
            console.error('Error fetching all videos:', error);
        } finally {
            this.isRunning = false;
        }
    }


    async fetchVideosForChannel(channelId) {
        try {
            console.log(`Fetching videos for channel ${channelId}`);
            

            const response = await this.youtube.search.list({
                part: 'snippet',
                channelId: channelId,
                order: 'date',
                maxResults: 50,
                type: 'video',
                key: YOUTUBE_API_KEY  
            });
            

            const videoIds = response.data.items.map(item => item.id.videoId);
            
            if (videoIds.length === 0) {
                console.log(`No videos found for channel ${channelId}`);
                return [];
            }

            const videoDetailsResponse = await this.youtube.videos.list({
                part: 'snippet,contentDetails,statistics',
                id: videoIds.join(','),
                key: YOUTUBE_API_KEY  
            });
            
           
            const videos = videoDetailsResponse.data.items.map(item => {
                
                const duration = this.formatDuration(item.contentDetails.duration);
                
               
                const viewCount = this.formatViewCount(item.statistics.viewCount);
                
                return {
                    id: item.id,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.medium.url,
                    channelId: item.snippet.channelId,
                    channelTitle: item.snippet.channelTitle,
                    publishedAt: item.snippet.publishedAt,
                    duration: duration,
                    viewCount: viewCount,
                    description: item.snippet.description
                };
            });
            
            
            this.channelStore.videos = [
                ...this.channelStore.videos.filter(v => v.channelId !== channelId), 
                ...videos 
            ];
            
            console.log(`Fetched ${videos.length} videos for channel ${channelId}`);
            return videos;
        } catch (error) {
            console.error(`Error fetching videos for channel ${channelId}:`, error);
            throw error;
        }
    }

    
    async forceUpdate() {
        console.log('Forcing immediate update of all videos');
        return this.fetchAllVideos();
    }

    
    hasNewVideosSince(clientLastCheck) {
        if (!this.lastUpdateTime || !clientLastCheck) {
            return false;
        }
        
        const clientDate = new Date(clientLastCheck);
        return this.lastUpdateTime > clientDate;
    }

    
    formatDuration(isoDuration) {
        const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        
        const hours = match[1] ? parseInt(match[1].slice(0, -1)) : 0;
        const minutes = match[2] ? parseInt(match[2].slice(0, -1)) : 0;
        const seconds = match[3] ? parseInt(match[3].slice(0, -1)) : 0;
        
        let formattedDuration = '';
        
        if (hours > 0) {
            formattedDuration += `${hours}:`;
            formattedDuration += `${minutes.toString().padStart(2, '0')}:`;
        } else {
            formattedDuration += `${minutes}:`;
        }
        
        formattedDuration += seconds.toString().padStart(2, '0');
        
        return formattedDuration;
    }

    
    formatViewCount(viewCount) {
        const count = parseInt(viewCount);
        
        if (count >= 1000000000) {
            return `${(count / 1000000000).toFixed(1)}B`;
        } else if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        } else {
            return count.toString();
        }
    }
}

module.exports = AutoUpdateService;