import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import "./LogoAnimation.scss";

import robotCleaner from "../assets/robot-cleaner.svg";
import recliner from "../assets/recliner.svg";
import humanoid from "../assets/humanoid.svg";

export default function LogoAnimation() {
    const controls = useAnimation();
    const [phase, setPhase] = useState(0);

    const cx = 35; // L 중심 x
    const cy = 50; // L 중심 y
    const r = 60; // 공전 반경

    // 원 궤도 좌표 계산
    const orbitKeyframes = Array.from({ length: 101 }, (_, i) => {
        const t = (i / 100) * 2 * Math.PI;
        return {
            x: r * Math.cos(t),
            y: r * Math.sin(t),
        };
    });

    useEffect(() => {
        const animateSequence = async () => {
            await controls.start("tilt"); // B 쓰러짐
            for (let i = 1; i <= 3; i++) {
                setPhase(i);
                await controls.start("orbit");
            }
            await controls.start("reset");
            await controls.start("text");
        };
        animateSequence();
    }, [controls]);

    const getProductImage = () => {
        switch (phase) {
            case 1:
                return robotCleaner;
            case 2:
                return recliner;
            case 3:
                return humanoid;
            default:
                return null;
        }
    };

    return (
        <div className="logo-container">
            <motion.svg
                width="400"
                height="120"
                viewBox="0 0 400 120"
                xmlns="http://www.w3.org/2000/svg"
                initial="initial"
                animate={controls}
                className="logo-svg"
            >
                <rect width="100%" height="100%" fill="#F6F9FC" />

                <g id="logo" transform="translate(40, 20) scale(0.8)">
                    {/* L */}
                    <motion.path
                        d="M20 20 L20 80 L50 80 L50 70 L30 70 L30 20 Z"
                        fill="#0A2540"
                    />

                    {/* 공전 그룹 */}
                    <motion.g
                        id="orbit-group"
                        variants={{
                            initial: { x: 0, y: 0 },
                            tilt: {
                                y: 10,
                                transition: { duration: 0.5, ease: "easeInOut" },
                            },
                            orbit: {
                                x: orbitKeyframes.map((p) => p.x),
                                y: orbitKeyframes.map((p) => p.y),
                                transition: {
                                    duration: 3,
                                    ease: "linear",
                                },
                            },
                            reset: {
                                x: 0,
                                y: 0,
                                transition: { duration: 1, ease: "easeInOut" },
                            },
                        }}
                        style={{ transformOrigin: `${cx}px ${cy}px` }}
                    >
                        {phase === 0 && (
                            <>
                                <path
                                    d="M50 20 H 80 A 15 15 0 0 1 80 50 H 50 Z"
                                    fill="#00D9C0"
                                />
                                <path
                                    d="M50 50 H 80 A 15 15 0 0 1 80 80 H 50 Z"
                                    fill="#0A2540"
                                />
                            </>
                        )}

                        {phase > 0 && (
                            <image
                                href={getProductImage()!}
                                x="45"
                                y="25"
                                width="40"
                                height="40"
                            />
                        )}
                    </motion.g>
                </g>
            </motion.svg>

            <motion.div
                className="ending-text"
                variants={{
                    initial: { opacity: 0, y: 30 },
                    text: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 1.5, ease: "easeOut" },
                    },
                }}
            >
                Actuator that makes your{" "}
                <span className="inline-icon">
                    <svg width="24" height="24" viewBox="0 0 100 100">
                        <path d="M20 20 L20 80 L50 80 L50 70 L30 70 L30 20 Z" fill="#0A2540" />
                    </svg>
                    ife’s goods{" "}
                </span>
                <span className="inline-icon">
                    <svg width="24" height="24" viewBox="0 0 100 100">
                        <path d="M50 20 H 80 A 15 15 0 0 1 80 50 H 50 Z" fill="#00D9C0" />
                        <path d="M50 50 H 80 A 15 15 0 0 1 80 80 H 50 Z" fill="#0A2540" />
                    </svg>
                    etter
                </span>
            </motion.div>
        </div>
    );
}
