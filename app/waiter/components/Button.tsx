import React from 'react'
interface Props {
    text: string,
    color: string
}

const Button = ({ text, color }: Props) => {
    return (
        <button className='font-bold text-[35px] py-[10px] px-[50px] rounded-[12px]' style={{ background: color }}>{text}</button>
    )
}

export default Button