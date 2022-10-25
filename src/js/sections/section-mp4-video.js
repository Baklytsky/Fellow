class MP4Video extends HTMLElement {
  constructor() {
    super();
    this.video = this.querySelector('.media-video')
    this.pauseBtn = this.querySelector('.pause-button')
    this.playBtn = this.querySelector('.play-button')
    this.muteBtn = this.querySelector('.mute-video')

    if (this.playBtn) this.playBtn.addEventListener('click', ()=> this.videoPlay())
    if (this.pauseBtn) this.pauseBtn.addEventListener('click', ()=> this.videoPause())
    if (this.muteBtn) this.muteBtn.addEventListener('click', ()=> this.videoMute())
    if (this.pauseBtn || this.playBtn) this.video.addEventListener('click', (e)=> this.checkVideoState(e))
  }

  checkVideoState(e) {
    e.preventDefault();
    (this.video.paused) ? this.videoPlay() : this.videoPause()
  }

  videoPlay() {
    this.video.play()
    if (this.playBtn) this.playBtn.classList.add('hidden')
    if (this.pauseBtn) this.pauseBtn.classList.remove('hidden')
  }

  videoPause() {
    this.video.pause()
    if (this.playBtn) this.playBtn.classList.remove('hidden')
    if (this.pauseBtn) this.pauseBtn.classList.add('hidden')
  }

  videoMute() {
    const muted = this.video.hasAttribute('muted');
    (muted)
        ? this.video.removeAttribute('muted')
        : this.video.setAttribute('muted', '')
    if (this.muteBtn) this.muteBtn.classList.toggle('unmute-video')
  }
}

customElements.define('mp4-video', MP4Video);