let posts = [];
let currentUser = null;
let isAdmin = false;

// ავტორიზაცია
function login() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    if (username === 'wie' && password === '111') {
        isAdmin = true;  // მხოლოდ ამ მომხმარებელს აქვს ადმინის უფლებები
        currentUser = username;
    } else if (password === 'UG') {
        isAdmin = false;
        currentUser = username;
    } else {
        alert('არასწორი პაროლი!');
        return;
    }

    // ავტორიზაციის შემდეგ ვამალავთ შესვლის ფორმას და ვაჩვენებთ პოსტების ფორმას
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('contentContainer').style.display = 'block';
    document.getElementById('authTitle').innerText = "დაწერე პოსტი";
}

// პოსტის დამატება
function addPost() {
    let postText = document.getElementById('postText').value;
    if (!postText) return;

    let postId = Date.now();  // უნიკალური ID პოსტისთვის
    let post = {
        id: postId,
        author: currentUser,
        text: postText,
        reactions: {},  // რეაქციების დამუშავება
        comments: []    // კომენტარები
    };

    posts.push(post);  // პოსტის დამატება
    document.getElementById('postText').value = "";  // ფორუმის გახსნა ცარიელი
    renderPosts();  // პოსტების განახლება
}

// ფაილის ატვირთვა
function uploadFile() {
    let fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) return;

    let file = fileInput.files[0];
    let postId = Date.now();  // უნიკალური ID ფაილის პოსტისთვის

    let post = {
        id: postId,
        author: currentUser,
        text: `ატვირთულია ფაილი: ${file.name}`,
        file: URL.createObjectURL(file),  // ფაილის URL
        reactions: {},
        comments: []
    };

    posts.push(post);
    renderPosts();
}

// პოსტზე რეაქციის დამატება
function reactToPost(postId, reactionType) {
    let post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.reactions[currentUser]) {
        delete post.reactions[currentUser];
    }

    post.reactions[currentUser] = reactionType;
    renderPosts();
}

// კომენტარის დამატება
function addComment(postId) {
    let post = posts.find(p => p.id === postId);
    if (!post) return;

    let commentText = document.getElementById(`commentText-${postId}`).value;
    let fileInput = document.getElementById(`fileInput-${postId}`);

    let comment = {
        id: Date.now(),
        user: currentUser,
        text: commentText,
        file: fileInput.files.length > 0 ? URL.createObjectURL(fileInput.files[0]) : null,
        fileName: fileInput.files.length > 0 ? fileInput.files[0].name : null,
        reactions: {}
    };

    post.comments.push(comment);

    document.getElementById(`commentText-${postId}`).value = "";
    fileInput.value = "";
    renderPosts();
}

// პოსტის წაშლა
function deletePost(postId) {
    if (!isAdmin) {
        alert("მხოლოდ ადმინს შეუძლია პოსტის წაშლა!");
        return;
    }

    posts = posts.filter(p => p.id !== postId);
    renderPosts();
}

// კომენტარზე რეაქციის დამატება
function reactToComment(postId, commentId, reactionType) {
    let post = posts.find(p => p.id === postId);
    if (!post) return;

    let comment = post.comments.find(c => c.id === commentId);
    if (!comment) return;

    if (comment.reactions[currentUser]) {
        delete comment.reactions[currentUser];
    }

    comment.reactions[currentUser] = reactionType;
    renderPosts();
}

// პოსტების ჩვენება
function renderPosts() {
    let container = document.getElementById('postContainer');
    container.innerHTML = '';

    posts.forEach(post => {
        let likeCount = Object.values(post.reactions).filter(r => r === 'like').length;
        let dislikeCount = Object.values(post.reactions).filter(r => r === 'dislike').length;
        let heartCount = Object.values(post.reactions).filter(r => r === 'heart').length;

        let postElement = document.createElement('div');
        postElement.classList.add('post');

        let authorBadge = post.author === 'wie' ? `<span class="admin-badge">admin</span>` : '';

        let commentsHTML = post.comments.map(comment => {
            let likeCount = Object.values(comment.reactions).filter(r => r === 'like').length;
            let dislikeCount = Object.values(comment.reactions).filter(r => r === 'dislike').length;
            let heartCount = Object.values(comment.reactions).filter(r => r === 'heart').length;

            let fileContent = comment.file ?
                (comment.file.endsWith('.png') || comment.file.endsWith('.jpg') || comment.file.endsWith('.jpeg')
                    ? `<img src="${comment.file}" class="comment-image">`
                    : `<a href="${comment.file}" target="_blank">📂 ${comment.fileName}</a>`)
                : '';

            return `
                <div class="comment">
                    <h5>${comment.user}</h5>
                    <p>${comment.text}</p>
                    ${fileContent}
                    <div class="reactions">
                        <button onclick="reactToComment(${post.id}, ${comment.id}, 'like')">👍 ${likeCount}</button>
                        <button onclick="reactToComment(${post.id}, ${comment.id}, 'dislike')">👎 ${dislikeCount}</button>
                        <button onclick="reactToComment(${post.id}, ${comment.id}, 'heart')">❤️ ${heartCount}</button>
                    </div>
                </div>
            `;
        }).join('');

        postElement.innerHTML = `
            <div class="post-header">
                <h4>${post.author} ${authorBadge}</h4>
            </div>
            <p>${post.text}</p>
            ${post.file ? `<img src="${post.file}" class="post-image">` : ''}
            <div class="reactions">
                <button onclick="reactToPost(${post.id}, 'like')">👍 ${likeCount}</button>
                <button onclick="reactToPost(${post.id}, 'dislike')">👎 ${dislikeCount}</button>
                <button onclick="reactToPost(${post.id}, 'heart')">❤️ ${heartCount}</button>
            </div>
            
            <div class="comment-input">
                <input type="text" id="commentText-${post.id}" placeholder="დაწერე კომენტარი...">
                <input type="file" id="fileInput-${post.id}">
                <button onclick="addComment(${post.id})">💬 დაამატე კომენტარი</button>
            </div>

            ${isAdmin ? `<button onclick="deletePost(${post.id})">🗑️ წაშლა</button>` : ""}
            <div class="comment-section">${commentsHTML}</div>
        `;

        container.appendChild(postElement);
    });
}
