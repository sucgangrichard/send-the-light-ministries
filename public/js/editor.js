//blog section
const blogTitleField = document.querySelector('.title');
const articleFeild = document.querySelector('.article');

//banner
const bannerImage = document.querySelector('#banner-upload');
const banner = document.querySelector(".banner");
let bannerPath;

//blog options
const publishBtn = document.querySelector('.publish-btn');
const uploadInput = document.querySelector('#image-upload')

//banner
bannerImage.addEventListener('change', () => {
    uploadImage(bannerImage, "banner");
})

uploadInput.addEventListener('change', () => {
    uploadImage(uploadInput, "image");
})

const uploadImage = (uploadFile, uploadType) => {
    const [file] = uploadFile.files;
    if(file && file.type.includes("image")){
        const formdata = new FormData();
        formdata.append('image', file);  
        
        fetch('/uploads', {
            method: 'post',
            body: formdata
        }).then(res => res.json())
        .then(data => {
            if(uploadType == "image"){
                addImage(data, file.name);

            }else{
                bannerPath = `${location.origin}/${data}`;
                banner.style.backgroundImage = `url("${bannerPath}")`;
            }
            
            
        })
    }else{
        alert("Please upload an image file");
    }
}

const addImage = (imagepath, alt) => {
    let curPos = articleFeild.selectionStart;
    let textToInsert = `\r![${alt}](${imagepath})\r`;
    articleFeild.value = articleFeild.value.slice(0, curPos) + textToInsert + articleFeild.value.slice(curPos);
}


let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

//publish button
publishBtn.addEventListener('click', () => {
    if(articleFeild.value.length && blogTitleField.value.length){
        let docName;
        if(blogID[0] == 'editor'){
            //generating id
        let letters = 'abcdefghijklmnopqrstuvwxyz';
        let blogTitle = blogTitleField.value.split(" ").join("-");//
        let id = '';
        for(let i = 0; i < 4; i++){
            id += letters[Math.floor(Math.random() * letters.length)];

        }
        // setting up docName
        let docName = `${blogTitle}-${id}`;
        
        }else{
            docName = decodeURI(blogID[0]);
        }

        
        let date = new Date(); //for publish at info

        //access firestore with db variable
        db.collection("blogs").doc(docName).set({
            title: blogTitleField.value, 
            article: articleFeild.value,
            bannerImage: bannerPath,
            publishedAt: `${date.getDate()} ${months[date.getMonth()]} ${date.
                getFullYear()}`,
            author: auth.currentUser.email.split("@")[0]//getting email and removing @ part to get author name 
            
        })
        .then(() => {
            location.href = `/blog`;
        })
        .catch((err) => {
            console.log(err);
        })
    }
})

//checking for user logged in or not
 auth.onAuthStateChanged((user) => {
    if(!user){
        location.replace("/admin"); //redirect to login page
    }
 })

 //checking for existing blog edits

 let blogID = location.pathname.split("/");
 blogID.shift();//removing first empty string from array 

 if(blogID[0] != "editor"){
    //means we are in existing blog edit route
    let docRef = db.collection("blogs").doc(decodeURI(blogID[0]));
    docRef.get().then((doc) => { 
        if(doc.exists){

            let data = doc.data();
            bannerPath = data.bannerImage;
            banner.style.backgroundImage = `url("${bannerPath}")`;
            blogTitleField.value = data.title;
            articleFeild.value = data.article;

        }else{
            location.replace("/");//redirect to home page
        }

    })
 }

// https://www.youtube.com/watch?v=AWHGQfzfHxI

