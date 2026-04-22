"use client";

import styles from './HowItWorks.module.css';
import Section from './ui/Section';
import { Upload, ScanFace, Search } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            icon: <Upload size={24} />,
            title: "Upload",
            text: "Photographers upload high-resolution event images securely to our private cloud."
        },
        {
            icon: <ScanFace size={24} />,
            title: "Match",
            text: "Our AI instantly indexes faces and creates high-speed search embeddings for every person."
        },
        {
            icon: <Search size={24} />,
            title: "Discover",
            text: "Customers upload a single reference selfie and instantly find every moment they appear in."
        }
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <Section className={styles.header}>
                    <h2 className={styles.title}>Powered by Intelligent Face Recognition</h2>
                </Section>

                <div className={styles.grid}>
                    {steps.map((step, index) => (
                        <Section key={index} className={styles.card} delay={index * 0.1}>
                            <div className={styles.icon}>{step.icon}</div>
                            <h3 className={styles.cardTitle}>{step.title}</h3>
                            <p className={styles.cardText}>{step.text}</p>
                        </Section>
                    ))}
                </div>
            </div>
        </section>
    );
}
