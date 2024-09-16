import React from 'react'

const Header = () => {
  return (
    <div className='flex items-center gap-[14px] pl-[10px] pr-[10px] pt-[16px] pb-[16px] justify-start'>
      <button className='text-[20px] border-solid border-[3px] border-[#8A8A8A] rounded-[100px] pt-[20px] pr-[30px] pb-[20px] pl-[30px] select-none'>
        Orders
      </button>
      <button className='text-[20px] border-solid border-[3px] border-[#8A8A8A] rounded-[100px] pt-[20px] pr-[30px] pb-[20px] pl-[30px] select-none'>
        History
      </button>
      <div className='flex justify-between items-center w-full border-solid border-[1px] border-[#8A8A8A] rounded-[100px] pt-[20px] pr-[30px] pb-[20px] pl-[30px]'>
        <input type="text" placeholder='Search Orders' className='text-[20px] text-[#8A8A8A] outline-none w-full select-none' />
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="Group">
            <g id="Layer_31">
              <path id="Shape" fill-rule="evenodd" clip-rule="evenodd" d="M14.31 12.9L19.71 18.29C19.8993 18.4778 20.0058 18.7334 20.0058 19C20.0058 19.2666 19.8993 19.5222 19.71 19.71C19.5222 19.8993 19.2666 20.0058 19 20.0058C18.7334 20.0058 18.4778 19.8993 18.29 19.71L12.9 14.31C11.5025 15.407 9.77666 16.0022 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16.0022 9.77666 15.407 11.5025 14.31 12.9ZM8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2Z" fill="#8A8A8A" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}

export default Header