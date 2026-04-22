"use client";

import styles from './AccessLayers.module.css';
import Section from './ui/Section';
import { Camera, Users, Cloud, Lock, Search, Download } from 'lucide-react';

export default function AccessLayers() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.splitLayout}>

                    <div className={styles.divider}></div>

                    {/* Photographers Side */}
                    <Section className={`${styles.card} ${styles.photographerCard}`}>
                        <span className={styles.label}>For Photographers</span>
                        <h3 className={styles.title}>Streamline Your Workflow</h3>
                        <div className={styles.featureList}>
                            <div className={styles.feature}>
                                <div className={styles.iconWrapper}><Cloud size={16} /></div>
                                Unlimited Event Uploads
                            </div>
                            <div className={styles.feature}>
                                <div className={styles.iconWrapper}><Lock size={16} /></div>
                                Private Client Galleries
                            </div>
                            <div className={styles.feature}>
                                <div className={styles.iconWrapper}><Users size={16} /></div>
                                Manage Multiple Events
                            </div>
                        </div>
                        <div className={styles.visualMock}>
                            Dashboard Preview UI
                        </div>
                    </Section>

                    {/* Customers Side */}
                    <Section className={`${styles.card} ${styles.customerCard}`} delay={0.2}>
                        <span className={styles.label}>For Customers</span>
                        <h3 className={styles.title}>Find Your Moments</h3>
                        <div className={styles.featureList}>
                            <div className={styles.feature}>
                                <div className={styles.iconWrapper}><Camera size={16} /></div>
                                Upload One Selfie
                            </div>
                            <div className={styles.feature}>
                                <div className={styles.iconWrapper}><Search size={16} /></div>
                                Instant Global Search
                            </div>
                            <div className={styles.feature}>
                                <div className={styles.iconWrapper}><Download size={16} /></div>
                                High-Res Downloads
                            </div>
                        </div>
                        <div className={styles.visualMock}>
                            Gallery Preview UI
                        </div>
                    </Section>

                </div>
            </div>
        </section>
    );
}
