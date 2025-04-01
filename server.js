require('dotenv').config();// Load environment variables
const express = require('express');
const cors = require('cors');// Enable CORS
const path = require('path');
const fileupload = require('express-fileupload');// For image uploads
const { google } = require('googleapis');
const axios = require('axios');
const AutoUpdateService = require('./server/autoUpdateService');

const app = express();
const PORT = process.env.PORT || 8080;



const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({
    version: 'v3',
    key: YOUTUBE_API_KEY
});


const channelStore = {
    channels: [
        { id: 'UCPYFnNXs42dDQ5eu29rmu8g', name: 'Send The Light Ministries - Proper Inc.', thumbnail: '' }
    ], // Stores channel metadata
    videos: [], // Aggregated videos from all channels
    lastUpdated: null // Timestamp of last update
};



// Initialization
const updateService = new AutoUpdateService(channelStore).init();
const initial_path = path.join(__dirname, "public");



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());


app.get('/', (req, res) => {
    res.sendFile(path.join(initial_path, "home.html"));
});

app.get('/editor', (req, res) => {
    res.sendFile(path.join(initial_path, "editor.html"));
});

app.get("/blog", (req, res) => {
    res.sendFile(path.join(initial_path, "home-blog.html"));
});

app.use(express.static(initial_path));
app.get('/index', (req, res) => {
    res.sendFile(path.join(initial_path, "index.html"));
});

app.post('/uploads', (req, res) => {
    let file = req.files.image;
    let date = new Date();
    let imagename = date.getDate() + date.getTime() + file.name;
    let path = 'public/uploads/' + imagename;
    file.mv(path, (err, result) => {
        if (err) {
            throw err;
        } else {
            res.json(`uploads/${imagename}`)
        }
    });
});


app.get("/admin", (req, res) => {
    res.sendFile(path.join(initial_path, "dashboard.html"));
});

app.get("/:blog([a-zA-Z0-9-]+)", (req, res) => {
    res.sendFile(path.join(initial_path, "blog.html"));
});

app.get("/:blog/editor", (req, res) => {
    res.sendFile(path.join(initial_path, "editor.html"));
});


app.get('/api/channels', (req, res) => { //List all tracked channels
    res.json(channelStore.channels);
});

app.get('/api/videos', (req, res) => { //Get filtered/sorted videos
    const { channelIds } = req.query;
    let filteredVideos = channelStore.videos;

    if (channelIds) {
        const channelIdArray = channelIds.split(',');
        filteredVideos = filteredVideos.filter(video =>
            channelIdArray.includes(video.channelId)
        );
    }

    filteredVideos.sort((a, b) =>
        new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    res.json({
        videos: filteredVideos,
        lastUpdated: channelStore.lastUpdated
    });
});

app.get('/api/check-updates', (req, res) => { //Check for new videos
    const { lastCheck } = req.query;
    const hasNewVideos = updateService.hasNewVideosSince(lastCheck);
    res.json({ hasNewVideos, lastUpdated: channelStore.lastUpdated });
});

// Force update endpoint
app.post('/api/force-update', async (req, res) => {
    try {
        await updateService.forceUpdate();
        res.json({ success: true, lastUpdated: channelStore.lastUpdated });
    } catch (error) {
        console.error('Error forcing update:', error);
        res.status(500).json({ error: 'Failed to update videos' });
    }
});

app.post('/api/channels', async (req, res) => { //Add new YouTube channel
    try {
        const { channelId } = req.body;
        const existingChannel = channelStore.channels.find(c => c.id === channelId);

        // In POST /api/channels
        if (existingChannel) {
            return res.status(400).json({ error: 'Channel already exists' });
        }

        const response = await youtube.channels.list({
            part: 'snippet',
            id: channelId,
            key: YOUTUBE_API_KEY
        });

        if (response.data.items.length === 0) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        const channelData = response.data.items[0];
        const newChannel = {
            id: channelId,
            name: channelData.snippet.title,
            thumbnail: channelData.snippet.thumbnails.default.url
        };

        channelStore.channels.push(newChannel);
        await updateService.fetchVideosForChannel(channelId);
        res.status(201).json(newChannel);
    } catch (error) {
        console.error('Error adding channel:', error);
        res.status(500).json({ error: 'Failed to add channel' });
    }
});

app.delete('/api/channels/:channelId', (req, res) => {
    const { channelId } = req.params;
    channelStore.channels = channelStore.channels.filter(c => c.id !== channelId);
    channelStore.videos = channelStore.videos.filter(v => v.channelId !== channelId);
    res.json({ success: true });
});

app.post('/api/settings/update-interval', (req, res) => { //Configure sync frequency
    const { interval } = req.body;
    if (!interval || typeof interval !== 'string') {
        return res.status(400).json({ error: 'Invalid interval format' });
    }

    try {
        updateService.setUpdateInterval(interval);
        res.json({ success: true, interval });
    } catch (error) {
        console.error('Error updating interval:', error);
        res.status(500).json({ error: 'Failed to update interval' });
    }
});




app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Server error' 
            : err.message 
    });
});


app.listen(PORT, '0.0.0.0', () => { // Listen on all interfaces
    console.log(`Server running on port ${PORT}`);
    console.log(`YouTube API initialized for Targetoir Twenty-three`);
    updateService.fetchAllVideos();
});

// Diagram
// Client → Express Server → YouTube API  
//        ↳ AutoUpdateService (CRON)  
//        ↳ ChannelStore (In-Memory)  
//        ↳ File Uploads (Local Storage)