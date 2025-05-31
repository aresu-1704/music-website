import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="d-flex flex-column min-vh-100"
            style={{
                backgroundImage: `url('/images/background.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                color: 'white',
            }}
        >
            <Navbar />
            <main className="flex-fill">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
