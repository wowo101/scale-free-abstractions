import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Gallery from './pages/Gallery';
import CellularAutomataExplorer from './visualizations/CellularAutomata';
import DynamicalSystemsExplorer from './visualizations/DynamicalSystems';
import CriticalitySimulation from './visualizations/Criticality';
import FitnessLandscapeExplorer from './visualizations/FitnessLandscape';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/cellular-automata" element={<CellularAutomataExplorer />} />
        <Route path="/attractors" element={<DynamicalSystemsExplorer />} />
        <Route path="/criticality" element={<CriticalitySimulation />} />
        <Route path="/fitness-landscape" element={<FitnessLandscapeExplorer />} />
      </Routes>
    </BrowserRouter>
  );
}
