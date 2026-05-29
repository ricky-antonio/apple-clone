import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { heroVideo, smallHeroVideo } from "../utils";

const Hero = () => {
    const videoRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState(
        window.innerWidth < 760 ? smallHeroVideo : heroVideo
    );

    const handleVideoSrcSet = () => {
        if (window.innerWidth < 760) {
            setVideoSrc(smallHeroVideo);
        } else {
            setVideoSrc(heroVideo);
        }
    };

    // Loop the hero clip with a fade-out/in through the black backdrop so the
    // restart feels seamless instead of an abrupt jump back to frame one.
    const handleVideoEnd = () => {
        const video = videoRef.current;
        if (!video) return;

        gsap.to(video, {
            opacity: 0,
            duration: 0.5,
            ease: "power1.out",
            onComplete: () => {
                video.currentTime = 0;
                video.play()?.catch(() => {});
                gsap.to(video, { opacity: 1, duration: 0.5, ease: "power1.in" });
            },
        });
    };

    useEffect(() => {
        let resizeTimer;
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(handleVideoSrcSet, 150);
        };
        window.addEventListener("resize", onResize);
        return () => {
            clearTimeout(resizeTimer);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    useGSAP(() => {
        gsap.to("#hero", {
            opacity: 1,
            delay: 2,
        });

        gsap.to("#cta", {
            opacity: 1,
            delay: 2,
            y: -50,
        });
    }, []);

    return (
        <section className="w-full nav-height bg-black relative">
            <div className="h-5/6 w-full flex-center flex-col">
                <p id="hero" className="hero-title">
                    iPhone 15 Pro
                </p>
                <div className="md:w-10/12 w-9/12">
                    <video
                        ref={videoRef}
                        className="pointer-events-none"
                        autoPlay
                        muted
                        playsInline={true}
                        key={videoSrc}
                        poster="/assets/images/hero.webp"
                        onEnded={handleVideoEnd}
                    >
                        <source src={videoSrc} type="video/mp4" />
                    </video>
                </div>
            </div>

            <div
                id="cta"
                className="flex flex-col items-center  opacity-0 translate-y-20"
            >
                <a href="#highlights" className="btn">
                    Buy
                </a>
                <p className="font-normal text-xl">From $199.month or $999</p>
            </div>
        </section>
    );
};

export default Hero;
