import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { links, uurl } from 'utils';
import './index.css';

import {
  connectWithRedux,
  setup,
  filterControl,
  NEW_OFFERING,
  // NEW_OFFERING_ID,
  ARRAY_INIT,
  NEW_OFFERING_ID,
} from '../../Utils';

import { Filter } from '../Filter';
import { ListItem } from '../ListItem';
import OfferingList from './OfferingList';

function SideBarWithRedux({ terms = [], offerings = [], offering = {}, sidebar }) {
  const [results, setResults] = useState([]);
  const history = useHistory();
  // Filtering actions
  const onFilter = (value) => filterControl.filterOfferings(value, offerings, setResults);
  const onReverse = () => filterControl.reverse(results, setResults);

  const handleOfferingClick = (off, updateSearch) => () => {
    setup.changeOffering(off, updateSearch);
  };

  const chooseOffering = () => {
    let { offId } = uurl.useSearch();
    if (!offId) {
      offId = history.location.pathname.split('/')[2];
    }

    if (offId) {
      // if the offeringId is in params
      // If it's the artifical id for new offering
      if (offId === NEW_OFFERING_ID) {
        // handleOfferingClick(NEW_OFFERING)()
        // Otherwise find and then go to the offering by id
      } else {
        const off = _.find(offerings, { id: offId });
        if (!off) {
          // if the id is not valid or does not exist
          handleOfferingClick(offerings[0] || NEW_OFFERING)();
        } else {
          handleOfferingClick(off, false)();
        }
      }
      // if no id is specified, go to the first offering
      // or the new offering when the offerings is empty
    } else if (offerings[0]) {
      handleOfferingClick(offerings[0])();
    } else {
      history.push(links.instNewOffering());
    }
  };

  useEffect(() => {
    if (offerings === ARRAY_INIT) return;

    setResults(offerings);
    // if (Boolean(offering.id)) return;
    chooseOffering();
  }, [offerings]);

  // the margin style for displaying or hiding the sidebar
  const style = { marginLeft: sidebar ? '0' : '-20rem' };

  return (
    <aside className="op-sidebar ip-sidebar" style={style}>
      <div className="ip-sidebar-con" data-scroll>
        {/* Title */}
        <div className="ip-sb-title ct-d-r-center-v">
          <i className="material-icons" aria-hidden="true">
            collections_bookmark
          </i>
          <h2>my courses</h2>
        </div>

        <div className="w-100 ct-list-col ip-sb-filter">
          {/* New Offering Trigger */}
          <ListItem
            dark
            icon="add"
            title=" NEW COURSE"
            current={uurl.isEqual(links.instNewOffering())}
            rightIcon="small"
            onClick={handleOfferingClick(NEW_OFFERING)}
          />

          {/* Filter */}
          <Filter searchFor="Courses" onFilter={onFilter} onReverse={onReverse} />
        </div>

        {/* Offerings  */}
        <OfferingList
          results={results}
          noOffering={offerings.length === 0}
          currTermId={terms[0] ? terms[0].id : ''}
          currOfferingId={offering.id}
          handleOfferingClick={handleOfferingClick}
        />
      </div>
    </aside>
  );
}

export const Sidebar = connectWithRedux(SideBarWithRedux, [
  'sidebar',
  'terms',
  'offerings',
  'offering',
]);
