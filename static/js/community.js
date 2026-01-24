export async function fetchPosts() {
    try {
        const postsList = document.getElementById('posts-list');
        if (!postsList) {
            console.error('Brak elementu #posts-list');
            return;
        }

        const response = await fetch('/posts');
        const posts = await response.json();
        console.log('Pobrane posty:', posts); // Debugowanie

        let postsHTML = '';
        posts.forEach(post => {
            const commentsHTML = post.comments.map(comment => `
                <div class="comment" data-id="${comment.id}">
                    <div class="comment-header">
                        <span class="comment-username${comment.is_premium ? ' premium' : ''}">${comment.username}</span>
                        <span class="comment-timestamp">${comment.timestamp}</span>
                    </div>
                    <div class="comment-content">${comment.content}</div>
                </div>
            `).join('');

            postsHTML += `
                <div class="post" data-id="${post.id}">
                    <div class="post-header" data-id="${post.id}">
                        <span class="post-username${post.is_premium ? ' premium' : ''}">${post.username}${post.is_premium ? '<span class="premium-badge"></span>' : ''}</span>
                        <span class="post-rank">${post.rank}</span>
                        <span class="post-timestamp">${post.timestamp}</span>
                        ${post.is_premium_only ? '<span class="post-premium">Premium</span>' : ''}
                    </div>
                    <div class="post-content">${post.content}</div>
                    <div class="comment-box" id="comment-box-${post.id}" style="display: none;">
                        ${commentsHTML}
                        <div class="add-comment-box">
                            <textarea id="comment-content-${post.id}" placeholder="Dodaj komentarz..." rows="2"></textarea>
                            <button class="add-comment-btn" data-post-id="${post.id}">Skomentuj</button>
                        </div>
                    </div>
                </div>
            `;
        });

        console.log('Wygenerowany HTML:', postsHTML); // Debugowanie HTML
        postsList.innerHTML = postsHTML || '<p>Brak postów do wyświetlenia.</p>';

        // Dodajemy event listenery dla przycisków komentarzy i nagłówków postów
        document.querySelectorAll('.post-header').forEach(header => {
            header.addEventListener('click', () => {
                const postId = parseInt(header.getAttribute('data-id'));
                console.log('Kliknięto post-header, postId:', postId); // Debugowanie
                togglePostComments(postId, posts);
            });
        });
        document.querySelectorAll('.add-comment-btn').forEach(button => {
            button.addEventListener('click', () => {
                const postId = parseInt(button.getAttribute('data-post-id'));
                console.log('Kliknięto add-comment-btn, postId:', postId); // Debugowanie
                addComment(postId);
            });
        });
    } catch (error) {
        console.error('Błąd w fetchPosts:', error);
        alert('Wystąpił błąd w społeczności. Sprawdź konsolę (F12).');
    }
}

export async function addPost() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('Proszę się zalogować!');
            return;
        }
        const postContent = document.getElementById('post-content');
        const premiumOnlyCheckbox = document.getElementById('premium-only-checkbox');
        const postCategory = document.getElementById('post-category');
        if (!postContent || !postCategory) return;
        const content = postContent.value.trim();
        const isPremiumOnly = premiumOnlyCheckbox ? premiumOnlyCheckbox.checked : false;
        const isPremium = localStorage.getItem('isPremium') === 'true';
        if (!content) {
            alert('Proszę wpisać treść posta!');
            return;
        }
        if (isPremiumOnly && !isPremium) {
            alert('Tylko użytkownicy premium mogą tworzyć posty tylko dla premium!');
            return;
        }

        const response = await fetch('/add_post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                content,
                is_premium_only: isPremiumOnly ? 1 : 0,
            }),
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Post dodany:', result); // Debugowanie
            postContent.value = '';
            fetchPosts();
        } else {
            alert(result.error || 'Błąd podczas dodawania posta.');
        }
    } catch (error) {
        console.error('Błąd w addPost:', error);
        alert('Wystąpił błąd podczas dodawania posta. Sprawdź konsolę (F12).');
    }
}

export async function addComment(postId) {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('Proszę się zalogować!');
            return;
        }
        const commentContent = document.getElementById(`comment-content-${postId}`);
        if (!commentContent) {
            console.error(`Brak elementu #comment-content-${postId}`);
            return;
        }
        const content = commentContent.value.trim();
        if (!content) {
            alert('Proszę wpisać treść komentarza!');
            return;
        }

        const response = await fetch('/add_comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                post_id: postId,
                content,
            }),
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Komentarz dodany:', result); // Debugowanie
            commentContent.value = '';
            fetchPosts();
        } else {
            alert(result.error || 'Błąd podczas dodawania komentarza.');
        }
    } catch (error) {
        console.error('Błąd w addComment:', error);
        alert('Wystąpił błąd podczas dodawania komentarza. Sprawdź konsolę (F12).');
    }
}

export function togglePostComments(postId, posts) {
    try {
        const commentBox = document.getElementById(`comment-box-${postId}`);
        if (!commentBox) {
            console.error(`Brak elementu #comment-box-${postId}`);
            return;
        }

        const isPremium = localStorage.getItem('isPremium') === 'true';
        const post = posts.find(p => p.id === postId);
        if (!post) {
            console.error(`Post o id ${postId} nie znaleziony w danych`);
            return;
        }

        if (post.is_premium_only && !isPremium) {
            alert('Tylko użytkownicy premium mogą wchodzić w ten temat! Przejdź na Premium za 9,99 zł/mc na https://x.ai/grok.');
            return;
        }

        console.log(`Przełączanie comment-box-${postId}, aktualny display: ${commentBox.style.display}`); // Debugowanie
        commentBox.style.display = commentBox.style.display === 'none' ? 'block' : 'none';
    } catch (error) {
        console.error('Błąd w togglePostComments:', error);
        alert('Wystąpił błąd w społeczności. Sprawdź konsolę (F12).');
    }
}

export async function markPostAsSolved(postId) {
    try {
        const isPremium = localStorage.getItem('isPremium') === 'true';
        if (!isPremium) {
            alert("Ta funkcja jest dostępna tylko dla użytkowników Premium!");
            return;
        }

        const username = localStorage.getItem('username');
        const response = await fetch(`/posts`);
        const posts = await response.json();
        const post = posts.find(p => p.id === postId);
        if (!post) {
            alert('Post nie znaleziony!');
            return;
        }

        if (post.username !== username) {
            alert('Możesz oznaczyć tylko swoje posty!');
            return;
        }

        // Mockowe oznaczenie (brak endpointu w app.py)
        alert('Post oznaczony jako rozwiązany (mock).');
        fetchPosts();
    } catch (error) {
        console.error('Błąd w markPostAsSolved:', error);
        alert('Wystąpił błąd – sprawdź konsolę (F12).');
    }
}