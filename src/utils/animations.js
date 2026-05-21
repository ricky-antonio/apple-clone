import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);

let _invalidate = null;
export const setInvalidate = (fn) => { _invalidate = fn; };

export const animateWithGsap = (target, animationProps, scrollProps) => {
    gsap.to(target, {
        ...animationProps,
        scrollTrigger: {
            trigger: target,
            toggleActions: "restart reverse restart reverse",
            start: "top 85%",
            ...scrollProps,
        },
    });
};

export const animateWithGsapTimeline = (
    timeline,
    rotationRef,
    rotationState,
    firstTarget,
    secondTarget,
    animationProps
) => {
    const onUpdate = () => _invalidate?.();

    timeline.to(rotationRef.current.rotation, {
        y: rotationState,
        duration: 1,
        ease: "power2.inOut",
        onUpdate,
    });

    timeline.to(
        firstTarget,
        {
            ...animationProps,
            ease: "power2.inOut",
            onUpdate,
        },
        "<"
    );

    timeline.to(
        secondTarget,
        {
            ...animationProps,
            ease: "power2.inOut",
            onUpdate,
        },
        "<"
    );
};
