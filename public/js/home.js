const blogSection = document.querySelector('.blogs-section');
const blogsRow = document.getElementById('blogs-row');
let allBlogs = []; // Stores all blogs for search functionality

// Initialize and load blogs, sorted by date (newest first)
db.collection("blogs").orderBy("publishedAt", "desc").get().then((blogs) => {
    blogs.forEach(blog => {
        const blogId = blog.id;
        const blogData = blog.data();
        
        if (blogId != decodeURI(location.pathname.split("/").pop())) {
            allBlogs.push({ id: blogId, data: blogData });
            createBlog(blogId, blogData);
        }
    });
});

// Modified createBlog function
const createBlog = (id, data) => {
    const cleanedOverview = data.article
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/#+\s?.*/g, '')
        .substring(0, 200);

    const blogCol = document.createElement('div');
    blogCol.className = 'col-lg-4 col-md-6 mb-4';
    blogCol.innerHTML = `
        <div class="blog-card reveal-slide-left delay-1">
            <div class="article-img">
                <img src="${data.bannerImage}" class="blog-image img-fluid" alt="${data.title}">
            </div>
            <div class="article-content">
                <p class="article-date">${data.publishedAt}</p>
                <h3 class="blog-title">${data.title.length > 100
                    ? data.title.substring(0, 100) + '...'
                    : data.title}</h3>
                <p class="blog-overview">${cleanedOverview}...</p>
                <a href="/${id}" class="btn-read">Read More</a>
            </div>
        </div>
    `;
    blogsRow.appendChild(blogCol);
};

// Search functionality - works with both Enter key and button click
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// Handle search input
searchInput.addEventListener('input', function(e) {
    performSearch(e.target.value);
});

// Handle search button click
searchButton.addEventListener('click', () => {
    performSearch(searchInput.value);
});

// Handle Enter key in search input
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch(searchInput.value);
    }
});

function performSearch(searchTerm) {
    const cleanTerm = searchTerm.toLowerCase().trim();
    filterBlogs(cleanTerm);
}

function filterBlogs(searchTerm) {
    blogsRow.innerHTML = ''; // Clear current results

    const filteredBlogs = allBlogs.filter(blog => {
        const titleMatch = blog.data.title.toLowerCase().includes(searchTerm);
        const contentMatch = blog.data.article.toLowerCase().includes(searchTerm);
        return titleMatch || contentMatch;
    });

    filteredBlogs.forEach(blog => {
        createBlog(blog.id, blog.data);
    });
}