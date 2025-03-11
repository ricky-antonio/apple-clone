import { Html } from "@react-three/drei";
import React from "react";
import { BeatLoader } from "react-spinners";

const Loader = () => {
    return (
        <Html>
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
                <div className="w-[10vw] h-[10vh] rounded-full">
                <BeatLoader color="#86868b"  size={30} />
                    </div>
            </div>
        </Html>
    );
};

export default Loader;
