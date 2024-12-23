import Link from 'next/link';   // Import the Link component
import logo from '../../public/logo.png';  // Import the logo image
import searchIcon from '../../public/search-icon-white.svg';  // Import the search icon image

interface TopNavBarProps {
    showSearch?: boolean;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ showSearch = true }) => {
    return (
        <nav className="flex width-full p-[10px] items-center justify-between bg-custom-gradient drop-shadow-lg">
            <div className="flex w-fit flex-col text-center items-center">
                <img className='w-fit select-none' src={logo.src} draggable="false" alt="Las Tapas Logo" />
                <h1 className="text-white text-[14px] leading-tight select-none">Las Tapas</h1>
            </div>
            {showSearch && (
                <div className='flex items-center bg-white bg-opacity-30 border border-white text-white text-sm rounded-full px-[20px] py-[10px]'>
                    <input className='w-fit bg-transparent placeholder:text-white' type="text" placeholder='Search' />
                    <img className='w-4 h-4' src={searchIcon.src} alt="" />
                </div>
            )}
        </nav>
    );
};

export default TopNavBar;
