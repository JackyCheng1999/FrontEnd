import React, { Component } from 'react'
import { CTLayout } from 'layout'
import { api } from 'utils';

export class CourseAnalytics extends Component {
  componentDidMount() {
    api.contentLoaded();
  }

  render() {
    const layoutProps = CTLayout.createProps({
      transition: true,
      responsive: true,
      footer: true,
      headingProps: {
        heading: 'Course Analytics',
        icon: 'bar_chart',
        sticky: true,
        gradient: true,
        offsetTop: 30
      }
    });

    return (
      <CTLayout {...layoutProps} />
    )
  }
}