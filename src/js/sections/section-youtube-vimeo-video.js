class YoutubeVimeoVideo extends HTMLElement {
  constructor() {
    super();
    this.options = JSON.parse(this.dataset.videoOptions);
    if (!this.options['videoType']) return
    this.videoId = this.dataset.videoId
    this.playerWrapper = this.querySelector('.js-video-wrapper')
    this.playerInner = this.querySelector('.js-video-mount')
    this.playBtn = this.querySelector('.js-video-play-button')
    this.loadScript().then(this.setupPlayer.bind(this));

    this.playBtn.addEventListener('click', () => {
      if (this.player.A) this.player.playVideo()
      this.playerWrapper.classList.add('is-playing')
    })
  }

  loadScript() {
    return new Promise((resolve, reject) => {
      var script = document.createElement('script');
      document.body.appendChild(script);
      script.async = true;
      script.src = this.options['videoType'] === 'youtube'
          ? '//www.youtube.com/iframe_api'
          : '//player.vimeo.com/api/player.js';
      script.onload = resolve;
      script.onerror = reject;
    });
  }

  setupPlayer() {
    const playerLoadingInterval = setInterval(() => {
      (this.options['videoType'] === 'youtube')
          ? this.youtubeSetup(playerLoadingInterval)
          : this.vimeoSetup(playerLoadingInterval)
    }, 200)
  }

  youtubeSetup(playerLoadingInterval) {
    window.YT.ready(()=> {
      this.player = new YT.Player(this.playerInner, {
        videoId: this.options['videoId'],
        playerVars: {
          rel: 0,
          height: '100%',
          width: '100%',
          iv_load_policy: 3,
          loop: 1,
          playsinline: 1,
          modestbranding: 1,
          origin: this.options['requestHost']
        },
        events: {
          onReady: this.onPlayerReady()
        }
      });

      clearInterval(playerLoadingInterval);
    })
  }

  vimeoSetup(playerLoadingInterval) {
    if (window.Vimeo) {
      this.player = new Vimeo.Player(this.playerInner.parentNode, {
        id: this.options['videoId'],
        muted: false,
        loop: true
      });

      this.player.ready().then(() => this.onPlayerReady())
      clearInterval(playerLoadingInterval);
    }
  }

  onPlayerReady() {
    this.playerWrapper.classList.add('is-loaded')
  }

}

customElements.define('video-section', YoutubeVimeoVideo);