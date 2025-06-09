import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import 'bootstrap/dist/css/bootstrap.min.css';

//Điều hướng
import SignInPage from './pages/SignIn/SignInPage'
import SignUpPage from './pages/SignUp/SignUpPage'
import HomePage from './pages/Home/HomePage';


import { ToastContainer } from 'react-toastify/unstyled';
import {AuthProvider} from "./context/AuthContext";

const App = () => (
  <Router>
      <AuthProvider>
          <MainLayout>
              <Routes>
                  <Route path="/" element={<HomePage />} />
                  {/* <Route path="/songs" element={<SongsPage />} />
                    <Route path="/albums" element={<AlbumsPage />} /> */}

                  <Route path="/signin" element={<SignInPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
              </Routes>
              <ToastContainer />
          </MainLayout>
      </AuthProvider>
  </Router>
);

export default App;
