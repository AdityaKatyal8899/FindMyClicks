"use client";

import styles from './Hero.module.css';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

// Placeholder images
const images = [
    "photo-1570295999919-56ceb5ecca61?w=500&q=80", // Cyberpunk Street
    "photo-1620641788421-7f1c338e420c?w=500&q=80", // Neon Anime Vibe
    "photo-1605675380501-60f009aebf99?w=500&q=80", // Future City
    "photo-1563089145-599997674d42?w=500&q=80",   // Neon Lights
    "photo-1511512578047-dfb367046420?w=500&q=80", // Gaming/Neon
    "photo-1505356822725-d889846e6912?w=500&q=80", // Anime Style
    "photo-1607513168936-9b61e7e562c6?w=500&q=80", // Cyberpunk Colors
    "photo-1535930749574-1399327ce78f?w=500&q=80", // Neon Glow
];

const stripImages = [...images, ...images, ...images];

const headlineWords1 = "Your Moments".split(" ");
const headlineWords2 = "Discovered Instantly".split(" ");

export default function Hero() {

    const scrollToNext = () => {
        const nextSection = document.querySelector('section:nth-of-type(2)');
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
        }
    };

    return (
        <section className={styles.hero}>
            <div className={styles.centerGlow}></div>

            {/* 1. Text Block */}
            <motion.div
                className={styles.heroTextBlock}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <div className={styles.content}>
                    <h1 className={styles.headline}>
                        {headlineWords1.map((word, i) => (
                            <motion.span
                                key={`l1-${i}`}
                                className={styles.wordWrapper}
                                initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{
                                    duration: 0.7,
                                    delay: i * 0.18,
                                    ease: [0.16, 1, 0.3, 1]
                                }}
                            >
                                {word}
                            </motion.span>
                        ))}
                        <span style={{ width: '100%', display: 'none' }} />
                    </h1>
                    <h1 className={styles.headline} style={{ marginTop: '-0.5rem' }}>
                        {headlineWords2.map((word, i) => (
                            <motion.span
                                key={`l2-${i}`}
                                className={styles.wordWrapper}
                                initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{
                                    duration: 0.7,
                                    delay: (headlineWords1.length * 0.18) + (i * 0.18),
                                    ease: [0.16, 1, 0.3, 1]
                                }}
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h1>

                    <motion.p
                        className={styles.subheadline}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
                    >
                        Upload one reference image. Our AI scans thousands of event photos in seconds to find you.
                    </motion.p>
                </div>

                <motion.div
                    className={styles.scrollIndicator}
                    onClick={scrollToNext}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
                >
                    <span className={styles.scrollText}>Scroll to Explore</span>
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className={styles.scrollArrow}
                    >
                        <ArrowDown size={20} strokeWidth={1.5} />
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* 2. Gallery Block */}
            <motion.div
                className={styles.galleryBlock}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 1.6, ease: "easeOut" }}
            >
                <div className={styles.centerHighlight}></div>
                <div className={styles.stripContainer}>
                    {stripImages.map((src, index) => (
                        <div key={index} className={styles.imageCard}>
                            <img
                                src={`https://images.unsplash.com/${src}`}
                                alt="Event Moment"
                                draggable="false"
                            />
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* 3. CTA Section */}
            <motion.div
                className={styles.ctaSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
            >
                <button className={`${styles.button} ${styles.primaryButton}`}>
                    Get Started
                </button>
                <button className={`${styles.button} ${styles.secondaryButton}`}>
                    I’m a Photographer
                </button>
            </motion.div>
        </section>
    );
}
