import Link from 'next/link';  // Import the Link component
import homeIcon from '../../public/home-icon.svg';  // Import the home icon image
import historyIcon from '../../public/history-icon.svg';  // Import the history icon image
import cartIcon from '../../public/cart-icon.svg';  // Import the cart icon image
import billIcon from '../../public/bill-icon.svg';  // Import the bill icon image

export default function BottomNavBar() {
    return (
        <div className='flex w-full h-fit px-[10px] py-[8px] fixed bottom-0 left-0 right-0 '>
            <div className='flex flex-row flex-1 justify-between px-[26px] py-[12px] bg-gradient-to-tr from-main to-gradientEnd drop-shadow-lg rounded-full'>
                <Link href='/'>
                    <img src={homeIcon.src} alt="Home Icon" />
                </Link>
                <Link href='/order-history'>
                    <img src={historyIcon.src} alt="History Icon" />
                </Link>
                <Link href='/cart'>
                    <img src={cartIcon.src} alt="Cart Icon" />
                </Link>
                <Link href='/bill'>
                    <img src={billIcon.src} alt="Bill Icon" />
                </Link>
            </div>
        </div>
    );
}
