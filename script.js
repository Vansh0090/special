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
});
