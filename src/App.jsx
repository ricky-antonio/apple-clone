import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Highlights from "./components/Highlights";
import Model from "./components/Model";
import * as Sentry from "@sentry/react";

const App = () => {
    return (
        <main className="bg-black">
            <Navbar />
            <Hero />
            <Highlights />
            <Model />
        </main>
    );
};

const AppWithProfiler = Sentry.withProfiler(App);
AppWithProfiler.displayName = "AppWithProfiler";

export default AppWithProfiler;
