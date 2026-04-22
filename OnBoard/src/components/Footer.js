import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.top}>

                    <div className={styles.brandCol}>
                        <div className={styles.logo}>FindMyClicks.Ai</div>
                        <p className={styles.mission}>
                            Revolutionizing event photography with AI-powered face search. No more scrolling. Just moments.
                        </p>
                    </div>

                    <div>
                        <h4 className={styles.colTitle}>Product</h4>
                        <div className={styles.links}>
                            <Link href="#" className={styles.link}>Photographers</Link>
                            <Link href="#" className={styles.link}>Customers</Link>
                            <Link href="#" className={styles.link}>Pricing</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className={styles.colTitle}>Company</h4>
                        <div className={styles.links}>
                            <Link href="#" className={styles.link}>About</Link>
                            <Link href="#" className={styles.link}>Careers</Link>
                            <Link href="#" className={styles.link}>Blog</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className={styles.colTitle}>Contact</h4>
                        <div className={styles.links}>
                            <Link href="#" className={styles.link}>Support</Link>
                            <Link href="#" className={styles.link}>Sales</Link>
                            <Link href="#" className={styles.link}>Legal</Link>
                        </div>
                    </div>

                </div>

                <div className={styles.bottom}>
                    <div>&copy; 2026 FaceFind.ai. All rights reserved.</div>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <Link href="#" className={styles.link}>Privacy Policy</Link>
                        <Link href="#" className={styles.link}>Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
