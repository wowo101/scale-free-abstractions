import React from 'react';
import { BackButton } from '../components/shared';
import AttractorExplorer from '../visualizations/DynamicalSystems';

export default function DynamicalSystemsPage() {
  return (
    <>
      <BackButton accent="green" />
      <AttractorExplorer />
    </>
  );
}
