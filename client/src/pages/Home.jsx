import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
  Avatar,
  useTheme,
  useMediaQuery,
  Divider,
  Chip
} from '@mui/material';
import {
  School,
  Assignment,
  Forum,
  Psychology,
  Timeline,
  TrendingUp,
  ArrowForward,
  Insights,
  Check,
  AutoGraph,
  SupportAgent,
  Stars
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Professional feature descriptions with specific benefits
  const features = [
    {
      title: "AI-Powered Problem Solver",
      description: "Input any math problem via text, image, or voice. Receive step-by-step solutions with detailed explanations using cutting-edge AI technology.",
      icon: <Psychology sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      path: '/solver'
    },
    {
      title: "Interactive Learning Curriculum",
      description: "Access our comprehensive library of expertly-crafted lessons covering algebra, calculus, geometry, and more—with interactive visualizations.",
      icon: <School sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      path: '/lessons'
    },
    {
      title: "Adaptive Practice Sets",
      description: "Reinforce concepts through customized practice sets that adapt to your skill level, providing immediate feedback and performance analytics.",
      icon: <Assignment sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      path: '/practice'
    },
    {
      title: "Collaborative Learning Community",
      description: "Connect with peers and educators in our moderated forums. Join study groups and participate in topic-focused discussions.",
      icon: <Forum sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      path: '/forum'
    }
  ];

  // More detailed, sequential process explanation
  const howItWorks = [
    {
      title: "Input Your Problem",
      description: "Simply type your math problem using our LaTeX editor, upload an image of the problem, or use voice input for hands-free operation.",
      icon: <Insights />,
      number: 1
    },
    {
      title: "Receive Comprehensive Solution",
      description: "Our advanced algorithm breaks down the problem, providing a detailed, step-by-step solution with explanations for each stage of the process.",
      icon: <AutoGraph />,
      number: 2
    },
    {
      title: "Deepen Understanding & Progress",
      description: "Review related lessons, attempt similar practice problems, and track your improvement over time with personalized progress analytics.",
      icon: <TrendingUp />,
      number: 3
    }
  ];

  // Professional testimonials with credentials and specific benefits mentioned
  const testimonials = [
    {
      name: "Dr. Emily Richardson, PhD",
      role: "Mathematics Department Chair, Stanford University",
      content: "MathSphere has transformed how I teach advanced calculus. The detailed solution steps mirror exactly how I guide my students through complex problems. It's like having a world-class teaching assistant available 24/7.",
      avatar: "/avatars/emily.jpg"
    },
    {
      name: "Prof. Alexander Wei, MSc",
      role: "Educational Technology Researcher, MIT",
      content: "In my 15 years researching educational platforms, MathSphere stands out for its exceptional balance of mathematical rigor and accessibility. The adaptive practice system shows a sophisticated understanding of learning progression.",
      avatar: "/avatars/alexander.jpg"
    }
  ];

  // Stats to add credibility
  const stats = [
    { value: "500,000+", label: "Problems Solved" },
    { value: "12,000+", label: "Practice Questions" },
    { value: "98%", label: "User Satisfaction" },
    { value: "150+", label: "Countries Reached" }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Hero Section - More vibrant, professional styling */}
      <Box
        sx={{
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a237e 20%, #0d47a1 50%, #283593 80%)'
            : 'linear-gradient(135deg, #42a5f5 20%, #1976d2 50%, #2196f3 80%)',
          color: 'white',
          pt: { xs: 10, md: 14 },
          pb: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
            background: 'url("/images/hero-math.svg") no-repeat center center',
            backgroundSize: 'cover',
            zIndex: 0
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.75rem' },
                  fontWeight: 800,
                  mb: 2,
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
              >
                Mastering Mathematics Through Technology
              </Typography>
              <Typography
                variant="h5"
                sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  fontWeight: 400,
                  lineHeight: 1.5
                }}
              >
                Experience the future of math learning with AI-powered problem solving, interactive lessons, and personalized practice—all in one comprehensive platform.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    fontWeight: 600,
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started For Free'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/solver')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 600,
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: 'grey.100',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  Try Solver Demo
                </Button>
              </Box>
              
              {/* Trust indicators */}
              <Box sx={{ mt: 6, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Chip 
                  icon={<SupportAgent />} 
                  label="24/7 Support" 
                  sx={{ 
                    color: 'white', 
                    bgcolor: 'rgba(255,255,255,0.15)',
                    '& .MuiChip-icon': { color: 'white' }
                  }} 
                />
                <Chip 
                  icon={<Check />} 
                  label="GDPR Compliant" 
                  sx={{ 
                    color: 'white', 
                    bgcolor: 'rgba(255,255,255,0.15)',
                    '& .MuiChip-icon': { color: 'white' }
                  }} 
                />
                <Chip 
                  icon={<Stars />} 
                  label="Top Rated" 
                  sx={{ 
                    color: 'white', 
                    bgcolor: 'rgba(255,255,255,0.15)',
                    '& .MuiChip-icon': { color: 'white' }
                  }} 
                />
              </Box>
            </Grid>
            {!isMobile && (
              <Grid item md={6}>
                <Box
                  component="img"
                  src="/images/hero-math.svg"
                  alt=""
                  sx={{
                    width: '100%',
                    maxWidth: 550,
                    height: 'auto',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                    transform: 'translateY(-20px)',
                    animation: 'float 6s ease-in-out infinite',
                    '@keyframes float': {
                      '0%': {
                        transform: 'translateY(-20px)'
                      },
                      '50%': {
                        transform: 'translateY(0px)'
                      },
                      '100%': {
                        transform: 'translateY(-20px)'
                      }
                    }
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
      
      {/* Statistics Section */}
      <Box 
        sx={{ 
          py: 3, 
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` 
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index} sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'primary.main' 
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section - Enhanced with shadows and better spacing */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{ 
            mb: 2,
            fontWeight: 700,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          Comprehensive Learning Platform
        </Typography>
        <Typography 
          variant="h6" 
          align="center" 
          color="text.secondary" 
          sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
        >
          MathSphere combines cutting-edge technology with proven pedagogical methods to deliver a seamless learning experience.
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 8px 24px rgba(0,0,0,0.4)' 
                    : '0 8px 24px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 16px 40px rgba(0,0,0,0.5)' 
                      : '0 16px 40px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(25, 118, 210, 0.05)',
                    p: 3,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  {feature.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" paragraph sx={{ mb: 3 }}>
                    {feature.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    endicon={<ArrowForward />}
                    onClick={() => navigate(feature.path)}
                    sx={{ 
                      mt: 'auto',
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        borderColor: theme.palette.primary.main
                      }
                    }}
                  >
                    Explore Feature
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section - More professional with numbered steps */}
      <Box sx={{ 
        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50', 
        py: 10,
        borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
      }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{ 
              mb: 2,
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            How MathSphere Works
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary" 
            sx={{ mb: 8, maxWidth: 700, mx: 'auto' }}
          >
            Our streamlined process makes mathematical learning and problem-solving intuitive and efficient.
          </Typography>
          
          <Grid container spacing={6}>
            {howItWorks.map((step, index) => (
              <Grid item xs={12} md={4} key={step.title}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 2,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'white',
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 4px 20px rgba(0,0,0,0.4)' 
                      : '0 4px 20px rgba(0,0,0,0.07)',
                    position: 'relative',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -16,
                      left: 'calc(50% - 20px)',
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                    }}
                  >
                    {step.number}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(25, 118, 210, 0.1)',
                        color: 'primary.main',
                        width: 70,
                        height: 70,
                        mb: 3
                      }}
                    >
                      {step.icon}
                    </Avatar>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {step.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {step.description}
                    </Typography>
                  </Box>
                  {index < howItWorks.length - 1 && !isMobile && (
                    <ArrowForward
                      sx={{
                        position: 'absolute',
                        right: -20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'primary.main',
                        fontSize: 30
                      }}
                    />
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section - Enhanced with quotes and better layout */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{ 
            mb: 2,
            fontWeight: 700,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          Trusted by Educators & Students
        </Typography>
        <Typography 
          variant="h6" 
          align="center" 
          color="text.secondary" 
          sx={{ mb: 8, maxWidth: 700, mx: 'auto' }}
        >
          Hear from our community of teachers, researchers, and students about their MathSphere experience.
        </Typography>
        
        <Grid container spacing={4}>
          {testimonials.map((testimonial) => (
            <Grid item xs={12} md={6} key={testimonial.name}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 2,
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 8px 24px rgba(0,0,0,0.4)' 
                    : '0 8px 24px rgba(0,0,0,0.1)',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: -20, 
                    left: 30, 
                    fontSize: 80, 
                    color: theme.palette.primary.main,
                    opacity: 0.2,
                    fontFamily: 'Georgia, serif'
                  }}
                >
                  "
                </Box>
                <CardContent sx={{ p: 4, pt: 5 }}>
                  <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ 
                      fontSize: '1.1rem', 
                      fontStyle: 'italic',
                      fontFamily: 'Georgia, serif',
                      lineHeight: 1.7,
                      mb: 4
                    }}
                  >
                    "{testimonial.content}"
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      sx={{ width: 64, height: 64, mr: 2, border: `2px solid ${theme.palette.primary.main}` }}
                    />
                    <Box>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Final CTA Section - More engaging with professional phrasing */}
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.main',
          color: 'white',
          py: 12,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
            background: 'url("/images/hero-math.svg") no-repeat center center',
            backgroundSize: 'cover',
            zIndex: 0
          }}
        />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.75rem' },
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.2
            }}
          >
            Ready to Transform Your Mathematical Journey?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 6, 
              opacity: 0.9,
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            Join thousands of students and educators who are already experiencing the future of mathematics education. Start for free today.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              fontWeight: 600,
              py: 1.5,
              px: 6,
              fontSize: '1.1rem',
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              }
            }}
          >
            {isAuthenticated ? 'Access Your Dashboard' : 'Sign Up Free • No Credit Card'}
          </Button>
          {!isAuthenticated && (
            <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
              Already have an account? <Button variant="text" sx={{ color: 'white', textDecoration: 'underline' }} onClick={() => navigate('/login')}>Sign In</Button>
            </Typography>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Home; 