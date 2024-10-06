'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Group, Stack, Text, Select, Modal, Slider } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause, IconX, IconTrash } from '@tabler/icons-react';
import styles from './AudioCutter.module.css';
import WaveformDisplay from '../WaveformDisplay/WaveformDisplay';
import PropTypes from 'prop-types'; 

const audioFormats = ['mp3', 'wav', 'ogg', 'aac'];

export default function AudioCutter({ onClose, file }) {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fileName, setFileName] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('mp3');
  const [volume, setVolume] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const audioContext = useRef(null);
  const sourceNode = useRef(null);
  const gainNode = useRef(null);
  const startTime = useRef(0);
  const animationFrameId = useRef(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.AudioContext)();

    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
      cancelAnimationFrame(animationFrameId.current);
      if (sourceNode.current) {
        sourceNode.current.disconnect();
      }
      if (gainNode.current) {
        gainNode.current.disconnect();
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

    // Create a new source node each time
    sourceNode.current = audioContext.current.createBufferSource();
    gainNode.current = audioContext.current.createGain();

    sourceNode.current.buffer = audioBuffer;
    sourceNode.current.connect(gainNode.current);
    gainNode.current.connect(audioContext.current.destination);
    gainNode.current.gain.setValueAtTime(volume, audioContext.current.currentTime); 
    sourceNode.current.start(0, currentTime);
    startTime.current = audioContext.current.currentTime - currentTime;
    setIsPlaying(true);

    sourceNode.current.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      cancelAnimationFrame(animationFrameId.current);
    };

    const updateTime = () => {
      if (isPlaying) {
        const newTime = audioContext.current.currentTime - startTime.current;
        setCurrentTime(newTime >= duration ? duration : newTime);
        if (newTime < duration) {
          animationFrameId.current = requestAnimationFrame(updateTime);
        }
      }
    };
    updateTime();
  };

  const pauseAudio = () => {
    if (sourceNode.current) {
      sourceNode.current.stop();
      setIsPlaying(false);
      cancelAnimationFrame(animationFrameId.current);
    }
  };

  const handleFormatChange = (value) => {
    setSelectedFormat(value);
  };

  const handleVolumeChange = (value) => {
    setVolume(value / 100); 
    if (gainNode.current) {
      gainNode.current.gain.setValueAtTime(value / 100, audioContext.current.currentTime);
    }
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

  const handleSeekChange = (value) => {
    setCurrentTime(value);
    if (isPlaying) {
      pauseAudio();
      playAudio();
    }
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
        <Group spacing="xs" align="center">
          <Text>Volume:</Text>
          <Slider
            value={volume * 100} 
            onChange={handleVolumeChange}
            min={0}
            max={100}
            style={{ width: 150 }}
          />
        </Group>
        <Button variant="filled" color="blue" disabled={!audioBuffer}>Save</Button>
      </Group>
      <Slider
        value={currentTime}
        onChange={handleSeekChange}
        min={0}
        max={duration}
        style={{ marginTop: '1rem', width: '100%' }}
      />
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

// Utility function to format time
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${tenths}`;
}

// Prop types for type checking 
AudioCutter.propTypes = {
  onClose: PropTypes.func.isRequired, 
  file: PropTypes.instanceOf(File).isRequired, 
};
