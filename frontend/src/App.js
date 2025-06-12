import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify/unstyled';
import {AuthProvider} from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

//Điều hướng
import SignInForm from './pages/SignInForm'
import SignUpForm from './pages/SignUpForm'
import HomeForm from './pages/HomeForm';
import ProfileForm from './pages/ProfileForm';
import AlbumsForm from './pages/AlbumsForm';
import DiscoverForm from './pages/DiscoverForm';
import UpgradeAccount from "./pages/UpgradeAccountForm";
import PaymentResultForm from "./pages/PaymentResultForm";


const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <Router>
            <AuthProvider>
                <MainLayout>
                    <Routes>
                        <Route path="/" element={<HomeForm />} />
                        {/* <Route path="/songs" element={<SongsPage />} /> */}
                        <Route path="/albums" element={<AlbumsForm />} />
                        <Route path="/discover" element={<DiscoverForm />} />
                        <Route path="/signin" element={<SignInForm />} />
                        <Route path="/signup" element={<SignUpForm />} />
                        <Route path="/profile/:userId" element={<ProfileForm />} />
                        <Route path="/upgrade/:userId" element={<UpgradeAccount />} />
                        <Route path="/payment-result" element={<PaymentResultForm />} />
                    </Routes>
                    <ToastContainer />
                </MainLayout>
            </AuthProvider>
        </Router>
    </QueryClientProvider>
);

export default App;
