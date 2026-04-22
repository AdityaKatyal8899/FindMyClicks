"use client";

import styles from './CTASection.module.css';
import Section from './ui/Section';
import { Rocket } from 'lucide-react';

export default function CTASection() {
    return (
        <section className={styles.section}>
            <div className={styles.glow}></div>
            <div className={styles.container}>
                <Section>
                    <h2 className={styles.title}>Stop Searching. Start Finding.</h2>
                    <button className={styles.ctaButton}>
                        Launch Platform <Rocket size={20} />
                    </button>
                </Section>
            </div>
        </section>
    );
}
