'use client';

import { useRef, useEffect } from 'react';
import styles from './WaveformDisplay.module.css';

export default function WaveformDisplay({ audioBuffer, currentTime, duration }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !audioBuffer) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear the canvas
    ctx.fillStyle = '#1A1B1E';
    ctx.fillRect(0, 0, width, height);

    // Draw the waveform
    ctx.fillStyle = '#00FF00';
    const centerY = height / 2;
    const channelData = audioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / width);

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = channelData[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      const y1 = ((1 + min) * height) / 2;
      const y2 = ((1 + max) * height) / 2;
      ctx.fillRect(i, y1, 1, y2 - y1);
    }

    // Draw playback position
    const playbackX = (currentTime / duration) * width;
    ctx.fillStyle = 'white';
    ctx.fillRect(playbackX, 0, 2, height);

  }, [audioBuffer, currentTime, duration]);

  return (
    <canvas ref={canvasRef} width={800} height={200} className={styles.waveform} />
  );
}