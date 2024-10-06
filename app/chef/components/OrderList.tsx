import React from 'react'
interface Props {
    quantity: number
    name: string
    modification: string
}

const OrderList = ({ name, quantity, modification }: Props) => {
    return (
        <>
            <div className='flex'>
                <div className='mr-5'>
                    <p className='font-bold'>
                        {quantity} X
                    </p>
                </div>

                <div>
                    <p className='font-bold'>
                        {name}
                    </p>
                    <p>
                        {modification}
                    </p>
                </div>
            </div>
        </>
    )
}

export default OrderList