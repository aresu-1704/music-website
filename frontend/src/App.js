import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify/unstyled';
import {AuthProvider} from "./context/authContext";
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
import ForgotPassword from "./pages/ForgotPassword";
import NewPassword from "./pages/NewPassword";
import {MusicPlayerProvider} from "./context/musicPlayerContext";
import SearchForm from './pages/SearchForm';
import PolicyForm from "./pages/PolicyForm";
import NotFoundForm from "./pages/NotFoundForm";
import TrackDetail from "./pages/TrackDetailForm";
import AdminTrackList from "./pages/AdminTrackListForm";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <Router>
            <MusicPlayerProvider>
                <AuthProvider>
                    <MainLayout>
                        <Routes>
                            <Route path="/" element={<HomeForm />} />
                            <Route path="/albums" element={<AlbumsForm />} />
                            <Route path="/discover" element={<DiscoverForm />} />
                            <Route path="/signin" element={<SignInForm />} />
                            <Route path="/signup" element={<SignUpForm />} />
                            <Route path="/profile/:userId" element={<ProfileForm />} />
                            <Route path="/upgrade/:userId" element={<UpgradeAccount />} />
                            <Route path="/payment-result" element={<PaymentResultForm />} />
                            <Route path="/search" element={<SearchForm />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/new-password" element={<NewPassword />} />
                            <Route path="/policy" element={<PolicyForm />} />
                            <Route path="track/:trackId" element={<TrackDetail /> } />
                            <Route path="/track-management" element={<AdminTrackList /> } />

                            <Route path="/*" element={<NotFoundForm />} />
                        </Routes>
                        <ToastContainer />
                    </MainLayout>
                </AuthProvider>
            </MusicPlayerProvider>
        </Router>
    </QueryClientProvider>
);

export default App;
