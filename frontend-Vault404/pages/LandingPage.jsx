import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Zap, Smartphone, Fingerprint, ChevronRight } from 'lucide-react';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const LandingPage = () => {
  return (
    <div className="min-h-screen text-textPrimary overflow-x-hidden pt-4 relative bg-bgPrimary transition-colors duration-700">
      {/* Dynamic Mesh Background (Theme Aware) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-60">
        <motion.div 
          animate={{ 
            x: [0, 150, -50, 0], 
            y: [0, -100, 100, 0],
            scale: [1, 1.4, 0.8, 1] 
          }} 
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-accentPrimary/20 dark:bg-accentPrimary/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -150, 100, 0], 
            y: [0, 150, -50, 0],
            scale: [1, 0.9, 1.3, 1] 
          }} 
          transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-accentSecondary/20 dark:bg-accentSecondary/5 rounded-full blur-[120px]" 
        />
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
        
        {/* Linear gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-bgPrimary via-transparent to-bgPrimary" />
      </div>

      {/* ── Section 1: Hero ─────────────────────────────────── */}
      <section className="min-h-screen flex items-center relative z-10 pt-20 lg:pt-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        <motion.div
          className="flex-1 space-y-6 text-center lg:text-left"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accentSecondary/20 bg-accentSecondary/5 text-[10px] tracking-[0.2em] text-accentSecondary uppercase font-black"
          >
            <div className="w-1 h-1 rounded-full bg-accentSecondary animate-pulse" />
            <span>Military Grade Encryption v4.0.4</span>
          </motion.div>

          <motion.h1 
            variants={fadeUp}
            className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]"
          >
            SECURE<br/>YOUR DIGITAL<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentPrimary via-accentSecondary to-accentPrimary bg-[length:200%_auto] animate-[gradient_4s_linear_infinite]">
              OBSIDIAN.
            </span>
          </motion.h1>

          <motion.p 
            variants={fadeUp}
            className="text-base text-textSecondary max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            The most secure, fast, and encrypted password manager for the digital elite. 
            Experience the peak of <span className="text-textPrimary font-bold italic">zero-knowledge</span> architecture.
          </motion.p>

          <motion.div 
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2"
          >
            <Link to="/signup" className="group relative px-8 py-3.5 rounded-full bg-bgPrimary text-white font-black uppercase tracking-widest hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all transform hover:-translate-y-1 w-full sm:w-auto overflow-hidden border border-white/5 active:scale-95">
              {/* Rotating Border Layer */}
              <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#06b6d4_0%,#7c3aed_50%,#06b6d4_100%)] opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute inset-[1px] rounded-full bg-bgPrimary z-0 transition-colors group-hover:bg-bgPrimary/90" />

              <span className="relative z-10 flex items-center gap-2 text-sm text-accentSecondary group-hover:text-white transition-colors duration-300">
                Get Started <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link to="/login" className="px-8 py-3.5 rounded-full border border-border bg-bgSecondary/20 backdrop-blur-md font-black uppercase tracking-widest hover:border-textSecondary transition-all w-full sm:w-auto text-center hover:bg-bgSecondary/40 text-sm">
              Access Vault
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="flex-1 w-full max-w-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Faux Vault App Preview - Scaled Down */}
          <div className="bg-bgSecondary/80 backdrop-blur-xl border border-border rounded-[32px] p-6 shadow-2xl relative overflow-hidden group hover:border-accentSecondary/20 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center border border-success/20">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-[9px] font-black tracking-[0.3em] text-textSecondary uppercase">SYSTEM: SECURE</p>
                <p className="text-sm font-bold text-textPrimary uppercase tracking-tight">VAULT: LOCKED_</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              {[
                { name: 'Netflix', slug: 'netflix', color: 'E50914' },
                { name: 'Instagram', slug: 'instagram', color: 'E4405F' }
              ].map((item, i) => (
                <div key={i} className="h-14 rounded-[18px] bg-bgPrimary/50 border border-border flex items-center px-4 group/item hover:bg-bgSecondary transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-bgSecondary border border-border flex items-center justify-center p-1.5 group-hover/item:rotate-12 transition-transform">
                    <img
                      src={`https://cdn.simpleicons.org/${item.slug}/${item.color}`}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="ml-4 text-textPrimary font-bold text-sm flex-1 tracking-tight">{item.name}</span>
                  <div className="flex flex-col gap-0.5 opacity-20 group-hover/item:opacity-100 transition-opacity">
                    <div className="w-1 h-1 rounded-full bg-textPrimary" />
                    <div className="w-1 h-1 rounded-full bg-textPrimary" />
                    <div className="w-1 h-1 rounded-full bg-textPrimary" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <div className="w-full h-12 rounded-xl border border-success/30 bg-success/5 hover:bg-success/10 transition-all flex items-center justify-center text-[10px] font-black tracking-[0.3em] text-success uppercase cursor-pointer">
                + ADD YOUR CREADENTIALS
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </section>

      {/* ── Section 2: Features ─────────────────────────────── */}
      <section className="min-h-screen flex items-center justify-center bg-bgSecondary/30 backdrop-blur-md py-24 border-t border-border relative z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-accentPrimary/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-black uppercase tracking-tighter"
            >
              Engineered for <span className="text-accentSecondary">TOTAL_SILENCE.</span>
            </motion.h2>
            <p className="text-textSecondary tracking-[0.2em] uppercase text-[10px]">No compromised nodes. No backdoors. Just pure privacy.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'ZERO-KNOWLEDGE', desc: 'Your master password never leaves your hardware.' },
              { icon: Zap, title: 'QUANTUM_SYNC', desc: 'Instant retrieval across all your endpoints.' },
              { icon: Smartphone, title: 'HYPER_CLOUD', desc: 'Encrypted sync for every authorized device.' },
              { icon: Fingerprint, title: 'BIOMETRIC_GATE', desc: 'Unlock with a touch. Seamlessly integrated.' },
            ].map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-2xl border border-border hover:border-accentPrimary transition-all group relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-accentSecondary/10 flex items-center justify-center mb-6 group-hover:bg-accentPrimary/20 transition-all border border-accentSecondary/20">
                  <f.icon className="w-5 h-5 text-accentSecondary group-hover:text-accentPrimary transition-colors" />
                </div>
                <h3 className="text-lg font-black mb-3 uppercase tracking-tight">{f.title}</h3>
                <p className="text-textSecondary leading-relaxed text-xs">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
