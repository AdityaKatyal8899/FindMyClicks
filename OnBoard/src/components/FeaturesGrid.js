"use client";

import styles from './FeaturesGrid.module.css';
import Section from './ui/Section';
import { ScanFace, Zap, Cloud, PenTool, LayoutDashboard, Database, Layers, FolderHeart } from 'lucide-react';

const features = [
    { icon: <ScanFace size={40} />, title: "AI Face Recognition", desc: "99.9% accuracy in varied lighting." },
    { icon: <Zap size={40} />, title: "High-Speed Search", desc: "Results in under 200ms." },
    { icon: <Cloud size={40} />, title: "Secure Cloud", desc: "Enterprise-grade encryption." },
    { icon: <LayoutDashboard size={40} />, title: "Photographer Dashboard", desc: "Real-time analytics & sales." },
    { icon: <PenTool size={40} />, title: "Smart Indexing", desc: "Auto-tagging by event & time." },
    { icon: <Database size={40} />, title: "Scalable Storage", desc: "Unlimited TBs for RAW files." },
    { icon: <Layers size={40} />, title: "Event Organization", desc: "Seamless multi-day grouping." },
    { icon: <FolderHeart size={40} />, title: "Private Galleries", desc: "Client-specific access links." }
];

export default function FeaturesGrid() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <Section className={styles.header}>
                    <h2 className={styles.title}>Built for Intelligent Discovery</h2>
                </Section>

                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <Section key={index} className={styles.tile} delay={index * 0.05}>
                            <div className={styles.iconWrapper}>
                                {feature.icon}
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureDesc}>{feature.desc}</p>
                            </div>
                        </Section>
                    ))}
                </div>
            </div>
        </section>
    );
}
