"use client";

import styles from './VisualElement.module.css';

export default function VisualElement() {
    return (
        <div className={styles.container}>
            {/* Reference Card (Background) */}
            <div className={`${styles.card} ${styles.referenceCard}`}>
                <div className={styles.imagePlaceholder}>
                    <div className={styles.faceMock} style={{ filter: 'grayscale(100%) opacity(0.7)' }}></div>
                </div>
                <div className={styles.meta}>
                    <div className={styles.metaLine}></div>
                    <div className={`${styles.metaLine} ${styles.short}`}></div>
                </div>
            </div>

            {/* Match Card (Foreground) */}
            <div className={`${styles.card} ${styles.matchCard}`}>
                <div className={styles.matchIndicator}>
                    <div className={styles.matchDot}></div>
                    99.8% Match
                </div>
                <div className={styles.imagePlaceholder}>
                    <div className={styles.scanLine}></div>
                    <div className={styles.faceMock}></div>
                    <div className={styles.boundingBox}>
                        <div className={`${styles.corner} ${styles.tl}`}></div>
                        <div className={`${styles.corner} ${styles.tr}`}></div>
                        <div className={`${styles.corner} ${styles.bl}`}></div>
                        <div className={`${styles.corner} ${styles.br}`}></div>
                    </div>
                </div>
                <div className={styles.meta}>
                    <div className={styles.metaLine} style={{ width: '85%', background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.4), rgba(59, 130, 246, 0.4))' }}></div>
                    <div className={`${styles.metaLine} ${styles.short}`}></div>
                </div>
            </div>
        </div>
    );
}
