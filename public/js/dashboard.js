let ui = new firebaseui.auth.AuthUI(auth);
let login = document.querySelector('.login');//.nav-login
const blogSection = document.querySelector('.blogs-section');

const blogsRow = document.getElementById('blogs-row');//

//check login user or not
auth.onAuthStateChanged((user) => {
    if(user){
        login.style.display = "none";
        getUserWrittenBlogs();
    }else{
        // login.style.display = "none";
        setupLoginButton();
    }
})
//

const setupLoginButton = () => {
    ui.start("#loginUI", {
            callbacks: {
                signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                    login.style.display = "none";
                    window.location.reload();

                    return false;
                }

 
            },

            signInFlow: 'popup',
            signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID]
    })
}

//fetch user writter blogs

const getUserWrittenBlogs = () => {
    db.collection("blogs")
    .where("author", "==", auth.currentUser.email.split("@")[0])
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

// Add this helper function to strip HTML and Markdown
function stripHtmlAndMarkdown(html) {
    // Handle common markdown patterns
    let text = html.replace(/#+\s?/g, ''); // Remove headings (# ## ### etc)
   
    text = text.replace(/!\[([^\]]+)\]\([^)]+\)/g, ''); // Remove image syntax

    
    // Strip any HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  

const createBlog = (blog) => {
   
    let data = blog.data();
    const blogCard = document.createElement('div');
    blogCard.className = 'col-lg-4 col-md-6 mb-4';
    blogCard.innerHTML = `
    <div class="blog-card reveal-slide-left delay-1">
        <div class="article-img">
            <img src="${data.bannerImage}" class="blog-image img-fluid" alt="${data.title}">
        </div>
        <div class="article-content">
            <p class="article-date">${data.publishedAt}</p>
            <h3 class="blog-title h5">${data.title.length > 100
                ? data.title.substring(0, 100) + '...'
                : data.title}</h3>
            <p class="blog-overview flex-grow-1">${stripHtmlAndMarkdown(data.article).substring(0, 200) + '...'}</p>
            <div class="btn-group mt-3">
                <a href="/${blog.id}" class="btn-read">Read</a>
                <a href="/editor?id=${blog.id}" class="btn-edit">Edit</a>
                <button onclick="deleteBlog('${blog.id}')" class="btn-delete">Delete</button>
            </div>
        </div>
    </div>
    `;
    // <a href="/editor?id=${blog.id}" class="btn-edit">Edit</a>
    blogsRow.appendChild(blogCard);
}

const deleteBlog = (id) =>{
    db.collection("blogs").doc(id).delete().then(() => {
        location.reload();
    })
    .catch((error) => {
        console.log("Error deleting blog");
    })
}

