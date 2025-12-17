import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Gallery from './pages/Gallery';
import CellularAutomataExplorer from './visualizations/CellularAutomata';
import DynamicalSystemsExplorer from './visualizations/DynamicalSystems';
import CriticalitySimulation from './visualizations/Criticality';
import FitnessLandscapeExplorer from './visualizations/FitnessLandscape';
import AdaptiveCycleExplorer from './visualizations/AdaptiveCycle';
import CausalEmergenceCalculator from './visualizations/CausalEmergence';
import SystemAsAttractorExplorer from './visualizations/SystemAsAttractor';
import AssemblySpaceExplorer from './visualizations/AssemblySpace';
import AgentEmergenceExplorer from './visualizations/AgentEmergence';

// Handle GitHub Pages SPA redirect
function RedirectHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
      sessionStorage.removeItem('redirect');
      navigate(redirect, { replace: true });
    }
  }, [navigate]);
  
  return null;
}

export default function App() {
  return (
    <BrowserRouter basename="/scale-free-abstractions">
      <RedirectHandler />
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/cellular-automata" element={<CellularAutomataExplorer />} />
        <Route path="/attractors" element={<DynamicalSystemsExplorer />} />
        <Route path="/criticality" element={<CriticalitySimulation />} />
        <Route path="/fitness-landscape" element={<FitnessLandscapeExplorer />} />
        <Route path="/adaptive-cycle" element={<AdaptiveCycleExplorer />} />
        <Route path="/causal-emergence" element={<CausalEmergenceCalculator />} />
        <Route path="/identity" element={<SystemAsAttractorExplorer />} />
        <Route path="/assembly" element={<AssemblySpaceExplorer />} />
        <Route path="/agent-emergence" element={<AgentEmergenceExplorer />} />
      </Routes>
    </BrowserRouter>
  );
}
