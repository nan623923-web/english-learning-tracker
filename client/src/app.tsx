import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import CheckinsPage from './pages/checkins';
import NotFound from './pages/NotFound/NotFound';

const RoutesComponent: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CheckinsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
