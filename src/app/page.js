'use client';

import { useState, useRef, useEffect } from 'react';
import { AppShell, Text, Button, Stack, Modal, Blockquote, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import styles from './page.module.css';
import AudioCutter from '@/components/AudioCutter/AudioCutter';
import Link from 'next/link';
import { IconLock, IconMenu2, IconX } from '@tabler/icons-react';

const navItems = [
  { icon: '🔄', label: 'Remover', value: 'remover' },
  { icon: '🔪', label: 'Splitter', value: 'splitter' },
  { icon: '🎵', label: 'Pitcher', value: 'pitcher' },
  { icon: '🎼', label: 'Key BPM Finder', value: 'bpm' },
  { icon: '✂️', label: 'Cutter', value: 'cutter' },
  { icon: '🔗', label: 'Joiner', value: 'joiner' },
  { icon: '🎙️', label: 'Recorder', value: 'recorder' },
  { icon: '🎤', label: 'Karaoke', value: 'karaoke' },
  { icon: '❓', label: 'Support', value: 'support' },
  { icon: '🇬🇧', label: 'Language', value: 'language' },
];

export default function HomePage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [active, setActive] = useState('cutter');
  const [showLanding, setShowLanding] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Toggle sidebar visibility
  const howItWorksRef = useRef(null);
  const stickyRef = useRef(null);

  const handleFileUpload = (file) => {
    setShowLanding(false);
    setUploadedFile(file);
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (stickyRef.current) {
        setIsSticky(window.scrollY > stickyRef.current.offsetTop);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AppShell
      navbar={{ width: isSidebarOpen ? 80 : 0, breakpoint: 'sm' }} // Adjust width based on sidebar visibility
      padding={0}
      className={styles.appShell}
    >
      <div className={styles.sidebarToggle}>
        {/* Toggle button to show or hide the sidebar */}
        <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
        </Button>
      </div>

      {isSidebarOpen && (
        <AppShell.Navbar className={styles.navbar}>
          <Stack spacing={0} align="center">
            {navItems.map((item) => (
              <Button
                key={item.value}
                variant="subtle"
                onClick={() => setActive(item.value)}
                className={`${styles.navButton} ${active === item.value ? styles.activeNavButton : ''}`}
              >
                <Stack spacing={5} align="center">
                  <Text size="xl">{item.icon}</Text>
                  <Text size="xs">{item.label}</Text>
                </Stack>
              </Button>
            ))}
          </Stack>
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        <div className={`${styles.stickyHeader} ${isSticky ? styles.sticky : ''}`} ref={stickyRef}>
          <Link href="#" onClick={scrollToHowItWorks} className={styles.headerLink}>HOW IT WORKS</Link>
          <Link href="/joiner" className={styles.headerLink}>JOINER</Link>
        </div>

        {showLanding ? (
          <Stack align="center" justify="flex-start" className={styles.landing}>
            <div className={styles.contentWrapper}>
              <h1 className={styles.h1}>Audio Cutter</h1>
              <h3 className={styles.h3}>Free editor to trim and cut any audio file online</h3>
              <Button variant="outline" size="md" radius="xl" onClick={() => document.getElementById('fileInput').click()} className={styles.browseButton}>
                Browse my files
              </Button>
              <input
                id="fileInput"
                type="file"
                className={styles.hiddenInput}
                onChange={(e) => handleFileUpload(e.target.files[0])}
                accept="audio/*"
              />
            </div>

            <Divider size="md" className={styles.divider} />

            <section ref={howItWorksRef} id="how-it-works" className={styles.howItWorks}>
              <h2>How to cut audio</h2>
              <div>
                <Blockquote className={styles.infoBox}>
                  <p>
                    This app can be used to trim and/or cut audio tracks, remove audio 
                    fragments. Fade in and fade out your music easily to make the audio
                    harmoniously.
                  </p>
                  <p>
                    It fast and easy to use. You can save the audio file in any format (codec 
                    parameters are configured)
                  </p>
                  <p>
                    It works directly in the browser, no needs to install any software, is available
                    for mobile devices.
                  </p>
                </Blockquote>
              </div>
              <div className={styles.privacyBox}>
                <h4>
                  <IconLock size={24} style={{ marginRight: '8px' }} />
                  Privacy and Security Guaranteed
                </h4>
                <Blockquote className={styles.infoBox}>This is serverless app. Your files does not leave your device</Blockquote>
              </div>
            </section>
          </Stack>
        ) : (
          <AudioCutter onClose={() => setShowLanding(true)} file={uploadedFile} />
        )}
      </AppShell.Main>

      <Modal opened={opened} onClose={close} title="Are you sure you want to finish editing?" centered>
        <Text size="sm">Any associated audio track settings will be deleted along with it.</Text>
        <Button color="red" onClick={close} mt="md">Yes, delete</Button>
      </Modal>
    </AppShell>
  );
}
