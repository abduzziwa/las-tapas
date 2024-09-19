import React from 'react'

const MealComponent = () => {
  return (
    <div className='flex flex-col w-1/2 h-[150px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-black bg-[url("../public/food.png")] bg-cover bg-center'>
<p className='text-white text-[28px] font-bold drop-shadow-lg leading-tight'>
    Food
</p>
<p className='text-white text-[24px] leading-tight font-light drop-shadow-lg'>
    Discription
</p>
    </div>
  )
}

export default MealComponent
