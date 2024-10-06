'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Group, Stack, Text, Select, Modal } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause, IconX, IconTrash } from '@tabler/icons-react';
import styles from './AudioCutter.module.css';
import WaveformDisplay from '../WaveformDisplay/WaveformDisplay';

const audioFormats = ['mp3', 'wav', 'ogg', 'aac'];

export default function AudioCutter({ onClose, file }) {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fileName, setFileName] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('mp3');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const audioContext = useRef(null);
  const sourceNode = useRef(null);
  const startTime = useRef(0);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.AudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const decodedAudio = await audioContext.current.decodeAudioData(arrayBuffer);
    setAudioBuffer(decodedAudio);
    setDuration(decodedAudio.duration);
    setFileName(file.name);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const playAudio = () => {
    if (!audioBuffer) return;

    sourceNode.current = audioContext.current.createBufferSource();
    sourceNode.current.buffer = audioBuffer;
    sourceNode.current.connect(audioContext.current.destination);
    sourceNode.current.start(0, currentTime);
    startTime.current = audioContext.current.currentTime - currentTime;
    setIsPlaying(true);

    sourceNode.current.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const updateTime = () => {
      if (isPlaying) {
        const newTime = audioContext.current.currentTime - startTime.current;
        setCurrentTime(newTime >= duration ? duration : newTime);
        if (newTime < duration) {
          requestAnimationFrame(updateTime);
        }
      }
    };
    updateTime();
  };

  const pauseAudio = () => {
    if (sourceNode.current) {
      sourceNode.current.stop();
      setIsPlaying(false);
    }
  };

  const handleFormatChange = (value) => {
    setSelectedFormat(value);
  };

  const handleDeleteAudio = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setAudioBuffer(null);
    setFileName('');
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setShowDeleteModal(false);
  };

  return (
    <Stack spacing={0} className={styles.container}>
      <Group position="apart" className={styles.header}>
      <Text className={styles.fileName}>{fileName || 'No file selected'}</Text>
        <Group>
          <Button variant="subtle" color="red" onClick={handleDeleteAudio}><IconTrash size={18} /></Button>
          <Button variant="subtle" color="gray" onClick={onClose}><IconX size={18} /></Button>
        </Group>
      </Group>
      <div className={styles.waveformContainer}>
        <WaveformDisplay audioBuffer={audioBuffer} currentTime={currentTime} duration={duration} />
      </div>
      <Group position="apart" className={styles.controls}>
        <Button onClick={isPlaying ? pauseAudio : playAudio} variant="subtle" color="gray" disabled={!audioBuffer}>
          {isPlaying ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
        </Button>
        <Group spacing="xs">
          <Text>{formatTime(currentTime)}</Text>
          <Text>/</Text>
          <Text>{formatTime(duration)}</Text>
        </Group>
        <Group spacing="xs" align="center">
          <Text>Format:</Text>
          <Select
            data={audioFormats}
            value={selectedFormat}
            onChange={handleFormatChange}
            style={{ minWidth: 100 }}
          />
        </Group>
        <Button variant="filled" color="blue" disabled={!audioBuffer}>Save</Button>
      </Group>
      <Modal opened={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Audio" centered>
        <Text size="sm">Are you sure you want to delete the current audio? This action cannot be undone.</Text>
        <Group position="right" mt="md">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </Stack>
  );
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${tenths}`;
}