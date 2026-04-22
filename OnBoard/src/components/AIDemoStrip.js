"use client";

import styles from './AIDemoStrip.module.css';
import Section from './ui/Section';

export default function AIDemoStrip() {
    return (
        <section className={styles.section}>
            <div className={styles.glowBackground}></div>

            <div className={styles.container}>
                <Section className={styles.header}>
                    <h2 className={styles.title}>Built for Large-Scale Events</h2>
                    <p className={styles.subtitle}>
                        From weddings to corporate events, instantly deliver thousands of photos without manual sorting.
                    </p>
                </Section>

                <Section className={styles.demoWindow} delay={0.2}>
                    <div className={styles.grid}>
                        {/* Mock grid of images */}
                        {[...Array(15)].map((_, i) => (
                            <div key={i} className={styles.gridItem}></div>
                        ))}
                    </div>
                    <div className={styles.scannerOverlay}></div>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#fff',
                        fontWeight: '600'
                    }}>
                        Processing 10,000+ images...
                    </div>
                </Section>
            </div>
        </section>
    );
}
