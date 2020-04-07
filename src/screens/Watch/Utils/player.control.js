/**
 * Functions for controlling video players
 */
import _ from 'lodash'
import { userAction, api } from '../../../utils'
import { transControl } from './trans.control'
import { preferControl } from './preference.control'
import { isMobile } from 'react-device-detect'
// import { menuControl } from './menu.control'

import { 
  NORMAL_MODE, PS_MODE, NESTED_MODE, /** THEATRE_MODE, */
  CTP_PLAYING, CTP_LOADING, CTP_ENDED, CTP_UP_NEXT, CTP_ERROR, HIDE_TRANS,
} from './constants.util'
import { setup } from './setup.control'


function onFullScreenChange(e) {
  const { setFullscreen } = videoControl.externalFunctions
  if (videoControl.isFullscreen) {
    setFullscreen(false)
    transControl.transView(transControl.LAST_TRANS_VIEW, { updatePrefer: false })
    videoControl.isFullscreen = false
    // videoControl.mode(videoControl.LAST_SCREEN_MODE)
  } else {
    setFullscreen(true)
    transControl.transView(HIDE_TRANS, { updatePrefer: false })
    videoControl.isFullscreen = true
    // videoControl.mode(NORMAL_MODE)
  }
}

export const videoControl = {
  videoNode1: null,
  videoNode2: null,
  duration: 0,
  isFullscreen: false,

  // setVolume, setPause, setPlaybackrate, setTime, setMute, setTrans, 
  // switchScreen, setMode, setCTPPriEvent, setCTPSecEvent, 
  // changeVideo, timeUpdate
  externalFunctions: {}, 

  init(videoNode1, videoNode2, props) {
    this.videoNode1 = videoNode1
    this.videoNode2 = videoNode2
    const { 
      // media, watchHistory, offeringId,
      changeVideo, timeUpdate,
      setMode, switchScreen, setVolume, setPause, 
      setPlaybackrate, setMute, setFullscreen,
      setDuration, setBufferedTime, setTime,
      setCTPPriEvent, setCTPSecEvent
    } = props

    this.externalFunctions = {  
      changeVideo, timeUpdate,
      setMode, switchScreen, setFullscreen,
      setVolume, setMute, setPause, setPlaybackrate,
      setDuration, setTime, setBufferedTime,
      setCTPPriEvent, setCTPSecEvent
    }
    
    this.addEventListenerForFullscreenChange()
    this.addEventListenerForMouseMove()
    this.playbackrate(preferControl.defaultPlaybackRate())

    if (this.videoNode2) {
      this.SCREEN_MODE = PS_MODE
    }
  },

  clear() {
    this.isSwitched = false
    this.isFullscreen = false
    this.SCREEN_MODE = NORMAL_MODE

    this.video1CanPlay = false
    this.video2CanPlay = false
    this.canPlayDone = false

    this.lastTime = 0
    this.lastUpdateCaptionTime = 0
    this.lastSendUATime = 0
    this.lastBuffered = 0
    this.ctpPriEvent = CTP_LOADING
    this.ctpSecEvent = CTP_LOADING
  },

  isTwoScreen() {
    return Boolean(this.videoNode2)
  },

  isSwitched: false,
  switchVideo(bool) {
    if (!Boolean(this.videoNode2)) return;
    const toSet = bool === undefined ? !this.isSwitched : bool
    const { switchScreen } = this.externalFunctions
    if (switchScreen) switchScreen(toSet)
    this.isSwitched = toSet
  },  

  SCREEN_MODE: NORMAL_MODE,
  LAST_SCREEN_MODE: NORMAL_MODE,
  mode(mode, config={}) {
    const { setMode } = this.externalFunctions
    const { sendUserAction=true, restore=false } = config
    if (setMode) {
      if (window.innerWidth <= 900 && mode === PS_MODE) {
        mode = NESTED_MODE
      } else if (restore) {
        mode = this.LAST_SCREEN_MODE
      }
      // if (mode === THEATRE_MODE) {
      //   transControl.transView(HIDE_TRANS)
      // }
      setMode(mode)
      this.LAST_SCREEN_MODE = this.SCREEN_MODE
      this.SCREEN_MODE = mode
      if (sendUserAction) userAction.screenmodechange(this.currTime(), mode)
    }
  },
  addWindowEventListener() {
    const that = this
    if (isMobile) {
      window.addEventListener('orientationchange', () => {
        // console.log('window.orientation', window.orientation)
        if ([90, -90].includes(window.orientation)) {
          if (that.currTime() > 0) {
            that.enterFullScreen()
          }
        }
      })
    } else {
      window.addEventListener('resize', () => {
        if (window.innerWidth < 900) {
          if (that.SCREEN_MODE === PS_MODE) {
            that.mode(NESTED_MODE, { sendUserAction: false })
          } 
        }
      })
    }
  },

  PAUSED: true,
  paused() {
    if (!this.videoNode1) return;
    return this.videoNode1.paused
  },

  handlePause(bool) {
    if (!this.videoNode1) return;
    if (bool === undefined) bool = this.videoNode1.paused
    if (Boolean(bool)) {
      this.play()
    } else {
      this.pause() 
    }
  },

  pause() {
    if (this.videoNode1) this.videoNode1.pause()
    if (this.videoNode2) this.videoNode2.pause()

    const { setPause } = this.externalFunctions
    if (setPause) {
      setPause(true)
      this.PAUSED = true
      userAction.pause(this.currTime())
      this.sendMediaHistories()
    }
  },

  play()  {
    if (this.videoNode1) this.videoNode1.play()
    if (this.videoNode2) this.videoNode2.play()

    const { setPause } = this.externalFunctions
    if (setPause) {
      setPause(false)
      this.PAUSED = false
      userAction.play(this.currTime())
    }
  },

  currTime(time) {
    if (!this.videoNode1) return;
    if (time === undefined) return this.videoNode1.currentTime

    this.videoNode1.currentTime = time
    if (this.videoNode2) this.videoNode2.currentTime = time

    const { setTime } = this.externalFunctions
    if (setTime) {
      setTime(time)
      transControl.updateCaption(time)
      this.sendMediaHistories()
    }
  },
  forward(sec=10) {
    if (!this.videoNode1) return;
    let now = this.currTime()
    if (now + sec < this.duration) {
      this.currTime(now + sec)
    } else {
      this.currTime(this.duration)
    }
  },
  rewind(sec=10) {
    if (!this.videoNode1) return;
    let now = this.currTime()
    if (now - sec > 0) {
      this.currTime(now - sec)
    } else {
      this.currTime(0)
    }
  },
  seekToPercentage(p=0) {
    if (typeof p !== 'number' || p > 1 || p < 0) return;
    let seekTo = this.duration * p
    this.currTime(seekTo)
  },

  replay() {
    this.currTime(0)
    this.play()
  },

  mute(bool) {
    if (!this.videoNode1) return;
    const toSet = bool === undefined ? !this.videoNode1.muted : bool
    this.videoNode1.muted = toSet

    const { setMute } = this.externalFunctions
    if (setMute) setMute(toSet)
  },

  volume(volume) {
    if (!this.videoNode1) return;
    if (volume === undefined) return this.videoNode1.volume
    
    if (this.videoNode1.muted) this.videoNode1.muted = false
    this.videoNode1.volume = Number(volume)

    const { setVolume } = this.externalFunctions
    if (setVolume) setVolume(Number(volume))
  },

  playbackrate(playbackRate) {
    if (!this.videoNode1) return;
    if (playbackRate === undefined) return this.videoNode1.playbackRate
    this.videoNode1.playbackRate = playbackRate
    if (this.videoNode2) this.videoNode2.playbackRate = playbackRate

    const { setPlaybackrate } = this.externalFunctions
    if (setPlaybackrate) setPlaybackrate(playbackRate)
    preferControl.defaultPlaybackRate(playbackRate)
    userAction.changespeed(this.currTime(), playbackRate)
  },
  playbackRateIncrement() {
    if (!this.videoNode1) return;
    let currPlaybackRate = this.videoNode1.playbackRate
    if (currPlaybackRate + 0.25 <= 4) this.playbackrate( currPlaybackRate + 0.25 )
  },
  playbackRateDecrease() {
    if (!this.videoNode1) return;
    let currPlaybackRate = this.videoNode1.playbackRate
    if (currPlaybackRate - 0.25 >= 0.25) this.playbackrate( currPlaybackRate - 0.25 )
  },


  /** Fullscreen */
  addEventListenerForFullscreenChange() {
    const { setFullscreen } = this.externalFunctions
    if (setFullscreen && !isMobile) {
      document.removeEventListener('fullscreenchange', onFullScreenChange, true)
      document.addEventListener('fullscreenchange', onFullScreenChange, true)
    }
  },

  handleFullScreen() {
    if (!this.isFullscreen || isMobile) {
      this.enterFullScreen()
    } else {
      this.exitFullScreen()
    }
  },

  enterFullScreen() {
    if (!this.videoNode1) return;
    try {
      var elem = document.getElementById("watch-page") || {}
      if (isMobile) {
        elem = document.getElementById(this.isSwitched ? 'ct-video-2' : 'ct-video-1') || {}
      }
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.webkitEnterFullscreen) { /* Safari IOS Mobile */
        elem.webkitEnterFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      } 
      userAction.fullscreenchange(this.currTime(), true)
    } catch (error) {
      console.error('Failed to enter fullscreen.')
    }
  },

  exitFullScreen() {
    try {
      if (isMobile) {
        const elem = document.getElementById(this.isSwitched ? 'ct-video-2' : 'ct-video-1') || {}
        // console.log(elem.webkitExitFullscreen)
      }
      if (!this.videoNode1) return;
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
      userAction.fullscreenchange(this.currTime(), false)
    } catch (error) {
      console.error('Failed to exit fullscreen.')
    }
  },

  /**
   * Media events
   * ***********************************************************************************************
   */
  onPause(e, paused) {
    // this.showControlBar()
    if (paused === false) {
      this.pause()
    }
  },

  onDurationChange({ target: { duration } }) {
    const { setDuration } = this.externalFunctions
    setDuration(duration)
    this.duration = duration
  },

  /** Timing */
  lastTime: 0,
  lastUpdateCaptionTime: 0,
  lastSendUATime: 0,
  onTimeUpdate({ target: { currentTime } }) {
    const { timeUpdate } = this.externalFunctions
    // Set current time
    if (Math.abs(currentTime - this.lastUpdateCaptionTime) >= 1) {
      // setTime(currentTime)
      this.lastTime = currentTime
      let nextCaption = transControl.updateTranscript(currentTime)
      timeUpdate([currentTime, nextCaption])
      this.lastUpdateCaptionTime = currentTime
    } 
    if (Math.abs(currentTime - this.lastSendUATime) >= 15) {
      userAction.timeupdate(this.currTime())
      this.lastSendUATime = currentTime
      this.sendMediaHistories()
    } 
  },

  lastBuffered: 0,
  onProgress({ target: { buffered, currentTime, duration } }) {
    // console.log('buffered', buffered)
    if (duration > 0) {
      for (var i = 0; i < buffered.length; i++) {
        if (buffered.start(buffered.length - 1 - i) < currentTime) {
          document.getElementById("buffered-amount").style.width = (buffered.end(buffered.length - 1 - i) / duration) * 100 + "%";
          break;
        }
      }
    }
  },

  ctpPriEvent: CTP_LOADING,
  ctpSecEvent: CTP_LOADING,
  setCTPEvent(event=CTP_PLAYING, priVideo=true) {
    const { setCTPPriEvent, setCTPSecEvent } = this.externalFunctions
    if (priVideo) {
      setCTPPriEvent(event)
      this.ctpPriEvent = event
    } else {
      setCTPSecEvent(event)
      this.ctpSecEvent = event
    }
  },

  onLoadStart(e, priVideo=true) {
    this.setCTPEvent(CTP_LOADING, priVideo)
  },

  onLoadedData(e, priVideo=true) {
    this.setCTPEvent(CTP_PLAYING, priVideo)
  },

  video1CanPlay: false,
  video2CanPlay: false,
  canPlayDone: false,
  onCanPlay(e, priVideo) {
    if (this.canPlayDone || !preferControl.autoPlay()) return;
    if (priVideo) { 
      this.video1CanPlay = true
      if (this.video2CanPlay || !Boolean(this.videoNode2)) {
        this.canPlayDone = true
        return this.play()
      }
    } else {
      this.video2CanPlay = true
      if (this.video1CanPlay) {
        this.canPlayDone = true
        return this.play()
      }
    }
  },

  onWaiting(e, priVideo=true) {
    this.setCTPEvent(CTP_LOADING, priVideo)
  },

  onPlaying(e, priVideo=true) {
    if (this.PAUSED) this.play()
    this.setCTPEvent(CTP_PLAYING, priVideo)
  },

  onEnded(e) {
    this.setCTPEvent(CTP_ENDED)
    this.pause()
  },

  onError(e, priVideo=true) {
    this.setCTPEvent(CTP_ERROR, priVideo)
  },

  onSeeking(e) {
    if (this.ctpPriEvent === CTP_ENDED || this.ctpPriEvent === CTP_UP_NEXT) {
      this.setCTPEvent(CTP_PLAYING)
    }
    userAction.seeking(this.currTime())
  },

  onSeeked(e) {
    userAction.seeked(this.currTime())
  },




  /** 
   * Helpers 
   * ***********************************************************************************************
   */

  findUpNextMedia({
    currMediaId='',
    playlist,
  }) {
    let { next } = setup.findNeighbors(currMediaId, playlist)
    return next
  },

  async sendMediaHistories() {
    let { id, playlistId } = setup.media()
    if (id) {
      await api.sendMediaWatchHistories(id, playlistId, this.currTime())
    }
  },

  timeOut: null,
  addEventListenerForMouseMove() {
    // let video = this
    // window.addEventListener('mousemove', function() {
    //   clearTimeout(this.timeOut);
    //   // only start the timer if the video is not paused
    //   if ( !video.paused() ) {
    //       $("#watch-ctrl-bar").show();

    //       this.timeOut = setTimeout(function () {
    //       $("#watch-ctrl-bar").fadeOut();
    //       }, 2500);
    //   }
    // })
  },
  showControlBar() {
    // $("#watch-ctrl-bar").show();
    // clearTimeout(this.timeOut);
  },
}