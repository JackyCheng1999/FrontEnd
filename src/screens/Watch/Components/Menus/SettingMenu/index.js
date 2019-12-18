import React, { useState, useEffect } from 'react'
import TranscriptionSetting from './TranscriptionSetting'
import CCSetting from './CCSetting'
import ADSetting from './ADSetting'
import {
  menuControl,
  SMTAB_GENERAL,
  SMTAB_TRANS,
  SMTAB_CC,
  SMTAB_AD,
} from '../../../Utils'
import './index.css'

const panes = [
  // { id: SMTAB_GENERAL, name: 'General', icon: <i className="material-icons watch-icon-icon">settings</i> },
  { id: SMTAB_TRANS, name: 'Transcriptions', icon: <i className="material-icons watch-icon-icon">menu_book</i> },
  { id: SMTAB_CC, name: 'Closed Caption', icon: <i className="fas fa-closed-captioning watch-icon-icon"></i> },
  { id: SMTAB_AD, name: 'Audio Description', icon: <i className="fas fa-audio-description watch-icon-icon"></i> },
]

function SettingMenu({
  show=false,
  onClose=null,
}) {

  const [tab, setTab] = useState(menuControl.tab())

  useEffect(() => {
    if (show) {
      setTab(menuControl.tab())
    }
  }, [show])

  const changeTab = tabId => () => {
    setTab(tabId)
    menuControl.tab(tabId)
  }

  return show ? (
    <div id="watch-setting-menu" aria-label="Setting Menu" className="watch-setting-menu">
      <button className="plain-btn watch-menu-close-btn watch-screenmode-menu-close-btn" onClick={onClose}>
        <i className="material-icons">close</i>
      </button>
      <div className="setting-container">
        <div className="setting-tabs">
          {panes.map(pane => (
            <button 
              key={pane.id}
              className="plain-btn watch-icon-listitem"
              aria-label={pane.name}
              active={Boolean(tab === pane.id).toString()}
              onClick={changeTab(pane.id)}
            >
              <span tabIndex="-1">
                {pane.icon}
                <div className="watch-icon-name">{pane.name}</div>
              </span>
            </button>
          ))}
        </div>

        <div className="setting-content">
          <TranscriptionSetting show={tab === SMTAB_TRANS} />
          <CCSetting show={tab === SMTAB_CC} />
          <ADSetting show={tab === SMTAB_AD} />
        </div>

      </div>
    </div>
  ) : null
}

export default SettingMenu