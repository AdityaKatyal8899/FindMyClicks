'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './LoginHeading.module.css';

const MODE_CONFIG = {
    login: {
        primary: 'Welcome Back',
        secondary: 'Good to see you again.',
    },
    start: {
        primary: 'Hey There!',
        secondary: 'Please log in to continue.',
    },
    photographer: {
        primary: 'Ready to Scale with AI?',
        secondary: 'Log in to manage your events.',
    },
    customer: {
        primary: 'Find Your Moments',
        secondary: 'Upload a selfie to begin.',
    },
};

const ROTATING_LINES = [
    'AI-powered photo discovery.',
    'Instant face search.',
    'Event intelligence, simplified.',
];

const DEFAULT_PRIMARY = 'Sign In to Continue';

export default function LoginHeading() {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const config = MODE_CONFIG[mode] || null;

    const primary = config?.primary ?? DEFAULT_PRIMARY;

    // Combine mode-specific secondary with standard rotating lines
    const lines = config?.secondary
        ? [config.secondary, ...ROTATING_LINES]
        : ROTATING_LINES;

    const [lineIndex, setLineIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Reset index if mode changes
        setLineIndex(0);
        setVisible(true);

        const interval = setInterval(() => {
            // Fade out
            setVisible(false);
            setTimeout(() => {
                setLineIndex((i) => (i + 1) % lines.length);
                // Fade in
                setVisible(true);
            }, 300);
        }, 5000);

        return () => clearInterval(interval);
    }, [mode, lines.length]);

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.primary}>{primary}</h1>
            <p
                className={styles.secondary}
                style={{ opacity: visible ? 1 : 0 }}
            >
                {lines[lineIndex]}
            </p>
        </div>
    );
}
