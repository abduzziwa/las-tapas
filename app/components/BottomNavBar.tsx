import Link from 'next/link';  // Import the Link component
import homeIcon from '../../public/home-icon.svg';  // Import the home icon image
import historyIcon from '../../public/history-icon.svg';  // Import the history icon image
import cartIcon from '../../public/cart-icon.svg';  // Import the cart icon image
import billIcon from '../../public/bill-icon.svg';  // Import the bill icon image

const BottomNavbar: React.FC = () => {
    <div className='flex w-full h-fit px-[10px] py-[8px] bg-gradient-to-tr from-main to-gradientEnd drop-shadow-lg'>
        <div className='px-[26px] py-[12px]'>
            <Link href='/'>
                <img src={homeIcon.src} alt="Home Icon" />
            </Link>
            <Link href='/'>
                <img src={historyIcon.src} alt="Home Icon" />
            </Link>
            <Link href='/'>
                <img src={cartIcon.src} alt="Home Icon" />
            </Link>
            <Link href='/'>
                <img src={billIcon.src} alt="Home Icon" />
            </Link>
        </div>
    </div>
}

export default BottomNavbar;