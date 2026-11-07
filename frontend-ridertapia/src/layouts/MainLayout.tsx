import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useCarrito from '../hooks/useCarrito';

const MainLayout = () => {
    const { cantidadTotal } = useCarrito();

    return (
        <>
            <Navbar cantidadCarrito={cantidadTotal} />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default MainLayout;