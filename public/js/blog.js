let blogId = decodeURI(location.pathname.split("/").pop());
let docRef = db.collection("blogs").doc(blogId);

// Theme initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
});

// Initialize theme based on user preference or system preference
function initializeTheme() {
    const currentTheme = localStorage.getItem('theme') || 
                        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').checked = false;
    }
    
    // Add event listener for theme toggle
    document.getElementById('theme-toggle').addEventListener('change', function(e) {
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            applyThemeToContent('dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            applyThemeToContent('light');
        }
    });
}

// Apply theme-specific enhancements to content
function applyThemeToContent(theme) {
    // Add animation to content elements when theme changes
    const contentElements = document.querySelectorAll('.blog-card, .article p, .article h1, .article h2, .article h3, .article h4, .article h5, .article h6');
    contentElements.forEach(element => {
        element.classList.add('theme-transition');
        setTimeout(() => {
            element.classList.remove('theme-transition');
        }, 500);
    });
    
    // Adjust image brightness for dark mode
    const images = document.querySelectorAll('.article-image, .blog-image');
    if (theme === 'dark') {
        images.forEach(img => {
            img.style.filter = 'brightness(0.9)';
        });
    } else {
        images.forEach(img => {
            img.style.filter = 'brightness(1)';
        });
    }
}
//=========================================

docRef.get().then((doc) => {
    if(doc.exists){
        setupBlog(doc.data());
    }else{
        location.replace("/");
    }
})

const setupBlog = (data) => {
    const banner = document.querySelector('.banner');
    const blogTitle = document.querySelector('.title');
    const titleTag = document.querySelector('title');
    const publish = document.querySelector('.published');
    
   
    banner.style.backgroundImage = `url(${data.bannerImage})`;

    titleTag.innerHTML += blogTitle.innerHTML = data.title;
    publish.innerHTML += data.publishedAt;
    publish.innerHTML += ` • ${data.author}`;

    try{
        if(data.author == auth.currentUser.email.split("@")[0]){
            let editBtn = document.getElementById('edit-blog-btn');
            editBtn.style.display = "inline";
            editBtn.href = `${blogId}/editor`;
        }
    }catch{
        
    }

    const article = document.querySelector('.article');
    addArticle(article, data.article);

    // Apply current theme to newly loaded content
    const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    applyThemeToContent(currentTheme);
}

const addArticle = (ele, data) => {
    data = data.split("\n").filter(item => item.length);
    // console.log(data);

    data.forEach(item => {
        //check for heading
        if(item[0] == '#'){
            let hCount = 0;
            let i = 0;
            while(item[i] == '#'){
                hCount++;
                i++;
            }
            let tag = `h${hCount}`;
            ele.innerHTML += `<${tag}class="theme-aware-heading">${item.slice(hCount, item.length)}</${tag}>`
        }else if(item[0] == "!"&&item[1] == "["){
            let seperator;
            for(let i = 0; i<= item.length; i++){
                if(item[i] == "]" && item[i+1] == "(" && item[item.length - 1] == ")"){
                    seperator = i;
                }
            }

            let alt = item.slice(2, seperator);
            let src = item.slice(seperator + 2, item.length - 1);
            ele.innerHTML += `
            <img src = "${src}" alt = "${alt}" class="article-image theme-aware-image">`;

        }
        
        else{
            ele.innerHTML += `<p class="theme-aware-text">${item}</p>`;
        }
    })
    ele.innerHTML += `<br>`;
}


