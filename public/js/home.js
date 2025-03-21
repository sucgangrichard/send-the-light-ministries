const blogSection = document.querySelector('.blogs-section');
const blogsRow = document.getElementById('blogs-row');

db.collection("blogs").get().then((blogs) => {
    blogs.forEach(blog => {
        if (blog.id != decodeURI(location.pathname.split("/").pop())) {
            createBlog(blog);
        }
    })
})

const createBlog = (blog) => {
    let data = blog.data();
    const blogCol = document.createElement('div');
    blogCol.className = 'col-lg-4 col-md-6 mb-4';
    blogCol.innerHTML = `
        <div class="blog-card reveal-slide-left delay-1">
            <div class="article-img">
                <img src="${data.bannerImage}" class="blog-image img-fluid" alt="${data.title}">
            </div>
            <div class="article-content">
                <h3 class="blog-title">${data.title.substring(0, 100)}...</h3>
                <p class="blog-overview">${data.article.substring(0, 200)}...</p>
                <a href="/${blog.id}" class="btn-read">Read</a>
            </div>
        </div>
    `;
    blogsRow.appendChild(blogCol);
};