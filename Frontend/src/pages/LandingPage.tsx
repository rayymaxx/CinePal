import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Film, 
  Sparkles, 
  MessageCircle, 
  Zap, 
  Star, 
  Heart, 
  ArrowRight,
  Play,
  Users,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const LandingPage: React.FC = () => {
  const { currentTheme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const features = [
    {
      icon: <Sparkles size={32} />,
      title: 'AI-Powered Recommendations',
      description: 'Get personalized movie suggestions using advanced AI that understands your taste',
    },
    {
      icon: <MessageCircle size={32} />,
      title: 'Chat with Your Assistant',
      description: 'Have natural conversations about movies and get instant recommendations',
    },
    {
      icon: <Heart size={32} />,
      title: 'Personalized Watchlist',
      description: 'Save your favorite movies and shows for later viewing',
    },
    {
      icon: <Zap size={32} />,
      title: 'Lightning Fast',
      description: 'Instant recommendations and real-time chat responses',
    },
  ];

  const stats = [
    { label: 'Movies', value: '10K+', icon: <Film size={24} /> },
    { label: 'Happy Users', value: '1K+', icon: <Users size={24} /> },
    { label: 'Recommendations', value: '100K+', icon: <TrendingUp size={24} /> },
  ];

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: currentTheme?.background }}>
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ backgroundColor: currentTheme?.primary }}
              >
                🎬
              </div>
              <span className="text-xl font-bold" style={{ color: currentTheme?.text }}>
                CinePal
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="transition-colors"
                style={{ color: currentTheme?.text }}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="transition-colors"
                style={{ color: currentTheme?.text }}
              >
                How It Works
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg transition-all duration-300 hover:opacity-80"
                style={{ color: currentTheme?.text }}
              >
                Login
              </Link>
              <Link
                to="/login"
                className="px-6 py-2 rounded-lg font-medium text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
                style={{ backgroundColor: currentTheme?.primary }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left Content */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ backgroundColor: `${currentTheme?.primary}20` }}
                >
                  <Sparkles size={16} style={{ color: currentTheme?.primary }} />
                  <span style={{ color: currentTheme?.primary }} className="text-sm font-medium">
                    AI-Powered Movie Magic
                  </span>
                </motion.div>

                <h1
                  className="text-5xl md:text-6xl font-bold leading-tight"
                  style={{ color: currentTheme?.text }}
                >
                  Your AI Movie
                  <span style={{ color: currentTheme?.primary }}> Companion</span>
                </h1>

                <p
                  className="text-lg md:text-xl opacity-70 max-w-2xl"
                  style={{ color: currentTheme?.text }}
                >
                  Discover movies and shows tailored just for you. Chat with an intelligent AI assistant that truly understands your taste in cinema.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                  style={{ backgroundColor: currentTheme?.primary }}
                >
                  Start Discovering
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 transition-all duration-300 hover:scale-105"
                  style={{
                    borderColor: currentTheme?.primary,
                    color: currentTheme?.primary,
                  }}
                >
                  <Play size={20} />
                  Join The CinePal Family
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${currentTheme?.primary}20` }}
                    >
                      <div style={{ color: currentTheme?.primary }}>
                        {stat.icon}
                      </div>
                    </div>
                    <div>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: currentTheme?.text }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="text-sm opacity-60"
                        style={{ color: currentTheme?.text }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              variants={itemVariants}
              className="relative h-96 md:h-full flex items-center justify-center"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative w-full"
              >
                {/* The Matrix Card - Left */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: -8 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="absolute top-0 left-0 w-48 h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/20"
                >
                  <img
                    src="https://image.tmdb.org/t/p/original/p96dm7sCMn4VYAStA6siNz30G1r.jpg"
                    alt="The Matrix"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.backgroundColor = `${currentTheme?.primary}40`;
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-sm font-medium text-white">
                      The Matrix
                    </p>
                    <p className="text-xs opacity-70 text-white">
                      Action • Sci-Fi
                    </p>
                  </div>
                </motion.div>

                {/* Inception Card - Right */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 8 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute bottom-0 right-0 w-48 h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/20"
                >
                  <img
                    src="https://image.tmdb.org/t/p/original/gqgwNjwjSqGkOqkE2rppogenu4v.jpg"
                    alt="Inception"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.backgroundColor = `${currentTheme?.secondary}40`;
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-sm font-medium text-white">
                      Inception
                    </p>
                    <p className="text-xs opacity-70 text-white">
                      Sci-Fi • Thriller
                    </p>
                  </div>
                </motion.div>

                {/* Interstellar Card - Center */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/20 z-10"
                >
                  <img
                    src="https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
                    alt="Interstellar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.backgroundColor = `${currentTheme?.accent}40`;
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Star size={16} fill="currentColor" className="text-yellow-400" />
                      <span className="text-sm font-medium text-white">
                        8.6
                      </span>
                    </div>
                    <p className="text-base font-bold text-white">
                      Interstellar
                    </p>
                    <p className="text-xs opacity-80 text-white">
                      Drama • Sci-Fi
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: `${currentTheme?.primary}05` }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-16"
          >
            <div className="text-center space-y-4">
              <motion.h2
                variants={itemVariants}
                className="text-4xl md:text-5xl font-bold"
                style={{ color: currentTheme?.text }}
              >
                Why Choose CinePal?
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-lg opacity-70 max-w-2xl mx-auto"
                style={{ color: currentTheme?.text }}
              >
                Experience the future of movie discovery with AI-powered recommendations
              </motion.p>
            </div>

            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="glass rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${currentTheme?.primary}20` }}
                  >
                    <div style={{ color: currentTheme?.primary }}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: currentTheme?.text }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="opacity-70"
                    style={{ color: currentTheme?.text }}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-16"
          >
            <div className="text-center space-y-4">
              <motion.h2
                variants={itemVariants}
                className="text-4xl md:text-5xl font-bold"
                style={{ color: currentTheme?.text }}
              >
                How It Works
              </motion.h2>
            </div>

            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  step: '01',
                  title: 'Create Account',
                  description: 'Sign up in seconds and tell us what you like',
                },
                {
                  step: '02',
                  title: 'Chat with AI',
                  description: 'Have a natural conversation about your movie taste',
                },
                {
                  step: '03',
                  title: 'Discover Movies',
                  description: 'Get personalized recommendations tailored to you',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative"
                >
                  <div
                    className="text-6xl font-bold opacity-10 mb-4"
                    style={{ color: currentTheme?.primary }}
                  >
                    {item.step}
                  </div>
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{ color: currentTheme?.text }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="opacity-70"
                    style={{ color: currentTheme?.text }}
                  >
                    {item.description}
                  </p>

                  {index < 2 && (
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="hidden md:block absolute -right-12 top-1/2 transform -translate-y-1/2"
                    >
                      <ArrowRight
                        size={32}
                        style={{ color: currentTheme?.primary }}
                        opacity={0.5}
                      />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass rounded-3xl p-12 md:p-16 border border-white/10 text-center space-y-8"
          >
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: currentTheme?.text }}
            >
              Ready to Discover Your Next Favorite Movie?
            </h2>

            <p
              className="text-lg opacity-70 max-w-2xl mx-auto"
              style={{ color: currentTheme?.text }}
            >
              Join thousands of movie lovers using CinePal to find their perfect films
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 hover:shadow-2xl"
                style={{ backgroundColor: currentTheme?.primary }}
              >
                Get Started for Free
                <Sparkles size={24} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: `${currentTheme?.primary}05` }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p
            className="opacity-60"
            style={{ color: currentTheme?.text }}
          >
            © 2025 CinePal. Discover movies, connect with AI, find your next obsession.
          </p>
        </div>
      </footer>
    </div>
  );
};
