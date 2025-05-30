import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">{children}</main>
            <Footer />
        </div>
    );
};

export default MainLayout;
