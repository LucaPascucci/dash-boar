import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio: HTMLAudioElement = new Audio();

  constructor() {
    // Event handling for various audio events
    this.audio.addEventListener('error', (e) => console.error('Audio error:', e));
  }

  play(): void {
    this.audio.play();
  }

  playFile(src: string): void {
    this.audio = new Audio(src);
    this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  seek(time: number): void {
    this.audio.currentTime = time;
  }

  setVolume(volume: number): void {
    this.audio.volume = volume;
  }

  setLoop(loop: boolean): void {
    this.audio.loop = loop;
  }

  on(event: string, handler: () => void): void {
    this.audio.addEventListener(event, handler);
  }

  off(event: string, handler: () => void): void {
    this.audio.removeEventListener(event, handler);
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration;
  }
}
