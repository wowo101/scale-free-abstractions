import React from 'react';
import { BackButton } from '../components/shared';
import CriticalitySimulation from '../visualizations/Criticality';

export default function CriticalityPage() {
  return (
    <>
      <BackButton accent="cyan" />
      <CriticalitySimulation />
    </>
  );
}
