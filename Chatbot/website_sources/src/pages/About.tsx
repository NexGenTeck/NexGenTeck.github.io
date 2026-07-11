import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Users, Target, Award, Heart } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const TEAM_IMAGE_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 320'><rect width='320' height='320' rx='28' fill='%2311151a'/><circle cx='160' cy='118' r='54' fill='%23f97316' fill-opacity='0.18'/><circle cx='160' cy='112' r='36' fill='%23fb923c' fill-opacity='0.9'/><path d='M84 258c15-47 53-72 76-72s61 25 76 72' fill='%23fb923c' fill-opacity='0.9'/></svg>";

const teamMembers = [
  {
    name: 'Muhammad Kaleem',
    role: 'Founder & CEO',
    image: '/team/member-1.jpg',
  },
  {
    name: 'Muhammad Hasaan',
    role: 'AI/ML Engineer & DevOps',
    image: '/team/member-2.jpg',
  },
  {
    name: 'Kashif Khan',
    role: 'HR Executive',
    image: '/team/member-3.jpg',
  },
  {
    name: 'Asma Masood',
    role: 'Frontend Developer',
    image: '/team/member-4.jpg',
  },
  {
    name: 'Waiz Hussain',
    role: 'Mobile App Developer & SEO',
    image: '/team/member-5.jpg',
  },
  {
    name: 'Subhana Zaki',
    role: 'Blogging & Social Media Marketing',
    image: '/team/member-6.jpg',
  },
  {
    name: 'Irfan Iqbal',
    role: 'Full Stack Developer',
    image: '/team/member-7.jpg',
  },
  {
    name: 'Sana Arif',
    role: 'Backend Developer',
    image: '/team/member-8.jpg',
  },
  {
    name: 'Anum Ejaz',
    role: 'Software Quality Assurance Engineer',
    image: '/team/member-9.jpg',
  },
] as const;

type TeamMember = (typeof teamMembers)[number];

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

const TeamCard: React.FC<TeamCardProps> = ({ member, index }) => (
  <AnimatedSection delay={index * 0.06} className="w-full max-w-[240px]">
    <motion.div
      whileHover={{
        y: -8,
        x: index % 2 === 0 ? 3 : -3,
        rotate: index % 2 === 0 ? 1 : -1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="team-card group relative mx-auto flex flex-col overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-b from-gray-900 via-black to-gray-950 text-center shadow-[0_18px_45px_rgba(0,0,0,0.35)] shadow-orange-500/5 transition-colors duration-300 hover:border-orange-500/45 hover:shadow-[0_22px_55px_rgba(249,115,22,0.18)]"
      style={{ width: '240px', height: '330px' }}
    >
      <div className="team-image-wrapper relative overflow-hidden bg-[#050505]" style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={member.image}
          alt={member.name}
          className="team-image transition-transform duration-500 group-hover:scale-[1.03]"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center center',
          }}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = TEAM_IMAGE_FALLBACK;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent pointer-events-none" />
        <div className="absolute inset-x-5 bottom-4 h-px bg-gradient-to-r from-transparent via-orange-400/80 to-transparent pointer-events-none" />
      </div>

      <div className="team-info flex flex-col items-center justify-center px-4" style={{ height: '70px' }}>
        <h3 className="text-base font-semibold leading-tight text-white">{member.name}</h3>
        <p className="mt-1 max-w-[22ch] text-xs leading-tight text-gray-300 text-center">
          {member.role}
        </p>
      </div>
    </motion.div>
  </AnimatedSection>
);

export const About: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const values = [
    {
      icon: <Target className="w-12 h-12" />,
      titleKey: 'about.values.innovation',
      descKey: 'about.values.innovation.desc',
    },
    {
      icon: <Users className="w-12 h-12" />,
      titleKey: 'about.values.collaboration',
      descKey: 'about.values.collaboration.desc',
    },
    {
      icon: <Award className="w-12 h-12" />,
      titleKey: 'about.values.excellence',
      descKey: 'about.values.excellence.desc',
    },
    {
      icon: <Heart className="w-12 h-12" />,
      titleKey: 'about.values.passion',
      descKey: 'about.values.passion.desc',
    },
  ];

  const partners = [
    {
      name: 'Medicare Pharma',
      logo: '/partners/medicare-pharma.jpg',
      logoScale: 1.45,
      imageFit: 'cover',
    },
    {
      name: 'Saifee Labs',
      logo: '/partners/saifee-healthcare.png',
      logoScale: 1,
      imageFit: 'contain',
    },
    {
      name: 'Urban Healthcare',
      logo: '/partners/urban-healthcare.png',
      logoScale: 1,
      imageFit: 'contain',
    },
  ] as const;

  const getTeamMember = (name: string) =>
    teamMembers.find((member) => member.name === name)!;

  const ceo = getTeamMember('Muhammad Kaleem');

  const departmentHeads = [
    getTeamMember('Kashif Khan'),
    getTeamMember('Muhammad Hasaan'),
    getTeamMember('Asma Masood'),
    getTeamMember('Irfan Iqbal'),
  ];

  const departmentMembers = [
    getTeamMember('Waiz Hussain'),
    getTeamMember('Sana Arif'),
    getTeamMember('Anum Ejaz'),
    getTeamMember('Subhana Zaki'),
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section - Dark Theme */}
      <section className="relative hero-dark text-white py-20">
        <div className="hero-network"></div>
        <div className="hero-glow-lines"></div>
        <div className="hero-particles"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">{t('about.title')}</h1>
            <p className="text-xl text-white/90">
              {t('about.subtitle')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection direction="left">
              <h2 className="text-4xl lg:text-5xl text-gray-900 mb-6">{t('about.story')}</h2>
              <p className="text-lg text-gray-600 mb-4">
                {t('about.story.p1')}
              </p>
              <p className="text-lg text-gray-600 mb-4">
                {t('about.story.p2')}
              </p>
              <p className="text-lg text-gray-600">
                {t('about.story.p3')}
              </p>
            </AnimatedSection>
            <AnimatedSection direction="right">
              <div className="rounded-2xl shadow-2xl overflow-hidden bg-[#e3b186] p-6">
                <div className="w-full h-[420px] rounded-xl overflow-hidden flex items-center justify-center bg-[#e3b186]">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1702047135360-e549c2e1f7df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwc3RhcnR1cCUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NjQ0MTI5Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Tech Workspace"
                    className="w-full h-full rounded-xl object-contain"
                    style={{
                      transform: 'scale(0.82)',
                    }}
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('about.values')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.values.subtitle')}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="text-orange-500 flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl text-gray-900 mb-3">{t(value.titleKey)}</h3>
                  <p className="text-gray-600">{t(value.descKey)}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('about.partners')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.partners.subtitle')}
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {partners.map((partner, index) => (
              <AnimatedSection key={partner.name} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="group h-full rounded-2xl border border-orange-500/20 bg-white p-6 shadow-lg hover:shadow-2xl hover:border-orange-500/50 transition-all flex flex-col items-center justify-between"
                  style={{ minHeight: '300px' }}
                >
                  <div className="w-full h-44 flex items-center justify-center rounded-xl bg-white overflow-hidden">
                    <img
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      className="w-full h-full rounded-xl transition-transform duration-300"
                      style={{
                        objectFit: partner.imageFit,
                        transform: `scale(${partner.logoScale})`,
                      }}
                    />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-gray-900 text-center">
                    {partner.name}
                  </h3>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-16 text-center">
            <p className="text-lg text-gray-600 mb-8">
              {t('about.partners.text')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 bg-gray-950">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl lg:text-5xl text-white mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('about.team.subtitle')}
            </p>
          </AnimatedSection>

          <div className="relative mx-auto max-w-6xl">
            <div className="relative z-10 mb-16 flex justify-center">
              <TeamCard member={ceo} index={0} />
              <div className="pointer-events-none absolute left-1/2 top-full hidden h-8 w-px -translate-x-1/2 bg-orange-500/40 lg:block" />
            </div>

            <div className="relative mb-16 grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[-2rem] hidden h-px bg-orange-500/40 lg:block" />
              {departmentHeads.map((member, index) => (
                <div key={member.name} className="relative z-10 w-full max-w-[240px]">
                  <div className="pointer-events-none absolute left-1/2 top-[-2rem] hidden h-8 w-px -translate-x-1/2 bg-orange-500/40 lg:block" />
                  <TeamCard member={member} index={index + 1} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {departmentMembers.map((member, index) => (
                <div key={member.name} className="relative z-10 w-full max-w-[240px]">
                  <div className="pointer-events-none absolute left-1/2 top-[-4rem] hidden h-16 w-px -translate-x-1/2 bg-orange-500/40 lg:block" />
                  <TeamCard member={member} index={index + 5} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 text-center text-white">
              <h2 className="text-4xl lg:text-5xl mb-6">{t('about.cta.title')}</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                {t('about.cta.subtitle')}
              </p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSd5SpUZsZ0Fd6b5E-RS2ZjnuVFEufiNb4GbLvfLzyxbaytO1Q/viewform?pli=1" target="_blank"
                className="inline-block bg-white text-orange-500 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                {t('about.cta.button')}
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};
