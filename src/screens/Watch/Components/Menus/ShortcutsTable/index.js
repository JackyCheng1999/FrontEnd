import React from 'react'
import { shortcuts } from '../../../Utils'
import './index.css'

function ShortcutsTable({
  show=false,
  onClose=null,
}) {
  return show ? (
    <div id="watch-shortcuts-table-container">
      <div className="w-100 d-flex justify-content-between">
        <h2 className="shortcuts-table-h2">Keyboard Shortcuts</h2>
        <button className="plain-btn watch-menu-close-btn" onClick={onClose}>
          <i className="material-icons">close</i>
        </button>
      </div>
      <span className="shortcuts-table-row">
        {shortcuts.map( catagory => (
          <div className="shortcuts-table-col" key={catagory.name}>
            <h3 className="shortcuts-table-h3">{catagory.name}</h3>
            <table className="shortcuts-table">
              <tbody>
                {catagory.rows.map( row => (
                  <tr className="shortcuts-tr" key={row.action}>
                    <td className="shortcuts-des">{row.action}</td>
                    <td className="shortcuts-key">
                      {row.keys.map( (key, index) => (
                        <ShortcutKey skey={key} key={`${row.action}-${index}`} index={index} />
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </span>
    </div>
  ) : null
}

export function ShortcutKey({ skey, index }) {
  let prefix = index > 0 ? ' or ' : ''
  let { key1, key2 } = skey
  return (
    <>
      {prefix}
      <kbd>{key1}</kbd>
      {key2 && <> + <kbd>{key2}</kbd></>}
    </>
  )
}

export default ShortcutsTable