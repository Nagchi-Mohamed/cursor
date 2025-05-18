import React from 'react';
import {
  Box,
  Container,
  Grid,
  Link,
  Typography,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const theme = useTheme();
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: t('footer.about'),
      links: [
        { text: t('footer.aboutUs'), href: '/about' },
        { text: t('footer.careers'), href: '/careers' },
        { text: t('footer.press'), href: '/press' }
      ]
    },
    {
      title: t('footer.support'),
      links: [
        { text: t('footer.help'), href: '/help' },
        { text: t('footer.contact'), href: '/contact' },
        { text: t('footer.faq'), href: '/faq' }
      ]
    },
    {
      title: t('footer.legal'),
      links: [
        { text: t('footer.privacy'), href: '/privacy' },
        { text: t('footer.terms'), href: '/terms' },
        { text: t('footer.cookies'), href: '/cookies' }
      ]
    }
  ];

  const socialLinks = [
    { icon: <FacebookIcon />, href: 'https://facebook.com/mathsphere' },
    { icon: <TwitterIcon />, href: 'https://twitter.com/mathsphere' },
    { icon: <LinkedInIcon />, href: 'https://linkedin.com/company/mathsphere' },
    { icon: <GitHubIcon />, href: 'https://github.com/mathsphere' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === 'light' 
          ? theme.palette.grey[100] 
          : theme.palette.grey[900],
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-evenly">
          {sections.map((section) => (
            <Grid item xs={12} sm={4} md={3} key={section.title}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                {section.title}
              </Typography>
              <Box>
                {section.links.map((link) => (
                  <Box key={link.text} sx={{ mb: 0.5 }}>
                    <Link
                      href={link.href}
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                          color: 'primary.main'
                        }
                      }}
                    >
                      {link.text}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: 5,
            pt: 3,
            borderTop: `1px solid ${
              theme.palette.mode === 'light'
                ? theme.palette.grey[200]
                : theme.palette.grey[800]
            }`,
            textAlign: 'center'
          }}
        >
          <Box sx={{ mb: 2 }}>
            {socialLinks.map((link) => (
              <IconButton
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit MathSphere on ${link.href.split('.com/')[1]}`}
                sx={{
                  mx: 1,
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                {link.icon}
              </IconButton>
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} MathSphere. {t('footer.allRightsReserved')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 