import React from 'react';
import OrderContainer from './components/OrderContainer';
import styles from './components/chef.module.css';

const Page = () => {
    return (
        <>
            <main className={`${styles.mainChef} grid place-items-center w-100`}>
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
