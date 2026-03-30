import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// --- Custom SVG Icons ---
const ChevronDownIcon = ({ size = 24, className = "" }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
    >
        <path d="M6 9l6 6 6-6" />
    </svg>
);

// --- Custom Hook for Scroll Reveal ---
const Reveal = ({ children, width = "fit-content", delay = 0 }) => {
    return (
        <div style={{ position: "relative", width, overflow: "hidden" }}>
            <motion.div
                initial={{ opacity: 0, y: 75 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: delay }}
            >
                {children}
            </motion.div>
        </div>
    );
};

// --- Simple Icons as SVG ---
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>);
const MapPinIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>);
const StarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
const PhoneIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        }
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'}`}>
            <div className="px-8 md:px-24 flex justify-between items-center">
                <div className="text-2xl font-heading font-black tracking-tighter text-gray-900">
                    BURGER<span className="text-burger-orange">BOY</span>
                </div>
                <div className="hidden md:flex space-x-8 font-medium text-sm tracking-wide">
                    <a href="#about" className="hover:text-burger-orange transition-colors">OUR STORY</a>
                    <a href="#menu" className="hover:text-burger-orange transition-colors">MENU</a>
                    <a href="#locations" className="hover:text-burger-orange transition-colors">LOCATIONS</a>
                </div>
                <div className="md:hidden text-gray-900">
                    <MenuIcon />
                </div>
            </div>
        </nav>
    );
};

const Hero = () => {
    const containerRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const [images, setImages] = useState([]);
    const frameCount = 270;

    // Preload images
    useEffect(() => {
        const loadedImages = [];
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            const imgNumber = i.toString().padStart(3, '0');
            img.src = `heroimages/ezgif-frame-${imgNumber}.png`;
            
            // Draw first frame immediately when it loads
            if (i === 1) {
                img.onload = () => {
                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
                };
            }
            loadedImages.push(img);
        }
        setImages(loadedImages);
    }, []);

    // Track scroll specifically for the Hero container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            if (images.length === 0 || !canvasRef.current) return;
            const frameIndex = Math.min(frameCount - 1, Math.floor(latest * frameCount));
            const img = images[frameIndex];
            
            if (img && img.complete && img.naturalHeight !== 0) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                
                // Clear and Draw the original image
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // --- Background Removal (Chroma Key) ---
                // We identify the off-white background and make it transparent
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const threshold = 230; // Threshold for #EBEBEB (235, 235, 235)
                
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // If all channels are above the threshold, it's our background grey
                    if (r > threshold && g > threshold && b > threshold) {
                        data[i + 3] = 0; // Set alpha to 0
                    }
                }
                ctx.putImageData(imageData, 0, 0);
            }
        });
        return () => unsubscribe();
    }, [scrollYProgress, images]);

    const opacity = useTransform(scrollYProgress, [0.8, 1], [1, 0]);

    return (
        <section ref={containerRef} className="relative h-[400vh] bg-[#EBEBEB]">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col md:flex-row items-center">
                
                {/* Left Side: Text 40% */}
                <div className="w-full md:w-[40%] h-full flex flex-col items-start justify-start pt-24 md:pt-28 px-8 md:px-24 z-10">
                    <motion.div 
                        className="pointer-events-none"
                    >
                        <motion.h1 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-6xl md:text-7xl lg:text-8xl font-black font-heading tracking-tighter leading-none mb-6 text-[#111] uppercase"
                        >
                            The Art of <br/><span className="text-burger-orange">the Bun</span>.
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="text-xl text-gray-800 font-bold tracking-wide max-w-xl drop-shadow-md"
                        >
                            Crafted with passion in the heart of the UAE. No fluff, just flame.
                        </motion.p>
                    </motion.div>
                </div>
                
                {/* Right Side: Image 60% */}
                <div className="w-full md:w-[60%] h-full relative flex items-start justify-center pt-14 md:pt-18 overflow-hidden">
                    {/* Desktop Animated Canvas */}
                    <motion.div style={{ opacity }} className="hidden md:flex w-full h-[85vh] flex items-start justify-center">
                        <canvas 
                            ref={canvasRef} 
                            width={1920} 
                            height={1080} 
                            className="w-full h-full object-contain"
                        />
                    </motion.div>
                    
                    {/* Mobile Static Image (only shown when canvas is hidden) */}
                    <div className="block md:hidden w-full h-[60vh] flex items-center justify-center -mt-10">
                        <motion.img 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" 
                            alt="BurgerBoy Special" 
                            className="w-[85%] h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                        />
                    </div>
                </div>

                {/* Centered Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 hidden md:block"
                >
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="text-burger-orange"
                    >
                        <ChevronDownIcon size={32} strokeWidth={3} />
                    </motion.div>
                </motion.div>

            </div>
        </section>
    );
};

const About = () => {
    return (
        <section id="about" className="py-24 bg-transparent relative">
            <div className="px-8 md:px-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative h-[500px] w-full flex items-center justify-center bg-gray-50 rounded-[2.5rem] overflow-hidden">
                        <Reveal width="100%" delay={0.4}>
                            <img 
                                src="assets/meat_patty_grilling.png" 
                                alt="Meat Patty Grilling" 
                                className="max-h-[450px] w-auto object-contain mix-blend-multiply brightness-[1.02] contrast-[1.05]"
                            />
                        </Reveal>
                    </div>
                    <div className="space-y-8">
                        <Reveal width="100%">
                            <h2 className="text-4xl md:text-6xl font-black font-heading uppercase text-gray-900 leading-tight">
                                Born from <br/><span className="text-burger-orange hover:drop-shadow-[0_0_20px_rgba(255,87,34,0.6)] transition-all duration-300 cursor-default">Fire</span>.
                            </h2>
                        </Reveal>
                        <Reveal width="100%" delay={0.2}>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Born in 2018 from a single charcoal grill and a dream, BurgerBoy was founded on one principle: a burger should be an experience, not just a meal.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed mt-4">
                                We spent years perfecting the ratio of fat to lean in our Wagyu blends to ensure every bite is the best you've ever had. We bring the authentic soul of the grill to the streets of the UAE.
                            </p>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Experience = () => {
    const actionImages = [
        { 
            src: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80", 
            label: "THE WAGYU SUPREME", 
            size: "md:col-span-2 md:row-span-2" 
        },
        { 
            src: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?auto=format&fit=crop&w=800&q=80", 
            label: "THE SMASH", 
            size: "md:col-span-1 md:row-span-1" 
        },
        { 
            src: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80", 
            label: "BACON CRISP", 
            size: "md:col-span-1 md:row-span-1" 
        },
        { 
            src: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=800&q=80", 
            label: "DOUBLE CHEESE", 
            size: "md:col-span-1 md:row-span-2" 
        },
        { 
            src: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80", 
            label: "THE FLAME", 
            size: "md:col-span-1 md:row-span-1" 
        },
        { 
            src: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80", 
            label: "SPICY KICK", 
            size: "md:col-span-1 md:row-span-1" 
        },
    ];

    return (
        <section id="experience" className="py-24 bg-transparent overflow-hidden">
            <div className="px-8 md:px-24">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    {/* Header */}
                    <div className="w-full lg:w-1/3 mb-12 lg:mb-0">
                        <Reveal width="100%">
                            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-burger-orange mb-4 block">Kitchen Culture</span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading uppercase leading-[0.9] text-gray-900 mb-6 md:mb-8">
                                The <br/><span className="text-burger-orange">Grill</span> <br/>Experience
                            </h2>
                            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-6 md:mb-10 lg:w-full">
                                It’s more than just a burger. It’s the sizzle of the wagyu, the toast of the brioche, and the high-energy rush of a kitchen that never stops.
                            </p>
                        </Reveal>
                    </div>

                    {/* Masonry Grid */}
                    <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[250px]">
                        {actionImages.map((item, idx) => (
                            <Reveal key={idx} delay={idx * 0.1} style={{ height: '100%', marginBottom: '1rem' }} className="w-full h-full">
                                <div className={`relative group overflow-hidden rounded-[2.5rem] shadow-2xl h-full ${item.size}`}>
                                    <img 
                                        src={item.src} 
                                        alt={item.label} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-100 transition-all"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-black/20 opacity-80 group-hover:opacity-40 transition-opacity"></div>
                                    <div className="absolute bottom-6 left-6 z-10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-burger-orange mb-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">BurgerBoy Official</p>
                                        <p className="text-lg md:text-xl font-black font-heading text-white uppercase tracking-tighter group-hover:text-burger-orange transition-colors drop-shadow-md">{item.label}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const AppSection = () => {
    return (
        <section className="py-32 bg-transparent relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-burger-orange/10 rounded-full blur-[120px] pointer-events-none"></div>
            
            <div className="px-8 md:px-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 z-10">
                        <Reveal width="100%">
                            <h2 className="text-5xl md:text-7xl font-black font-heading uppercase text-gray-900 leading-tight">
                                Skip the <br/><span className="text-burger-orange">Queue</span>.
                            </h2>
                        </Reveal>
                        <Reveal width="100%" delay={0.2}>
                            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                                Download the BurgerBoy app for exclusive <strong className="text-gray-900">'Secret Menu'</strong> access and lightning-fast delivery across Dubai, Abu Dhabi, and Sharjah.
                            </p>
                        </Reveal>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}
                        >
                            {/* App Store Button */}
                            <a
                                href="https://apps.apple.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    backgroundColor: '#111111', color: '#ffffff',
                                    padding: '14px 24px', borderRadius: '14px',
                                    textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                    transition: 'all 0.2s ease',
                                    minWidth: '180px'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FF5722'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(255,87,34,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                            >
                                <svg viewBox="0 0 384 512" fill="currentColor" style={{ width: '26px', height: '26px', flexShrink: 0 }}>
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-24.3-88.2-23.6-46 1-90.1 27.1-113.8 68.9-48.7 85.8-12.2 214.5 35.7 283.7 23.5 33.9 51.2 71.3 87.7 70 34.8-1.3 47.7-22 90.1-22 42.3 0 54.5 22 91 21s66-33.8 89.3-68.5c27.9-40.6 39.4-80 39.7-82s-76.7-29.4-76.9-74.1zm-48.5-164.7c19.5-24 33-57.4 29.6-90.4-28.3 1.1-62.2 18.9-82.3 42.6-18 20.9-33.8 55.4-29.5 87 31.6 2.5 62.7-15.2 82.2-39.2z"/>
                                </svg>
                                <div>
                                    <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6, margin: 0 }}>Download on the</p>
                                    <p style={{ fontSize: '18px', fontWeight: '900', lineHeight: 1.1, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>App Store</p>
                                </div>
                            </a>

                            {/* Google Play Button */}
                            <a
                                href="https://play.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    backgroundColor: '#111111', color: '#ffffff',
                                    padding: '14px 24px', borderRadius: '14px',
                                    textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                    transition: 'all 0.2s ease',
                                    minWidth: '180px'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FF5722'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(255,87,34,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                            >
                                <svg viewBox="0 0 512 512" fill="currentColor" style={{ width: '26px', height: '26px', flexShrink: 0 }}>
                                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                                </svg>
                                <div>
                                    <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6, margin: 0 }}>Get it on</p>
                                    <p style={{ fontSize: '18px', fontWeight: '900', lineHeight: 1.1, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>Google Play</p>
                                </div>
                            </a>
                        </motion.div>
                    </div>
                    <div className="relative flex justify-center z-10 w-full">
                        <Reveal width="100%" delay={0.3}>
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="relative mx-auto w-[280px] sm:w-[300px] h-[540px] sm:h-[600px] border-[12px] md:border-[14px] border-[#111] rounded-[2.5rem] sm:rounded-[3rem] bg-transparent overflow-hidden flex flex-col justify-between shadow-[0_0_60px_rgba(255,87,34,0.2)] md:shadow-[0_0_80px_rgba(255,87,34,0.3)]"
                            >
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#111] rounded-b-2xl z-20"></div>
                                
                                {/* Header */}
                                <div className="bg-gradient-to-b from-burger-dark to-[#1a1a1a] pt-14 pb-6 px-6 relative z-10 border-b border-gray-200 text-left">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="font-heading font-black text-gray-900 text-xl tracking-tighter">BURGER<span className="text-burger-orange">BOY</span></h3>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-burger-orange/20 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-burger-orange"></div>
                                        </div>
                                    </div>
                                    <div className="h-32 bg-burger-orange/10 border border-burger-orange/30 rounded-2xl flex items-center justify-center flex-col shadow-inner">
                                        <span className="text-burger-orange font-black font-heading text-lg tracking-widest uppercase text-center">Secret Menu</span>
                                        <span className="text-burger-orange/70 text-xs mt-1 font-bold">UNLOCKED</span>
                                    </div>
                                </div>
                                
                                {/* Order Items */}
                                <div className="flex-1 px-6 py-6 space-y-4 bg-[#0a0a0c]">
                                    <div className="h-24 bg-[#161618] rounded-2xl flex items-center px-4 gap-4 border border-gray-200">
                                        <div className="w-16 h-16 bg-transparent rounded-xl border border-gray-700 shadow-inner"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-3 w-2/3 bg-gray-700 rounded-full"></div>
                                            <div className="h-3 w-1/3 bg-gray-800 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="h-24 bg-[#161618] rounded-2xl flex items-center px-4 gap-4 border border-gray-200">
                                        <div className="w-16 h-16 bg-transparent rounded-xl border border-gray-700 shadow-inner"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-3 w-1/2 bg-gray-700 rounded-full"></div>
                                            <div className="h-3 w-1/4 bg-gray-800 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="h-24 bg-[#161618] rounded-2xl flex items-center px-4 gap-4 border border-gray-200">
                                        <div className="w-16 h-16 bg-transparent rounded-xl border border-gray-700 shadow-inner"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-3 w-3/4 bg-gray-700 rounded-full"></div>
                                            <div className="h-3 w-1/2 bg-gray-800 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Bar */}
                                <div className="bg-[#111] h-1.5 w-1/3 mx-auto rounded-full mb-3 mt-1"></div>
                            </motion.div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Menu = () => {
    const burgers = [
        { name: "The Classic", desc: "Our signature blend, American cheese, lettuce, tomato, Boy Sauce.", price: "35 AED", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { name: "Truffle Trouble", desc: "Swiss cheese, mushroom duxelles, truffle aioli.", price: "45 AED", img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { name: "Spicy Zinger", desc: "Crispy fried chicken, jalapeno slaw, fiery mayo.", price: "40 AED", img: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { name: "BBQ Bacon", desc: "Smoked beef bacon, onion rings, cheddar, house BBQ.", price: "48 AED", img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
    ];

    return (
        <section id="menu" className="pt-4 pb-24 bg-transparent">
            <div className="px-8 md:px-24">
                <div className="text-center mb-16">
                    <Reveal delay={0} width="100%">
                        <h2 className="text-4xl md:text-6xl font-black font-heading uppercase text-gray-900">The <span className="text-burger-orange">Lineup</span></h2>
                        <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">BurgerBoy original specials. Crafted fresh daily.</p>
                    </Reveal>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {burgers.map((burger, idx) => (
                        <Reveal key={idx} delay={idx * 0.1}>
                            <div className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(255,87,34,0.18)] hover:-translate-y-3 transition-all duration-300 border border-gray-100 hover:border-burger-orange/30 flex flex-col h-full">
                                {/* Image */}
                                <div className="relative h-52 overflow-hidden bg-gray-100">
                                    <img
                                        src={burger.img}
                                        alt={burger.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    {/* Price badge */}
                                    <div className="absolute top-3 right-3 bg-burger-orange text-white font-black font-heading text-sm px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                                        {burger.price}
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-base font-black font-heading tracking-wide uppercase text-gray-900 mb-2 group-hover:text-burger-orange transition-colors duration-300">
                                        {burger.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed flex-1">{burger.desc}</p>
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">BurgerBoy Special</span>
                                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-burger-orange transition-all duration-300">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-white transition-colors duration-300">
                                                <path d="M5 12h14M12 5l7 7-7 7"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                {/* View More Button */}
                <div className="flex justify-center mt-14">
                    <motion.a
                        href="#"
                        whileHover={{ scale: 1.04, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-3 bg-burger-orange text-white font-black font-heading uppercase tracking-widest text-sm px-10 py-5 rounded-2xl shadow-[0_8px_30px_rgba(255,87,34,0.35)] hover:bg-[#E64A19] transition-colors duration-300"
                    >
                        View Full Menu
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </motion.a>
                </div>
            </div>
        </section>
    );
};


const Bestsellers = () => {
    const bestsellers = [
        { name: "The Crown Jewel", desc: "Double-aged Wagyu, truffle aioli, and caramelized onions on a gold-dusted brioche.", price: "65 AED", tag: "Chef's Pick" },
        { name: "The Midnight Melt", desc: "For the late-night cravings. Triple cheddar, smoked bacon, and our signature 'Boy Sauce'.", price: "52 AED", tag: "Fan Favourite" },
        { name: "The Desert Fire", desc: "Locally sourced green chilies, spicy pepper jack, and a kick of habanero mayo.", price: "55 AED", tag: "Spicy" }
    ];

    return (
        <section className="py-24 bg-[#111111] overflow-hidden relative">
            {/* Decorative orange blur */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-burger-orange/10 blur-[120px] pointer-events-none" />

            <div className="px-8 md:px-24">
                {/* Header */}
                <Reveal width="100%">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <h2 className="text-4xl md:text-6xl font-black font-heading uppercase text-white leading-tight">
                            Top 3 <span className="text-burger-orange">Bestsellers</span>
                        </h2>
                        <p className="text-gray-500 max-w-xs text-sm leading-relaxed">Our most-loved burgers, voted by the BurgerBoy community.</p>
                    </div>
                </Reveal>

                {/* Items */}
                <div className="flex flex-col divide-y divide-white/10">
                    {bestsellers.map((item, idx) => (
                        <Reveal key={idx} width="100%" delay={idx * 0.15}>
                            <motion.div
                                whileHover={{ x: 8 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12 py-10 group cursor-default"
                            >
                                {/* Rank Number */}
                                <span className="text-[80px] md:text-[100px] font-black font-heading leading-none text-white/10 group-hover:text-burger-orange/30 transition-colors duration-300 select-none w-28 flex-shrink-0 text-center">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>

                                {/* Stars + Tag */}
                                <div className="flex flex-col gap-3 w-36 flex-shrink-0">
                                    <div className="flex gap-0.5 text-burger-orange">
                                        <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-burger-orange/70 border border-burger-orange/30 px-3 py-1 rounded-full w-fit">
                                        {item.tag}
                                    </span>
                                </div>

                                {/* Name + Desc */}
                                <div className="flex-1 w-full order-3 md:order-none mt-2 md:mt-0">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mb-2">
                                        <h3 className="text-2xl md:text-3xl font-black font-heading uppercase text-white group-hover:text-burger-orange transition-colors duration-300">
                                            {item.name}
                                        </h3>
                                        <span className="text-2xl md:text-3xl font-black font-heading text-burger-orange md:text-right">
                                            {item.price}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 leading-relaxed max-w-lg">{item.desc}</p>
                                </div>
                            </motion.div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};


const Locations = () => {
    const locations = [
        { city: "Dubai", desc: "Jumeirah Beach Road", hours: "11 AM – 3 AM", maps: "https://maps.google.com" },
        { city: "Dubai Mall", desc: "Level 2, The Dubai Mall", hours: "10 AM – 12 AM", maps: "https://maps.google.com" },
        { city: "Abu Dhabi", desc: "Yas Island", hours: "12 PM – 2 AM", maps: "https://maps.google.com" },
        { city: "Sharjah", desc: "Al Majaz Waterfront", hours: "12 PM – 1 AM", maps: "https://maps.google.com" },
    ];

    return (
        <section id="locations" className="py-16 bg-transparent relative overflow-hidden">
            <div className="px-8 md:px-24">
                {/* Header */}
                <div className="text-center mb-16">
                    <Reveal delay={0} width="100%">
                        <div className="flex flex-col items-center">
                            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-burger-orange mb-4 block">Our Locations</span>
                            <h2 className="text-5xl md:text-7xl font-black font-heading uppercase text-gray-900">Find <span className="text-burger-orange">Us</span></h2>
                        </div>
                    </Reveal>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                    {locations.map((loc, idx) => (
                        <Reveal key={idx} delay={idx * 0.1}>
                            <motion.a
                                href={loc.maps}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ y: -6 }}
                                transition={{ duration: 0.25 }}
                                className="block bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_4px_25px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(255,87,34,0.15)] hover:border-burger-orange/30 transition-all duration-300 group text-center no-underline"
                            >
                                {/* Drop Pin Icon */}
                                <div className="flex justify-center mb-4">
                                    <div className="relative w-12 h-14 flex items-start justify-center">
                                        {/* Pin head */}
                                        <div className="w-12 h-12 rounded-full bg-gray-900 group-hover:bg-burger-orange transition-colors duration-300 flex items-center justify-center shadow-lg">
                                            <div className="w-4 h-4 rounded-full bg-white opacity-90" />
                                        </div>
                                        {/* Pin tail */}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0"
                                            style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '10px solid #111', transition: 'border-top-color 0.3s' }}
                                        />
                                    </div>
                                </div>

                                <h3 className="text-xl font-black font-heading text-gray-900 uppercase tracking-wide mb-1 group-hover:text-burger-orange transition-colors duration-300">
                                    {loc.city}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">{loc.desc}</p>

                                <div className="inline-flex items-center gap-2 bg-gray-900 group-hover:bg-burger-orange text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-colors duration-300">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    {loc.hours}
                                </div>
                            </motion.a>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};


const Testimonials = () => {
    const images = [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=600&q=80",
    ];
    
    const marqueeImages = [...images, ...images, ...images]; 

    return (
        <section className="py-24 bg-transparent border-none shadow-none overflow-hidden flex flex-col items-center border-t border-b border-gray-200">
            <Reveal width="100%">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black font-heading uppercase text-gray-900 mb-4">
                        Gram <span className="text-burger-orange">Worthy</span>
                    </h2>
                    <p className="text-gray-600">Tag @BurgerBoyUAE to be featured</p>
                </div>
            </Reveal>
            <div className="w-full flex overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap gap-6 px-3">
                    {marqueeImages.map((src, idx) => (
                        <div key={idx} className="relative w-72 h-72 flex-shrink-0 rounded-3xl overflow-hidden group shadow-xl">
                            <img src={src} alt="Instagram Post" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-transparent/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                <p className="text-burger-orange font-black font-heading text-xl uppercase tracking-wider drop-shadow-lg">@burgerfan_{idx}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Contact = () => {
    return (
        <section className="py-20 bg-transparent relative">
            <div className="absolute right-0 top-0 w-1/3 h-full bg-burger-orange/5 blur-[150px] pointer-events-none"></div>
            <div className="px-8 md:px-24 relative z-10">
                {/* Header */}
                <Reveal width="100%">
                    <div className="mb-10">
                        <h2 className="text-4xl md:text-6xl font-black font-heading uppercase text-gray-900 mb-3">
                            Craving <span className="text-burger-orange">More?</span>
                        </h2>
                        <p className="text-gray-500 text-lg">Drop us a line for catering, events, or if you just want to talk about burgers.</p>
                    </div>
                </Reveal>

                {/* Two Column */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">

                    {/* Left: Form */}
                    <Reveal width="100%" delay={0.1} style={{ height: '100%' }}>
                        <form className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.07)] text-left h-full flex flex-col" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Name</label>
                                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-gray-900 focus:outline-none focus:border-burger-orange focus:bg-white transition-all duration-300 placeholder:text-gray-300" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
                                    <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-gray-900 focus:outline-none focus:border-burger-orange focus:bg-white transition-all duration-300 placeholder:text-gray-300" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                                    <input type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-gray-900 focus:outline-none focus:border-burger-orange focus:bg-white transition-all duration-300 placeholder:text-gray-300" placeholder="+971 50 000 0000" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Location</label>
                                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-gray-900 focus:outline-none focus:border-burger-orange focus:bg-white transition-all duration-300 placeholder:text-gray-300" placeholder="Dubai, UAE" />
                                </div>
                            </div>
                            <div className="mb-6 flex-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Message</label>
                                <textarea className="w-full h-full min-h-[100px] bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-gray-900 focus:outline-none focus:border-burger-orange focus:bg-white transition-all duration-300 resize-none placeholder:text-gray-300" placeholder="Tell us about it..."></textarea>
                            </div>
                            <motion.button
                                style={{ marginTop: 'auto' }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full bg-burger-orange text-white font-black font-heading text-lg py-5 rounded-xl shadow-[0_8px_24px_rgba(255,87,34,0.3)] hover:bg-[#E64A19] transition-colors uppercase tracking-widest"
                            >
                                Send Message →
                            </motion.button>
                        </form>
                    </Reveal>

                    {/* Right: Contact Info Panel */}
                    <Reveal width="100%" delay={0.2} style={{ height: '100%' }}>
                        <div className="bg-[#111111] rounded-3xl p-8 md:p-10 text-white h-full flex flex-col justify-between gap-8">
                            {/* Brand */}
                            <div>
                                <h3 className="text-2xl font-black font-heading tracking-tighter mb-1">
                                    BURGER<span className="text-burger-orange">BOY</span>
                                </h3>
                                <p className="text-gray-500 text-sm">Crafted with passion in the UAE.</p>
                            </div>

                            {/* Info Items */}
                            <div className="flex flex-col gap-6">
                                {/* Address */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-burger-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <MapPinIcon />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-burger-orange mb-1">Address</p>
                                        <p className="text-gray-300 text-sm leading-relaxed">Jumeirah Beach Road, Dubai<br/>United Arab Emirates</p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-burger-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <PhoneIcon />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-burger-orange mb-1">Phone</p>
                                        <a href="tel:+97141234567" className="text-gray-300 text-sm hover:text-burger-orange transition-colors">+971 4 123 4567</a>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-burger-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-burger-orange mb-1">Email</p>
                                        <a href="mailto:hello@burgerboy.ae" className="text-gray-300 text-sm hover:text-burger-orange transition-colors">hello@burgerboy.ae</a>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-white/10 pt-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4">Follow Us</p>
                                <div className="flex gap-3">
                                    {/* Instagram */}
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-burger-orange flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                    </a>
                                    {/* TikTok */}
                                    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-burger-orange flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.22 8.22 0 0 0 4.81 1.54V6.78a4.85 4.85 0 0 1-1.04-.09z"/></svg>
                                    </a>
                                    {/* Twitter/X */}
                                    <a href="https://x.com" target="_blank" rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-burger-orange flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/></svg>
                                    </a>
                                    {/* Snapchat */}
                                    <a href="https://snapchat.com" target="_blank" rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-burger-orange flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.029.51.027.018.056.09.994.09.148 0 .3-.009.464-.023h.018c.978 0 1.52.511 1.53 1.348.017 1.268-1.003 1.486-1.578 1.658-.077.023-.156.045-.235.07-.595.203-1.062.694-1.244 1.357-.083.303-.01.497.018.575.79 1.454 2.212 2.972 3.498 4.205.224.21.48.378.767.502.18.076.365.15.55.216.45.165.675.405.693.75.018.36-.21.648-.72.875-.327.146-.654.219-.979.219-.315 0-.615-.07-.91-.211-.296-.143-.655-.347-1.024-.539-.428-.225-.884-.459-1.378-.587-.49-.13-1.013-.195-1.598-.195-.37 0-.748.032-1.123.101-.375.069-.714.204-1.012.404-.27.182-.597.387-.901.553-.392.213-.781.32-1.156.32-.415 0-.835-.13-1.205-.402-.41-.302-.786-.629-1.128-.96-.35-.34-.742-.628-1.162-.852-.422-.225-.918-.348-1.485-.348-.614 0-1.184.074-1.74.217-.552.143-1.103.366-1.641.668-.372.21-.744.387-1.113.532-.37.145-.724.218-1.059.218-.367 0-.741-.078-1.11-.234-.497-.214-.792-.524-.799-.908.006-.336.196-.566.576-.715.196-.072.383-.148.565-.226.293-.122.57-.287.819-.501 1.275-1.23 2.682-2.736 3.46-4.174.038-.078.118-.28.033-.59-.163-.61-.538-1.056-1.083-1.257l-.006-.003-.006-.001c-.18-.05-.356-.097-.518-.145-.595-.172-1.606-.463-1.586-1.758.01-.834.541-1.346 1.52-1.346h.02c.17.014.328.023.48.023.938 0 .97-.072.994-.087l-.002-.063c-.103-1.628-.23-3.654.295-4.847C7.777 1.07 11.15.793 12.206.793z"/></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
};


const Footer = () => {
    return (
        <footer className="bg-transparent py-10 border-t border-gray-100 mt-10">
            <div className="px-8 md:px-24 text-center">
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">&copy; 2026 BurgerBoy UAE. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default function App() {
    return (
        <div className="min-h-screen bg-transparent text-gray-900 font-body selection:bg-burger-orange selection:text-gray-900">
            <Navbar />
            <Hero />
            <About />
            <Experience />
            <AppSection />
            <Menu />
            <Bestsellers />
            <Locations />
            <Testimonials />
            <Contact />
            <Footer />
        </div>
    );
}
