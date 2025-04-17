const blogTitleField = document.querySelector('.title');
const articleFeild = document.querySelector('.article');
const bannerImage = document.querySelector('#banner-upload');
const banner = document.querySelector(".banner");
let bannerPath;
const publishBtn = document.querySelector('.publish-btn');
const uploadInput = document.querySelector('#image-upload')
bannerImage.addEventListener('change', () => {
    uploadImage(bannerImage, "banner");
})
uploadInput.addEventListener('change', () => {
    uploadImage(uploadInput, "image");
})
const uploadImage = (uploadFile, uploadType) => {
    const [file] = uploadFile.files;
    if (file && file.type.includes("image")) {
        if (uploadType === "banner" && file.size > 160 * 1024) {
            Swal.fire({
                icon: 'warning',
                title: 'File Size Exceeded',
                text: 'Banner image size must be less than 160KB. Please choose a smaller image.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
            uploadFile.value = "";
            return;
        }
        const formdata = new FormData();
        formdata.append('image', file);
        fetch('/uploads', {
            method: 'post',
            body: formdata
        }).then(res => res.json())
            .then(data => {
                if (uploadType == "image") {
                    addImage(data, file.name);
                } else {
                    bannerPath = `${location.origin}/${data}`;
                    banner.style.backgroundImage = `url("${bannerPath}")`;
                }
            })
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Invalid File',
            text: 'Please upload an image file.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
        });
    }
}
const addImage = (imagepath, alt) => {
    let curPos = articleFeild.selectionStart;
    let textToInsert = `\r![${alt}](${imagepath})\r`;
    articleFeild.value = articleFeild.value.slice(0, curPos) + textToInsert + articleFeild.value.slice(curPos);
}
let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
publishBtn.addEventListener('click', () => {
    if (articleFeild.value.length && blogTitleField.value.length) {
        let docName;
        if (blogID[0] == 'write-blog') {
            let letters = 'abcdefghijklmnopqrstuvwxyz';
            let blogTitle = blogTitleField.value.split(" ").join("-");
            let id = '';
            for (let i = 0; i < 4; i++) {
                id += letters[Math.floor(Math.random() * letters.length)];
            }
            let docName = `${blogTitle}-${id}`;
        } else {
            docName = decodeURI(blogID[0]);
        }
        let date = new Date();
        db.collection("blogs").doc(docName).set({
            title: blogTitleField.value,
            article: articleFeild.value,
            bannerImage: bannerPath,
            publishedAt: `${date.getDate()} ${months[date.getMonth()]} ${date.
                getFullYear()}`,
            author: auth.currentUser.email.split("@")[0]
        })
            .then(() => {
                location.href = `/featured-articles`;
            })
            .catch((err) => {
                console.log(err);
            })
    }
})
auth.onAuthStateChanged((user) => {
    if (!user) {
        location.replace("/admin");
    }
})
let blogID = location.pathname.split("/");
blogID.shift();
if (blogID[0] != "write-blog") {
    let docRef = db.collection("blogs").doc(decodeURI(blogID[0]));
    docRef.get().then((doc) => {
        if (doc.exists) {
            let data = doc.data();
            bannerPath = data.bannerImage;
            banner.style.backgroundImage = `url("${bannerPath}")`;
            blogTitleField.value = data.title;
            articleFeild.value = data.article;
        } else {
            location.replace("/");
        }
    })
}
