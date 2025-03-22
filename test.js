// ... (previous auth code remains the same)

const getUserWrittenBlogs = () => {
    blogsRow.innerHTML = ''; // Clear existing content first
    db.collection("blogs").where("author", "==", auth.currentUser.email.split("@")[0])
    .get()
    .then((blogs) => {
        blogs.forEach((blog) => {
            createBlog(blog);
        })
    })
    .catch((error) => {
        console.log("Error getting blogs", error);
    })
}

const createBlog = (blog) => {
    let data = blog.data();
    const blogCard = document.createElement('div');
    blogCard.className = 'col-lg-4 col-md-6 mb-4';
    blogCard.innerHTML = `
    <div class="blog-card h-100">
        <div class="article-img">
            <img src="${data.bannerImage}" class="blog-image img-fluid" alt="${data.title}">
        </div>
        <div class="article-content d-flex flex-column">
            <p class="article-date text-muted small">${data.publishedAt}</p>
            <h3 class="blog-title h5">${data.title.substring(0, 100) + '...'}</h3>
            <p class="blog-overview flex-grow-1">${data.article.substring(0, 200) + '...'}</p>
            <div class="btn-group mt-3">
                <a href="/${blog.id}" class="btn btn-sm btn-primary">Read</a>
                <a href="/edit/${blog.id}" class="btn btn-sm btn-secondary">Edit</a>
                <button onclick="deleteBlog('${blog.id}')" class="btn btn-sm btn-danger">Delete</button>
            </div>
        </div>
    </div>
    `;
    blogsRow.appendChild(blogCard);
}

const deleteBlog = (id) => {
    db.collection("blogs").doc(id).delete().then(() => {
        getUserWrittenBlogs(); // Refresh the list after deletion
    })
    .catch((error) => {
        console.log("Error deleting blog", error);
    })
}

// Add this CSS
const style = document.createElement('style');
style.textContent = `
.blog-card {
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s;
}
.blog-card:hover {
    transform: translateY(-5px);
}
.article-img {
    height: 200px;
    overflow: hidden;
    background: #f0f0f0;
}
.blog-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.article-content {
    padding: 1.5rem;
}
.btn-group {
    gap: 0.5rem;
}
`;
document.head.appendChild(style);