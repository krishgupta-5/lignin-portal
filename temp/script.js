document.addEventListener('DOMContentLoaded', () => {
    const videos = [
        document.getElementById('bg-video-1'),
        document.getElementById('bg-video-2')
    ];
    
    let activeIndex = 0;
    let fadingOutRef = false;
    const fadeDuration = 500; // Increased duration for smoother blend

    const animStates = [
        { frameId: null, opacity: 0 },
        { frameId: null, opacity: 0 }
    ];

    function cancelAnimation(index) {
        if (animStates[index].frameId !== null) {
            cancelAnimationFrame(animStates[index].frameId);
            animStates[index].frameId = null;
        }
    }

    function animateOpacity(index, targetOpacity, callback) {
        cancelAnimation(index);
        
        const state = animStates[index];
        const startOpacity = state.opacity;
        const distance = targetOpacity - startOpacity;
        
        if (distance === 0) {
            if (callback) callback();
            return;
        }

        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            let progress = elapsed / fadeDuration;
            if (progress > 1) progress = 1;

            state.opacity = startOpacity + (distance * progress);
            videos[index].style.opacity = state.opacity;

            if (progress < 1) {
                state.frameId = requestAnimationFrame(update);
            } else {
                if (callback) callback();
            }
        }
        
        state.frameId = requestAnimationFrame(update);
    }

    videos.forEach((video, index) => {
        video.addEventListener('timeupdate', () => {
            if (index !== activeIndex) return;
            if (!video.duration) return;
            
            const timeRemaining = video.duration - video.currentTime;
            
            // Trigger earlier so the fade finishes before the video ends
            if (timeRemaining <= 0.8 && !fadingOutRef) {
                fadingOutRef = true;
                
                const nextIndex = 1 - activeIndex;
                const nextVideo = videos[nextIndex];
                const oldVideo = videos[activeIndex];
                
                // Keep the old video fully visible at z-index 1
                oldVideo.style.zIndex = 1;
                
                // Put the new video on top at z-index 2 and fade it in
                nextVideo.style.zIndex = 2;
                nextVideo.currentTime = 0;
                nextVideo.play().catch(e => console.log("Pipeline play failed:", e));
                
                // Fade IN the new video ON TOP of the old video
                animateOpacity(nextIndex, 1, () => {
                    // Once fully faded in, we can safely hide and pause the old video
                    oldVideo.pause();
                    oldVideo.style.opacity = 0;
                    animStates[activeIndex].opacity = 0;
                    
                    activeIndex = nextIndex;
                    
                    setTimeout(() => {
                        fadingOutRef = false;
                    }, 200);
                });
            }
        });
    });

    // Initialize videos
    videos.forEach((v, i) => {
        v.muted = true;
        v.style.opacity = 0;
        v.style.zIndex = i === 0 ? 2 : 1;
    });
    
    // Start playback of the first video
    videos[0].play().then(() => {
        animateOpacity(0, 1);
    }).catch(err => console.log("Playback failed:", err));
});
