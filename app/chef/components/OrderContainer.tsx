import React from 'react'
import Button from './Button'
import Order from './Order'
import OrderList from './OrderList'

const OrderContainer = () => {
    return (
        <>
            <div className='flex flex-col rounded-[20px] border-solid border-[5px] border-[#FB9933] p-[12px] w-fit gap-y-[10px]'>
                <Order OrderNumber={302} TableNumber='T5' />
                <OrderList name='Vegatables' quantity={2} description='Fried vegatables with patatos' />

                <Button text='Start' color='#FB9933' />
            </div>
        </>
    )
}

export default OrderContainer