import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Code,
  BarChart3,
  Lightbulb,
  Network,
  Code2,
  Brain, 
  Database, 
  Globe, 
  Github, 
  Linkedin, 
  Mail, 
  Download,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Users,
  Star,
  GitFork,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
  LogIn,
  Settings
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

export function IntroPage() {
  const { isDark, toggle } = useTheme();
  const { isAuthenticated } = useAuth();

const skills = [
    { name: 'Machine Learning', icon: Brain, color: 'from-purple-500 to-pink-500', level: 90 },
    { name: 'Deep Learning', icon: Network, color: 'from-blue-500 to-cyan-500', level: 90 },
    { name: 'Data Science', icon: BarChart3, color: 'from-green-500 to-teal-500', level: 80 },
    { name: 'AI Research', icon: Sparkles, color: 'from-orange-500 to-red-500', level: 80 },
    { name: 'Python Language', icon: Code2, color: 'from-yellow-500 to-amber-500', level: 95 }
];

  const featuredProjects = [
    {
      id: 1,
      title: 'End-to-End Deep Learning Project Using ANN',
      description: 'Developed a customer churn prediction web app utilizing Artificial Neural Networks (ANN) and Streamlit. The application predicts customer churn based on various factors, aiding businesses in decision-making.',
      technologies: ['Python', 'TensorFlow', 'Keras', 'Streamlit', 'Scikit-Learn'],
      image: 'https://img.freepik.com/premium-photo/abstract-representation-brain-neurons-with-colorful-glowing-synapses-connecting_1150043-4914.jpg',
      github: 'https://github.com/udityamerit/End-to-End-Deep-Learning-Project-Using-ANN',
      status: 'completed',
      highlights: ['Customer churn prediction', 'Interactive Streamlit interface', 'Neural network optimization']
    },
    {
      id: 2,
      title: 'Machine Learning for Beginners',
      description: 'A comprehensive repository designed to provide a structured, beginner-friendly learning path into the world of Machine Learning. It covers key concepts, popular libraries, and hands-on projects.',
      technologies: ['Python', 'NumPy', 'Pandas', 'Matplotlib', 'Scikit-Learn'],
      image: 'https://media.licdn.com/dms/image/v2/D5612AQH3d0qbHAAESA/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1708025756567?e=2147483647&v=beta&t=cuMvdJ7iHFktjPB1Y5X-ibYhWf1UUAATzh3Kt8p7V6g',
      github: 'https://github.com/udityamerit/Complete-Machine-Learning-For-Beginners',
      status: 'ongoing',
      highlights: ['Beginner-friendly tutorials', 'Hands-on projects', 'Popular ML libraries']
    },
    {
      id: 3,
      title: 'Deep Learning for Beginners',
      description: 'A beginner-friendly repository that introduces the fundamentals of deep learning, including neural networks, forward and backward propagation, and training models using TensorFlow and Keras. The project provides simple code examples and explanations to help new learners understand key concepts.',
      technologies: ['Python', 'TensorFlow', 'Keras', 'NumPy', 'Matplotlib'],
      image: 'https://www.editions-eni.fr/video/comprendre-les-reseaux-de-neurones-artificiels-concepts-et-exemples-vtresne_XL.jpg',
      github: 'https://github.com/udityamerit/Deep-Learning-for-Beginner',
      status: 'ongoing',
      highlights: ['Neural network fundamentals', 'Forward/backward propagation', 'TensorFlow & Keras tutorials']
    },
    {
      id: 4,
      title: 'MultiModel Package for Machine Learning',
      description: 'This repository is a complete guide to Python essentials for Machine Learning. It covers fundamental concepts like data types, control structures, functions, and libraries such as NumPy, Pandas, and Matplotlib, serving as a solid foundation before diving into ML algorithms.',
      technologies: ['Python', 'NumPy', 'Pandas', 'Matplotlib'],
      image: 'https://static.vecteezy.com/system/resources/previews/004/243/615/non_2x/creative-coming-soon-teaser-background-free-vector.jpg',
      github: 'https://github.com/udityamerit/MultiModel-Package-for-Machine-Learning',
      status: 'coming-soon',
      highlights: ['Python fundamentals', 'ML library essentials', 'Comprehensive guide']
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'ongoing':
        return <Clock className="w-5 h-5 text-white" />;
      case 'coming-soon':
        return <AlertCircle className="w-5 h-5 text-white" />;
      default:
        return <Clock className="w-5 h-5 text-white" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'ongoing':
        return 'In Progress';
      case 'coming-soon':
        return 'Coming Soon';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'ongoing':
        return 'bg-blue-600';
      case 'coming-soon':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  };

  const githubStats = {
    repositories: '40+',
    contributions: '1.1k+',
    languages: ['Python', 'Java', 'C++', 'C', 'Jupyter Notebook']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-dynamic-sm">UT</span>
              </div>
              <span className="text-dynamic-lg font-bold text-gray-900 dark:text-white hidden md:block">
                Uditya's Technical Knowledge Base
              </span>
              <span className="text-dynamic-base font-bold text-gray-900 dark:text-white md:hidden">
                Tech KB
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggle}
                className="btn-responsive !p-2 !min-h-auto rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? '🌞' : '🌙'}
              </button>
              
              {/* Admin Access */}
              {isAuthenticated ? (
                <Link
                  to="/admin"
                  className="btn-responsive bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200 hover:scale-105 gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden lg:inline">Admin Panel</span>
                  <span className="lg:hidden">Admin</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn-responsive bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 hover:scale-105 gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden lg:inline">Admin Login</span>
                  <span className="lg:hidden">Login</span>
                </Link>
              )}
              
              <Link
                to="/notes"
                className="btn-responsive bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden lg:inline">View Notes</span>
                <span className="lg:hidden">Notes</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-20 px-dynamic">
        <div className="container-responsive">
          <div className="text-center space-y-8 animate-fade-in-up">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 lg:w-64 lg:h-64 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>
              </div>
              
              {/* Profile Image */}
              <div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 p-2 animate-bounce-slow shadow-2xl">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden animate-scale-in">
                  <img 
                    src="https://raw.githubusercontent.com/udityamerit/Udityamerit/main/uditya.png" 
                    alt="Uditya Narayan Tiwari" 
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 items-center justify-center hidden">
                    <span className="text-6xl lg:text-8xl font-bold bg-gradient-to-br from-blue-500 to-teal-500 bg-clip-text text-transparent">
                      UT
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 animate-slide-in-left">
              <h1 className="text-dynamic-4xl font-bold text-gray-900 dark:text-white leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent animate-gradient">
                  Uditya Narayan Tiwari
                </span>
              </h1>
              <p className="text-dynamic-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
                I'm a Computer Science Engineering student at VIT Bhopal with a focus on Artificial Intelligence and Machine Learning. My passion lies in developing innovative AI solutions and exploring the frontiers of machine learning applications.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-8 animate-slide-in-right">
              <a
                href="https://github.com/udityamerit"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-responsive bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg gap-2"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/uditya-narayan-tiwari-562332289/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-responsive bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg gap-2"
              >
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </a>
              <a
                href="https://udityanarayantiwari.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-responsive bg-teal-600 hover:bg-teal-700 text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg gap-2"
              >
                <Globe className="w-5 h-5" />
                <span>Portfolio</span>
              </a>
              <a
                href="mailto:tiwarimerit@gmail.com"
                className="btn-responsive bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg gap-2"
              >
                <Mail className="w-5 h-5" />
                <span>Contact</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* GitHub Stats Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white/30 dark:bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Github className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900 dark:text-white" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                GitHub Activity
              </h2>
            </div>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Open source contributions and project development
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {githubStats.repositories}
              </div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Repositories</div>
            </div>
            
            <div className="text-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {githubStats.contributions}
              </div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Contributions</div>
            </div>
            
            <div className="text-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-2">
                {githubStats.languages.slice(0, 2).map((lang) => (
                  <span key={lang} className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                    {lang}
                  </span>
                ))}
              </div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Top Languages</div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Technical Expertise
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Specialized in cutting-edge technologies and methodologies
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
            {skills.map((skill, index) => (
              <div
                key={skill.name}
                className="group relative p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${skill.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <skill.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {skill.name}
                </h3>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 bg-gradient-to-r ${skill.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-right">
                  {skill.level}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured GitHub Projects
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Innovative solutions combining AI, web development, and data science from my GitHub portfolio
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {featuredProjects.map((project, index) => (
              <div
                key={project.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up border border-gray-200 dark:border-gray-700 overflow-hidden"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Project Image */}
                <div className="relative h-32 sm:h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Status Tag */}
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className={`inline-flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-bold rounded-full backdrop-blur-sm ${getStatusColor(project.status)} text-white shadow-lg`}>
                      {getStatusIcon(project.status)}
                      <span>{getStatusText(project.status)}</span>
                    </span>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                      <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {project.title}
                      </h3>
                    </div>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors hover:scale-110"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-xs sm:text-sm line-clamp-3">
                    {project.description}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Key Features:</h4>
                      <ul className="space-y-1">
                        {project.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        <span>View on GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 sm:mt-12">
            <a
              href="https://github.com/udityamerit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all duration-200 hover:scale-105 text-sm sm:text-base"
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>View All Projects on GitHub</span>
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Knowledge Base CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full blur-3xl opacity-10 animate-pulse"></div>
            </div>
            <div className="relative space-y-6 sm:space-y-8">
              <div className="flex justify-center">
                <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl">
                  <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  Free Technical Knowledge Base
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Explore my comprehensive collection of AI, ML, and computer science notes. 
                  All content is freely available with no registration required.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                <div className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1 sm:py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs sm:text-base">
                  <Download className="w-4 h-4" />
                  <span>Free Downloads</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs sm:text-base">
                  <Users className="w-4 h-4" />
                  <span>Open Access</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1 sm:py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs sm:text-base">
                  <Zap className="w-4 h-4" />
                  <span>No Registration</span>
                </div>
              </div>

              <Link
                to="/notes"
                className="inline-flex items-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <span>Explore Knowledge Base</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center space-x-4 sm:space-x-6 mb-6 sm:mb-8">
            <a
              href="https://github.com/udityamerit"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700 rounded-full transition-all duration-200 hover:scale-110"
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            </a>
            <a
              href="https://www.linkedin.com/in/uditya-narayan-tiwari-562332289/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-all duration-200 hover:scale-110"
            >
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            </a>
            <a
              href="https://udityanarayantiwari.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-800 hover:bg-teal-100 dark:hover:bg-teal-900 rounded-full transition-all duration-200 hover:scale-110"
            >
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            </a>
            <a
              href="mailto:tiwarimerit@gmail.com"
              className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900 rounded-full transition-all duration-200 hover:scale-110"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            </a>
          </div>
          
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            © 2025 Uditya Narayan Tiwari. Sharing knowledge freely for the community.
          </p>
        </div>
      </footer>
    </div>
  );
}