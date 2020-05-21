import { isMobile } from 'react-device-detect';
import { CTPreference } from 'utils';

import { LINE_VIEW, TRANSCRIPT_VIEW, SEARCH_TRANS_IN_VIDEO } from './constants.util';

/**
 * Functions for controlling user preference
 */
const AUTO_PLAY = 'watch-pref-auto-play';
const DEFAULT_PLAYBACK_RATE = 'watch-pref-placyback-rate';
const DEFAULT_VOLUME = 'watch-pref-volume';
const DEFAULT_MUTED = 'watch-pref-muted';
const CC_ON = 'wath-pref-cc-on';
const AD_ON = 'wath-pref-ad-on';
const DEFAULT_TRANS_VIEW = 'watch-pref-trans-view';
const TRANS_AUTO_SCROLL = 'watch-pref-auto-scroll';
const PAUSE_WHILE_AD = 'watch-pref-pause-ad';
const PAUSE_WHILE_EDITING = 'watch-pref-pause-edit';
const DEFAULT_SEARCH_OPTION = 'watch-pref-search-opt';

const SHOW_CAPTION_TIPS = 'watch-pref-cap-tip';

class WatchPreference extends CTPreference {
  constructor() {
    super();
    this[AUTO_PLAY] = !this.isFalse(AUTO_PLAY);
    this[CC_ON] = this.isTrue(CC_ON);
    this[AD_ON] = this.isTrue(AD_ON);
    this[DEFAULT_MUTED] = this.isTrue(DEFAULT_MUTED);
    this[PAUSE_WHILE_EDITING] = this.isTrue(PAUSE_WHILE_EDITING);
    this[PAUSE_WHILE_AD] = this.isTrue(PAUSE_WHILE_AD);
    this[TRANS_AUTO_SCROLL] = !this.isFalse(TRANS_AUTO_SCROLL);
    this[DEFAULT_TRANS_VIEW] = this.isTrue(DEFAULT_TRANS_VIEW);
    this[DEFAULT_SEARCH_OPTION] = this.isTrue(DEFAULT_SEARCH_OPTION);

    this[SHOW_CAPTION_TIPS] = !this.isFalse(SHOW_CAPTION_TIPS);
  }

  showCaptionTips(bool) {
    if (isMobile) return false;
    return this.localStorage(SHOW_CAPTION_TIPS, bool, true);
  }

  autoPlay(bool) {
    if (isMobile) return false;
    return this.localStorage(AUTO_PLAY, bool, true);
  }

  cc(bool) {
    return this.localStorage(CC_ON, bool);
  }

  ad(bool) {
    return this.localStorage(AD_ON, bool);
  }

  pauseWhileEditing(bool) {
    if (isMobile) return false;
    return this.localStorage(PAUSE_WHILE_EDITING, bool);
  }

  pauseWhileAD(bool) {
    return this.localStorage(PAUSE_WHILE_AD, bool);
  }

  autoScroll(bool) {
    return this.localStorage(TRANS_AUTO_SCROLL, bool, true);
  }

  muted(bool) {
    return this.localStorage(DEFAULT_MUTED, bool);
  }

  defaultVolume(vol) {
    let volume = vol;
    if (volume === undefined) {
      volume = localStorage.getItem(DEFAULT_VOLUME);
      if (!volume) return 1;
      return parseFloat(volume);
    }
    localStorage.setItem(DEFAULT_VOLUME, volume.toString());
  }

  defaultPlaybackRate(rate) {
    let pbrate = rate;
    if (pbrate === undefined) {
      pbrate = localStorage.getItem(DEFAULT_PLAYBACK_RATE);
      if (!pbrate) return 1;
      return parseFloat(pbrate);
    }
    localStorage.setItem(DEFAULT_PLAYBACK_RATE, pbrate.toString());
  }

  defaultTransView(view) {
    if (isMobile) return TRANSCRIPT_VIEW;
    if (view === undefined) {
      return localStorage.getItem(DEFAULT_TRANS_VIEW) || LINE_VIEW; // TRANSCRIPT_VIEW//
    }
    localStorage.setItem(DEFAULT_TRANS_VIEW, view);
  }

  defaultSearchOption(opt) {
    if (opt === undefined) {
      return localStorage.getItem(DEFAULT_SEARCH_OPTION) || SEARCH_TRANS_IN_VIDEO;
    }
    localStorage.setItem(DEFAULT_SEARCH_OPTION, opt);
  }
}

export const preferControl = new WatchPreference();
