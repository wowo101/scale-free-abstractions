import React from 'react';
import { BackButton } from '../components/shared';
import FitnessLandscape from '../visualizations/FitnessLandscape';

export default function FitnessLandscapePage() {
  return (
    <>
      <BackButton accent="indigo" />
      <FitnessLandscape />
    </>
  );
}
