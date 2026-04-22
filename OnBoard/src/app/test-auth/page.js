"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './test-auth.module.css';

export default function TestAuthPage() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Unauthorized');
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                if (res.ok) {
                    setUser(data);
                } else {
                    setError('Unauthorized');
                    localStorage.removeItem('token');
                }
            } catch (err) {
                setError('Error connecting to authentication service');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <main className={styles.main}>
                <div className={styles.loader}>Verifying Authentication...</div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.card}>
                <h1 className={styles.title}>Authentication Test</h1>

                {error ? (
                    <div className={styles.errorSection}>
                        <p className={styles.errorMessage}>{error}</p>
                        <p className={styles.hint}>Please login to view this page.</p>
                        <Link href="/login" className={styles.loginButton}>
                            Go to Login
                        </Link>
                    </div>
                ) : (
                    <div className={styles.userSection}>
                        <div className={styles.successBadge}>Verified</div>

                        <div className={styles.infoGrid}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>User ID:</span>
                                <span className={styles.value}>{user.userId}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Email:</span>
                                <span className={styles.value}>{user.email}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Role:</span>
                                <span className={styles.roleTag}>{user.role}</span>
                            </div>
                        </div>

                        <button onClick={handleLogout} className={styles.logoutButton}>
                            Sign Out
                        </button>
                    </div>
                )}

                <div className={styles.footer}>
                    <Link href="/" className={styles.homeLink}>← Return to Home</Link>
                </div>
            </div>
        </main>
    );
}
