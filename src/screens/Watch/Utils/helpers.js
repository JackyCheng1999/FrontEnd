import $ from 'jquery'
import _ from 'lodash'
import autosize from 'autosize'
import { cc_colorMap, CC_COLOR_BLACK } from './constants.util'
// import { videoControl } from './player.control'

export function findUpNextMedia({
  currMediaId='',
  playlists=[{ medias: [] }],
}) {
  let playlistResults = _.map( 
    playlists, 
    pl => _.map(
      pl.medias.slice().reverse(), 
      me => ({ ...me, playlistId: pl.id})
    ) 
  )
  playlistResults = _.flatten(playlistResults)

  let upNextIdx = _.findIndex(playlistResults, { id: currMediaId }) + 1
  let upNext = playlistResults[upNextIdx] || null
  return upNext
}

export function parseSec(d) {
  if (d === undefined) return '';
  d = Number(d);
  if ( d < 0 ) return ''
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  var hDisplay = h > 0 ? h + ":" : "";
  var mDisplay = m > 0 ? m > 9 ? m + ":" : "0" + m + ":" : "00:";
  var sDisplay = s > 9 ? s : "0" + s;
  return hDisplay + mDisplay + sDisplay; 
}

export function timeStrToSec(str) {
  const strs = str.split(':')
  let len3 = strs.length > 2
  let sec = (len3 ? parseFloat(strs[2]) : parseFloat(strs[1])) || 0
  let min = (len3 ? parseFloat(strs[1]) : parseFloat(strs[0])) * 60 || 0
  let hr = (len3 ? parseFloat(strs[0]) : 0) * 3600 || 0
  return sec + min + hr
}

export function prettierTimeStr(str) {
  const strs = str.split(':')
  var mins = parseInt(strs[0]) * 60 + parseInt(strs[1])
  mins = mins.toString()
  if (mins.length === 1) mins = '0' + mins
  var sec  = parseInt(strs[2])
  sec = sec.toString()
  if (sec.length === 1) sec = '0' + sec
  return `${mins}:${sec}`
}

export function getCCSelectOptions(array=[], operation=item => item) {
  const options = []
  array.forEach( item => {
    let text = operation(item)
    options.push({ text, value: item })
  })
  return options
}

export function colorMap(color=CC_COLOR_BLACK, opacity=1) {
  const colorStr = cc_colorMap[color]
  if (!colorStr) return CC_COLOR_BLACK
  return colorStr.replace('*', opacity)
}

export function autoSize(e) {
  let elem = e.target || e
  autosize(elem);
}

async function autoHelper () {
  let textareas = $('textarea')
    for (let i = 0; i < textareas.length; i++) {
      await setTimeout(() => {
        // autosize(document.querySelectorAll('textarea'));
        autosize(textareas[i]);
      }, 200);
    }
}
export function autoSizeAllTextAreas(timeout=0) {
  return;
  setTimeout(() => {
    autoHelper()
  }, timeout);
}


/** handle Share */
// Get share url
export function getShareableURL(time=0) {
  const { origin, pathname, search } = window.location
  let url = origin + pathname + search
  if (time > 0) {
    url += `&begin=${Math.floor(time)}`
  }

  return url
}