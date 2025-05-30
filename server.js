require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fileupload = require('express-fileupload');
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
    ],
    videos: [],
    lastUpdated: null
};
const updateService = new AutoUpdateService(channelStore).init();
const initial_path = path.join(__dirname, "public");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());
app.get('/', (req, res) => {
    res.sendFile(path.join(initial_path, "home.html"));
});
app.get('/write-blog', (req, res) => {
    res.sendFile(path.join(initial_path, "editor.html"));
});
app.get('/donation-form', (req, res) => {
    res.sendFile(path.join(initial_path, "donation-form.html"));
});
app.get("/featured-articles", (req, res) => {
    res.sendFile(path.join(initial_path, "home-blog.html"));
});
app.use(express.static(initial_path));
app.get('/featured-videos', (req, res) => {
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
app.get("/:blog", (req, res) => {
    res.sendFile(path.join(initial_path, "blog.html"));
});
app.get("/:blog/write-blog", (req, res) => {
    res.sendFile(path.join(initial_path, "editor.html"));
});
app.get('/api/channels', (req, res) => {
    res.json(channelStore.channels);
});
app.get('/api/videos', (req, res) => {
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
app.get('/api/check-updates', (req, res) => {
    const { lastCheck } = req.query;
    const hasNewVideos = updateService.hasNewVideosSince(lastCheck);
    res.json({ hasNewVideos, lastUpdated: channelStore.lastUpdated });
});
app.post('/api/force-update', async (req, res) => {
    try {
        await updateService.forceUpdate();
        res.json({ success: true, lastUpdated: channelStore.lastUpdated });
    } catch (error) {
        console.error('Error forcing update:', error);
        res.status(500).json({ error: 'Failed to update videos' });
    }
});

// Add payment routes
const paymentRoutes = require('./server/payment');
app.use('/api', paymentRoutes);

app.post('/api/channels', async (req, res) => {
    try {
        const { channelId } = req.body;
        const existingChannel = channelStore.channels.find(c => c.id === channelId);
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
app.post('/api/settings/update-interval', (req, res) => {
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
app.get('/js/env.js', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    res.send(`
        window.ENV_FIREBASE_API_KEY = "${process.env.FIREBASE_API_KEY}";
        window.ENV_FIREBASE_AUTH_DOMAIN = "${process.env.FIREBASE_AUTH_DOMAIN}";
        window.ENV_FIREBASE_PROJECT_ID = "${process.env.FIREBASE_PROJECT_ID}";
        window.ENV_FIREBASE_STORAGE_BUCKET = "${process.env.FIREBASE_STORAGE_BUCKET}";
        window.ENV_FIREBASE_MESSAGING_SENDER_ID = "${process.env.FIREBASE_MESSAGING_SENDER_ID}";
        window.ENV_FIREBASE_APP_ID = "${process.env.FIREBASE_APP_ID}";
    `);
});
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Server error'
            : err.message
    });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`YouTube API initialized Channel`);
    updateService.fetchAllVideos();
});
