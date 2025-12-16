import React from 'react';
import { BackButton } from '../components/shared';
import CellularAutomataExplorer from '../visualizations/CellularAutomata';

export default function CellularAutomataPage() {
  return (
    <>
      <BackButton accent="zinc" />
      <CellularAutomataExplorer />
    </>
  );
}
