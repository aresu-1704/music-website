import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

import SignInPage from './pages/SignIn/SignInPage'
import SignUpPage from './pages/SignUp/SignUpPage'

const App = () => (
  <Router>
    <MainLayout>
      <Routes>
        {/* <Route path="/" element={<HomePage />} /> */}
        {/* <Route path="/songs" element={<SongsPage />} />
                <Route path="/albums" element={<AlbumsPage />} />
                <Route path="/profile" element={<ProfilePage />} /> */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </MainLayout>
  </Router>
);

export default App;
