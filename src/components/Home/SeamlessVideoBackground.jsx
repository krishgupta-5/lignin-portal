import React, { useEffect, useRef } from 'react';
import './SeamlessVideoBackground.css';

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260329_050842_be71947f-f16e-4a14-810c-06e83d23ddb5.mp4";

export default function SeamlessVideoBackground() {
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);

  useEffect(() => {
    const videos = [video1Ref.current, video2Ref.current];
    if (!videos[0] || !videos[1]) return;

    let activeIndex = 0;
    let fadingOutRef = false;
    const fadeDuration = 500;

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
        if (videos[index]) {
          videos[index].style.opacity = state.opacity;
        }

        if (progress < 1) {
          state.frameId = requestAnimationFrame(update);
        } else {
          if (callback) callback();
        }
      }
      
      state.frameId = requestAnimationFrame(update);
    }

    const handleTimeUpdate = (index) => {
      return () => {
        const video = videos[index];
        if (index !== activeIndex) return;
        if (!video.duration) return;
        
        const timeRemaining = video.duration - video.currentTime;
        
        if (timeRemaining <= 0.8 && !fadingOutRef) {
          fadingOutRef = true;
          
          const nextIndex = 1 - activeIndex;
          const nextVideo = videos[nextIndex];
          const oldVideo = videos[activeIndex];
          
          oldVideo.style.zIndex = 1;
          nextVideo.style.zIndex = 2;
          nextVideo.currentTime = 0;
          
          nextVideo.play().catch(e => console.log("Pipeline play failed:", e));
          
          animateOpacity(nextIndex, 1, () => {
            oldVideo.pause();
            oldVideo.style.opacity = 0;
            animStates[activeIndex].opacity = 0;
            
            activeIndex = nextIndex;
            
            setTimeout(() => {
              fadingOutRef = false;
            }, 200);
          });
        }
      };
    };

    const listeners = [
      handleTimeUpdate(0),
      handleTimeUpdate(1)
    ];

    videos[0].addEventListener('timeupdate', listeners[0]);
    videos[1].addEventListener('timeupdate', listeners[1]);

    // Initialize
    videos.forEach((v, i) => {
      v.muted = true;
      v.style.opacity = 0;
      v.style.zIndex = i === 0 ? 2 : 1;
    });
    
    videos[0].play().then(() => {
      animateOpacity(0, 1);
    }).catch(err => console.log("Playback failed:", err));

    return () => {
      cancelAnimation(0);
      cancelAnimation(1);
      if (videos[0]) videos[0].removeEventListener('timeupdate', listeners[0]);
      if (videos[1]) videos[1].removeEventListener('timeupdate', listeners[1]);
    };
  }, []);

  return (
    <div className="seamless-video-container">
      <video ref={video1Ref} className="seamless-video" muted playsInline>
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <video ref={video2Ref} className="seamless-video" muted playsInline>
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      {/* Dark overlay to ensure text readability */}
      <div className="seamless-video-overlay"></div>
    </div>
  );
}
