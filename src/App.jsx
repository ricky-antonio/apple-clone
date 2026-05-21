import { lazy, Suspense, useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Highlights from "./components/Highlights";
import * as Sentry from "@sentry/react";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";
import { BeatLoader } from "react-spinners";

const Model = lazy(() => import("./components/Model"));

const App = () => {
    const [showModel, setShowModel] = useState(false);
    const modelPlaceholderRef = useRef(null);

    useEffect(() => {
        const el = modelPlaceholderRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setShowModel(true); },
            { rootMargin: "300px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <main className="bg-black">
            <Navbar />
            <Hero />
            <Highlights />
            <div ref={modelPlaceholderRef}>
                {showModel ? (
                    <Suspense fallback={
                        <section className="common-padding">
                            <div className="screen-max-width">
                                <h1 className="section-heading">Take a closer look.</h1>
                                <div className="w-full h-[75vh] md:h-[90vh] flex-center">
                                    <BeatLoader color="#86868b" size={20} />
                                </div>
                            </div>
                        </section>
                    }>
                        <Model />
                    </Suspense>
                ) : (
                    <section className="common-padding">
                        <div className="screen-max-width">
                            <h1 className="section-heading">Take a closer look.</h1>
                            <div className="w-full h-[75vh] md:h-[90vh]" />
                        </div>
                    </section>
                )}
            </div>
            <Features />
            <HowItWorks />
            <Footer />
        </main>
    );
};

const AppWithProfiler = Sentry.withProfiler(App);
AppWithProfiler.displayName = "AppWithProfiler";

export default AppWithProfiler;
