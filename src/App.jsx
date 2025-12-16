import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Gallery from './pages/Gallery';
import CellularAutomataPage from './pages/CellularAutomataPage';
import DynamicalSystemsPage from './pages/DynamicalSystemsPage';
import CriticalityPage from './pages/CriticalityPage';
import FitnessLandscapePage from './pages/FitnessLandscapePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/cellular-automata" element={<CellularAutomataPage />} />
        <Route path="/attractors" element={<DynamicalSystemsPage />} />
        <Route path="/criticality" element={<CriticalityPage />} />
        <Route path="/fitness-landscape" element={<FitnessLandscapePage />} />
      </Routes>
    </BrowserRouter>
  );
}
