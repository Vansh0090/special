document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Card Dragging Logic
    const cards = document.querySelectorAll('.glass-card');
    let topZIndex = 100;

    cards.forEach(card => {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        // Bring card to front on mousedown/touchstart
        const bringToFront = () => {
            topZIndex++;
            card.style.zIndex = topZIndex;
        };

        const onDragStart = (e) => {
            if (e.target.closest('.card-glare')) return; // Ignore if clicking purely on some overlay? 
            bringToFront();
            isDragging = true;
            
            // Support both mouse and touch
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

            startX = clientX;
            startY = clientY;

            // Get current transform styles to prevent jump
            const style = window.getComputedStyle(card);
            const matrix = new WebKitCSSMatrix(style.transform);
            initialX = matrix.m41;
            initialY = matrix.m42;

            // Optional: Get rotation to keep it during drag
            // Simple way without complex matrix math: just rely on the inline style rotation 
            // since we're using translate to move it on top of existing rotation.

            card.style.transition = 'none'; // Disable transition while dragging

            document.addEventListener('mousemove', onDragMove, { passive: false });
            document.addEventListener('touchmove', onDragMove, { passive: false });
            document.addEventListener('mouseup', onDragEnd);
            document.addEventListener('touchend', onDragEnd);
        };

        const onDragMove = (e) => {
            if (!isDragging) return;
            e.preventDefault(); // Prevent scrolling on touch

            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

            const dx = clientX - startX;
            const dy = clientY - startY;

            // Extract the rotation from inline style if exists
            const rawTransform = card.style.transform;
            let currentRotate = 'rotate(0deg)';
            if (rawTransform && rawTransform.includes('rotate')) {
                const match = rawTransform.match(/rotate\([^)]+\)/);
                if (match) currentRotate = match[0];
            }

            card.style.transform = `translate(${initialX + dx}px, ${initialY + dy}px) ${currentRotate}`;
        };

        const onDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            
            // Re-enable transition for smooth hover effects
            card.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.2s ease, scale 0.2s ease';

            document.removeEventListener('mousemove', onDragMove);
            document.removeEventListener('touchmove', onDragMove);
            document.removeEventListener('mouseup', onDragEnd);
            document.removeEventListener('touchend', onDragEnd);
        };

        card.addEventListener('mousedown', onDragStart);
        card.addEventListener('touchstart', onDragStart, { passive: false });
    });

    // 2. Parallax Effect based on Mouse Movement
    const parallaxOrbs = document.querySelectorAll('.orb, .dust');
    
    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth - e.pageX) / 100;
        const y = (window.innerHeight - e.pageY) / 100;

        parallaxOrbs.forEach(orb => {
            const speed = parseFloat(orb.getAttribute('data-speed')) || 1;
            const moveX = x * speed;
            const moveY = y * speed;
            // The float animation is already using transform, so we use margin or left/top for this parallax 
            // to avoid overriding the CSS float keyframes.
            orb.style.marginLeft = `${moveX}px`;
            orb.style.marginTop = `${moveY}px`;
        });
    });

    // 3. Envelope Interaction
    const envelope = document.querySelector('.envelope');
    const envelopeWrapper = document.getElementById('envelope-wrapper');

    if (envelopeWrapper && envelope) {
        envelopeWrapper.addEventListener('click', () => {
            envelope.classList.toggle('open');
            
            if (envelope.classList.contains('open')) {
                setTimeout(() => {
                    envelopeWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 800);
            }
        });
    }

    // 4. Scroll Reveal Animations
    const fadeElements = document.querySelectorAll('.fade-in-element');
    
    // Create the observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // Remove visible class so it replays animation when scrolling up/down
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(el => observer.observe(el));

    // 5. Scroll Progress Tracking
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) progressBar.style.width = scrolled + "%";
    });

    // 6. Floating Hearts Interaction
    const hearts = ['❤️', '💖', '✨', '🌸', '🤍', '💙'];
    window.addEventListener('click', (e) => {
        // Don't spawn hearts if clicking on the Wish button specifically (optional, but feels cleaner)
        if (e.target.closest('#generate-wish-btn')) return;

        createHeart(e.clientX, e.clientY);
    });

    function createHeart(x, y) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        
        // Random drift and rotation
        const dx = (Math.random() - 0.5) * 100; // -50 to 50
        const rot = (Math.random() - 0.5) * 45; // -22.5 to 22.5 deg
        heart.style.setProperty('--dx', `${dx}px`);
        heart.style.setProperty('--rot', `${rot}deg`);

        document.body.appendChild(heart);

        // Remove element after animation ends
        setTimeout(() => {
            heart.remove();
        }, 2000);
    }

    // 7. Wish Generator Logic
    const wishes = [
        "You are the best thing that ever happened to me. ❤️",
        "Every day with you is a new favorite memory. ✨",
        "I'm so lucky to have you by my side, Vritu. 💙",
        "Your smile is my favorite sight in the whole world. 💖",
        "Thank you for being you. You're incredible. 🌸",
        "I love you more than words can ever describe. 🤍",
        "You make my heart skip a beat every single time. 💓",
        "Counting down the moments until I see you again. ⏳",
        "You are my sunshine on the cloudiest days. ☀️",
        "To the moon and back, forever. 🌙"
    ];

    const wishBtn = document.getElementById('generate-wish-btn');
    const wishText = document.getElementById('wish-text');
    let lastWishIndex = -1;

    if (wishBtn && wishText) {
        wishBtn.addEventListener('click', (e) => {
            // Spawn some hearts specifically for the button click
            for(let i=0; i<5; i++) {
                setTimeout(() => {
                    createHeart(e.clientX + (Math.random()-0.5)*40, e.clientY + (Math.random()-0.5)*40);
                }, i * 100);
            }

            // Animate text change
            wishText.classList.add('wish-text-animate');

            setTimeout(() => {
                let newIndex;
                do {
                    newIndex = Math.floor(Math.random() * wishes.length);
                } while (newIndex === lastWishIndex);
                
                lastWishIndex = newIndex;
                wishText.innerText = wishes[newIndex];
                wishText.classList.remove('wish-text-animate');
            }, 400);
        });
    }

    // --- NEW FEATURES LOGIC ---

    // 8. Pulsing Heart & Secret Message Logic
    const heartBtn = document.getElementById('heart-btn');
    const heartOverlay = document.getElementById('heart-overlay');
    const typewriterEl = document.getElementById('typewriter-text');
    const closeOverlay = document.getElementById('close-overlay');

    const secretMessage = "In every world, and in every lifetime, I would still look for you. You are my home, my peace, and my greatest adventure. I love you beyond words, Vritu. ❤️";

    function typeWriter(text, i, fnCallback) {
        if (i < text.length) {
            typewriterEl.innerHTML = text.substring(0, i + 1) + '<span aria-hidden="true" class="cursor">|</span>';
            setTimeout(function() {
                typeWriter(text, i + 1, fnCallback)
            }, 50).catch(e => {}); // catch potential aborts
        } else if (typeof fnCallback == 'function') {
            setTimeout(fnCallback, 700);
        }
    }

    function createBurst() {
        // Create both Hearts and Sparkles
        for (let i = 0; i < 30; i++) {
            // Hearts (using existing logic if possible or similar)
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'floating-heart';
                heart.innerHTML = ['❤️', '💖', '✨', '🌸'][Math.floor(Math.random() * 4)];
                heart.style.left = Math.random() * 100 + 'vw';
                heart.style.top = Math.random() * 100 + 'vh';
                heart.style.setProperty('--dx', (Math.random() - 0.5) * 200 + 'px');
                heart.style.setProperty('--rot', Math.random() * 360 + 'deg');
                document.body.appendChild(heart);
                setTimeout(() => heart.remove(), 2000);

                // Sparkles
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle-particle';
                const size = Math.random() * 6 + 2;
                sparkle.style.width = size + 'px';
                sparkle.style.height = size + 'px';
                sparkle.style.left = '50vw';
                sparkle.style.top = '50vh';
                sparkle.style.setProperty('--dx', (Math.random() - 0.5) * 600 + 'px');
                sparkle.style.setProperty('--dy', (Math.random() - 0.5) * 600 + 'px');
                document.body.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 1500);
            }, i * 50);
        }
    }

    if (heartBtn && heartOverlay) {
        heartBtn.addEventListener('click', () => {
            heartOverlay.classList.add('active');
            typewriterEl.innerHTML = "";
            createBurst();
            setTimeout(() => {
                typeWriter(secretMessage, 0);
            }, 800);
        });

        closeOverlay.addEventListener('click', () => {
            heartOverlay.classList.remove('active');
        });
    }

    // 9. Journey Counter Logic removed

    // 10. Floating Lanterns removed

    // 11. Reasons Why Card Deck Population
    const reasons = [
        { icon: "✨", title: "Your Kindness", text: "The way you care for everyone around you inspires me every single day." },
        { icon: "🎨", title: "Your Creativity", text: "Everything you touch becomes more beautiful. Your perspective is a gift." },
        { icon: "😊", title: "Your Smile", text: "It's literally my favorite thing in the world. It can light up the darkest room." },
        { icon: "🔥", title: "Your Passion", text: "Seeing you talk about things you love makes me fall for you all over again." },
        { icon: "🛡️", title: "Safe Space", text: "With you, I can be 100% myself without any fear. You are my home." },
        { icon: "💝", title: "My Everything", text: "In a world of billions, it will always be you. You're the piece of me I never knew was missing. I love you beyond forever." }
    ];

    const deck = document.getElementById('card-deck');
    if (deck) {
        reasons.forEach((reason, index) => {
            const card = document.createElement('div');
            card.className = 'reason-card';
            // Scatter cards slightly using CSS variable to avoid overriding CSS flip transform
            const angle = (Math.random() - 0.5) * 10;
            card.style.setProperty('--rot', `${angle}deg`);
            card.style.zIndex = reasons.length - index;

            card.innerHTML = `
                <div class="card-face card-front">
                    <div class="card-icon">${reason.icon}</div>
                    <h4>${reason.title}</h4>
                </div>
                <div class="card-face card-back">
                    <p>${reason.text}</p>
                </div>
            `;

            card.addEventListener('click', () => {
                // If the card is already flipped, we cycle it to the back
                if (card.classList.contains('flipped')) {
                    card.classList.add('cycling');
                    
                    setTimeout(() => {
                        card.classList.remove('flipped');
                        card.classList.remove('cycling');
                        
                        // Push to the bottom of the stack
                        // We do this by finding the current lowest z-index and going below it, 
                        // or just managing a stack of z-indices.
                        // Simple way: get all cards, shift their z-indices up, and put this one at 1.
                        const allCards = Array.from(document.querySelectorAll('.reason-card'));
                        allCards.forEach(c => {
                            const currentZ = parseInt(c.style.zIndex) || 0;
                            c.style.zIndex = currentZ + 1;
                        });
                        card.style.zIndex = "1";
                    }, 800); // Matches CSS animation duration
                } else {
                    // Just flip it
                    card.classList.add('flipped');
                    card.style.zIndex = 1000;
                }
            });

            deck.appendChild(card);
        });
    }

    // 12. Axiom Sync: Autonomous Region Detection
    async function syncTimezone() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            console.log(`[Axiom Sync] Local Region Detected: ${timezone}`);
            
            const response = await fetch('/api/sync-timezone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timezone })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`[Axiom Sync] Backend updated: ${data.timezone}`);
            }
        } catch (err) {
            console.warn('[Axiom Sync] Backend unavailable or unreachable.');
        }
    }
    
    // Trigger sync on load
    syncTimezone();
});
