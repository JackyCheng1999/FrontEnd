import React, { useState } from 'react'
import { IconButton, Button } from '@material-ui/core'
import { Input, Form } from 'semantic-ui-react'
import { Spinner } from 'react-bootstrap'
import { handleData, api } from 'utils'

export default function Captions({ captions, setReadyToEdit, setCurrTime, reLoadCaption }) {
  return (
    <div 
      className="captions" 
      onMouseEnter={setReadyToEdit} 
      onMouseLeave={setReadyToEdit}
    >
      {captions.map( line => (
        <CaptionLine 
          line={line} 
          key={line.id} 
          setCurrTime={setCurrTime} 
          reLoadCaption={reLoadCaption}
        />
      ))}
    </div>
  )
}

function CaptionLine({ line, setCurrTime, reLoadCaption }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { text, index, id, begin } = line

  const SeekToCaption = e => {
    setCurrTime(e, handleData.timeStrToSec(begin))
  }

  const onEditCaption = e => {
    setIsLoading(() => true)
    reLoadCaption(() => {
      setIsEditing(() => true)
      setIsLoading(() => false)
    })
  }

  const onClose = () => {
    setIsEditing(() => false)
  }

  const onSave = line => {
    api.updateCaptionLine(line, () => {
      console.log('success update line')
    })
    onClose()
  }

  if (isLoading) return <LineLoader index={index} />
  if (isEditing) return <LineEditor line={line} onClose={onClose} onSave={onSave} />

  return (
    <div className="line" id={`line-${index}`} >
      <div className="likes">
        {handleData.timeBetterLook(begin)}
        <IconButton className="icon">
          <i className="material-icons">thumb_down</i>
        </IconButton>&ensp;
        <span className="num">20</span>
        <IconButton className="icon">
          <i className="material-icons">thumb_up</i>
        </IconButton>&ensp;
        <span className="num">31</span>
      </div>

      <div 
        className="text" 
        tabIndex={1}
        onClick={SeekToCaption}
      >
        {text}&ensp;<i className="material-icons">play</i>
      </div>

      <div className="edit">
        <IconButton className="icon" onClick={onEditCaption}>
          <i className="material-icons">edit</i>
        </IconButton>
        <IconButton className="icon">
          <i className="material-icons">share</i>
        </IconButton>
      </div>
    </div>
  )
}

function LineEditor({ line, onClose, onSave }) {
  const { text, index, id, begin } = line
  const [newText, setNewText] = useState(text)
  const handleSave = () => {
    line.text = newText
    onSave(line)
  }
  return (
    <div className="line" id={`line-${index}`} >
      <Input 
        defaultValue={text} 
        onChange={({target: {value}}) => setNewText(() => value)} 
      />
      <div>
        <Button className="edit-button" onClick={handleSave}>
          Save
        </Button>
        <Button className="edit-button" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function LineLoader({ index }) {
  return (
    <div className="line d-flex justify-content-center" id={`line-${index}`} >
      <Spinner animation="border" variant="light" />
    </div>
  )
}