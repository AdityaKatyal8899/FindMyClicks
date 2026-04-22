"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './login.module.css';
import LoginHeading from '../../components/LoginHeading';

export default function LoginPage() {
    const { data: session, status } = useSession();
    const exchanged = useRef(false);

    const [justLoggedIn, setJustLoggedIn] = useState(false);
    const [loggedInEmail, setLoggedInEmail] = useState('');
    const [error, setError] = useState('');
    const [googleLoading, setGoogleLoading] = useState(false);

    const redirectToDashboard = () => {
        console.log(`[Redirect] Login successful, heading to dashboard...`);
        window.location.href = '/';
    };

    // After Google OAuth completes, exchange for platform JWT (runs once)
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.email && !exchanged.current && !justLoggedIn) {
            exchanged.current = true;
            exchangeGoogleForPlatformToken(session.user.email, session.user.name);
        }
    }, [status, session]);

    // Check for existing login on mount to redirect immediately
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (status === 'authenticated' && token && !justLoggedIn) {
            redirectToDashboard();
        }
    }, [status, justLoggedIn]);

    const exchangeGoogleForPlatformToken = async (email, name) => {
        try {
            const res = await fetch('/api/auth/google-callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, role: 'user' }),
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userRole', data.user.role);
                setLoggedInEmail(data.user.email);
                setJustLoggedIn(true);

                // Immediate redirect
                redirectToDashboard();
            } else {
                setError(data.message || 'Failed to issue platform token');
            }
        } catch {
            setError('Error completing Google login');
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError('');
        exchanged.current = false;
        await signIn('google', { redirect: false });
        setGoogleLoading(false);
    };

    const handleLogout = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        await signOut({ redirect: false });
        setJustLoggedIn(false);
        setLoggedInEmail('');
        exchanged.current = false;
    };

    if (status === 'loading') {
        return (
            <main className={styles.main}>
                <div className={styles.loginCard}>
                    <p className={styles.subtitle}>Checking session...</p>
                </div>
            </main>
        );
    }

    if (status === 'authenticated' && !justLoggedIn) {
        return (
            <main className={styles.main}>
                <div className={styles.loginCard}>
                    <Suspense fallback={<div style={{ height: '4rem' }} />}>
                        <LoginHeading />
                    </Suspense>
                    <div className={styles.alreadyLoggedIn}>
                        <p className={styles.subtitle} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            Redirecting to your dashboard...
                        </p>
                        <button className={styles.logoutButton} onClick={handleLogout}>
                            Log Out
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.loginCard}>
                <Suspense fallback={<div style={{ height: '4rem' }} />}>
                    <LoginHeading />
                </Suspense>

                <p className={styles.subtitle} style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    Sign in to access your private photo gallery and face-search tools.
                </p>

                <button
                    className={styles.googleButton}
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    style={{ padding: '1.25rem', fontSize: '1.125rem' }}
                >
                    <svg width="24" height="24" viewBox="0 0 18 18" fill="none" style={{ marginRight: '1rem' }}>
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                        <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                    </svg>
                    {googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
                </button>

                {error && <p className={styles.error} style={{ marginTop: '1.5rem' }}>{error}</p>}

                <div className={styles.footer} style={{ marginTop: '3rem' }}>
                    <Link href="/" className={styles.backLink}>← Back to Home</Link>
                </div>
            </div>
        </main>
    );
}
