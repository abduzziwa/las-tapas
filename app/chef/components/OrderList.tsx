import React from 'react'
interface Props {
    quantity: number
    name: string
    description: string
}

const OrderList = ({ name, quantity, description }: Props) => {
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
                        {description}
                    </p>
                </div>
            </div>
        </>
    )
}

export default OrderList