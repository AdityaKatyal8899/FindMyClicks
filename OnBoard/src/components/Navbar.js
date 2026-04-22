"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    FindMyClicks.Ai
                </Link>

                <div className={styles.rightSection}>
                    <div className={styles.links}>
                        <Link href="#" className={styles.link}>Photographers</Link>
                        <Link href="#" className={styles.link}>Customers</Link>
                        <Link href="#" className={styles.link}>Login</Link>
                    </div>

                    <Link href="#" className={styles.cta}>
                        Get Started <ChevronRight size={16} />
                    </Link>
                </div>
            </div>
        </nav>
    );
}
