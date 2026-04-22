'use client';

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect, Children, cloneElement } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Dock.module.css';
import { Home, Camera, Users, LogIn, Sparkles, ArrowUp } from 'lucide-react';

function DockItem({ children, className = '', onClick, mouseX, spring, distance, magnification, baseItemSize }) {
    const ref = useRef(null);
    const isHovered = useMotionValue(0);

    const itemX = useMotionValue(0);

    useEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            itemX.set(rect.x + rect.width / 2);
        }

        // Recalculate on resize
        const handleResize = () => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                itemX.set(rect.x + rect.width / 2);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [itemX]);

    // Framer Motion's useTransform acts differently than the original code's expectation for raw values
    // We need to calculate distance from mouseX to the item's center
    const mouseDistance = useTransform(mouseX, (val) => {
        // We can't easily get the rect inside the transform callback in a performant way without a ref that stays updated
        // Simplified: use the distance logic
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return Infinity;
        const centerX = rect.x + rect.width / 2;
        return val - centerX;
    });

    const widthSync = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
    const width = useSpring(widthSync, spring);

    return (
        <motion.div
            ref={ref}
            style={{
                width,
                height: width
            }}
            onHoverStart={() => isHovered.set(1)}
            onHoverEnd={() => isHovered.set(0)}
            onFocus={() => isHovered.set(1)}
            onBlur={() => isHovered.set(0)}
            onClick={onClick}
            className={`${styles.dockItem} ${className}`}
            tabIndex={0}
            role="button"
        >
            {Children.map(children, child => cloneElement(child, { isHovered }))}
        </motion.div>
    );
}

function DockLabel({ children, className = '', ...rest }) {
    const { isHovered } = rest;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = isHovered.on('change', latest => {
            setIsVisible(latest === 1);
        });
        return () => unsubscribe();
    }, [isHovered]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 10, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: 10, x: "-50%" }}
                    transition={{ duration: 0.2 }}
                    className={`${styles.dockLabel} ${className}`}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function DockIcon({ children, className = '' }) {
    return <div className={`${styles.dockIcon} ${className}`}>{children}</div>;
}

export default function Dock({
    spring = { mass: 0.1, stiffness: 150, damping: 12 },
    magnification = 60,
    distance = 140,
    baseItemSize = 40
}) {
    const mouseX = useMotionValue(Infinity);
    const router = useRouter();

    const items = [
        { icon: <Home size={20} />, label: "Home", onClick: () => window.location.href = '/' },
        { icon: <Camera size={20} />, label: "Photographers", onClick: () => router.push('/login?mode=photographer') },
        { icon: <Users size={20} />, label: "Customers", onClick: () => router.push('/login?mode=customer') },
        { icon: <LogIn size={20} />, label: "Login", onClick: () => router.push('/login?mode=login') },
        { icon: <Sparkles size={20} />, label: "Get Started", onClick: () => router.push('/login?mode=start') },
        { icon: <ArrowUp size={20} />, label: "Scroll to Top", onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    ];

    return (
        <motion.div
            className={styles.dockOuter}
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
        >
            <div className={styles.dockPanel}>
                {items.map((item, index) => (
                    <DockItem
                        key={index}
                        onClick={item.onClick}
                        mouseX={mouseX}
                        spring={spring}
                        distance={distance}
                        magnification={magnification}
                        baseItemSize={baseItemSize}
                    >
                        <DockIcon>{item.icon}</DockIcon>
                        <DockLabel>{item.label}</DockLabel>
                    </DockItem>
                ))}
            </div>
        </motion.div>
    );
}
