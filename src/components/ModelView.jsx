import { OrbitControls, PerspectiveCamera, View, Html } from "@react-three/drei";
import * as THREE from "three";
import Lights from "./Lights";
import IPhone from "./IPhone";
import { Suspense, useEffect } from "react";
import Loader from "./Loader";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";

function GsapInvalidator() {
    const { invalidate } = useThree();
    useEffect(() => {
        gsap.ticker.add(invalidate);
        return () => gsap.ticker.remove(invalidate);
    }, [invalidate]);
    return null;
}

const ModelView = ({
    index,
    groupRef,
    gsapType,
    controlRef,
    setRotationState,
    size,
    item,
}) => {
    return (
        <View
            index={index}
            id={gsapType}
            className={`w-full h-full absolute ${index === 2 ? "right-[-100%]" : ""}`}
        >
            <GsapInvalidator />
            {/* Ambient light */}
            <ambientLight intensity={0.3} />
            <PerspectiveCamera makeDefault position={[0, 0, 4]} />
            <Lights />
            <OrbitControls 
                makeDefault
                ref={controlRef}
                enableZoom={false}
                enablePan={false}
                rotateSpeed={0.4}
                target={[0, 0, 0]}
                onEnd={() => setRotationState(controlRef.current.getAzimuthalAngle())}
            />
            <group ref={groupRef} name={`${index === 1 ? "small" : "large"}`}>
                <Suspense fallback={<Loader />}>
                    <IPhone
                        scale={index === 1 ? [15, 15, 15] : [17, 17, 17]}
                        item={item}
                        size={size}
                    />
                </Suspense>
            </group>
        </View>
    );
};

export default ModelView;
