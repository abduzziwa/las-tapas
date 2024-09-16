import React from 'react';
import OrderContainer from './components/OrderContainer';
import Header from './components/Header';

const Page = () => {
    return (
        <>
            <main className='grid place-items-center w-100'>
                <header className='w-[100%]'>
                    <Header />
                </header>
                <div className='grid grid-cols-4 gap-[16px] mt-[10px] mb-[10px]'>
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                    <OrderContainer />
                </div>
            </main>
        </>
    );
}

export default Page;
