import { Link } from "react-router-dom";
export default function AdminDashboard(){

    return(
        <div className= "w-full h-screen flex " >
            <div className="w-[350px] h-screen bg-[#00432D]">
                <button className="w-full h-[40px] text-[30px] mt-[20px] font-black flex justify-center items-center text-[#B8D700]" >Admin Dashboard</button>
                <div className='mt-[50px] items-left '>
                    <Link  className="w-full h-[40px] text-[25px] font-bold flex justify-start ml-[50px] items-center text-[#E6FED6]">Experiments</Link>
                <Link  className="w-full h-[40px] text-[25px] font-bold flex justify-start ml-[50px] mt-[0px] items-center text-[#E6FED6]">Users</Link>
                </div></div>
            <div className=" w-[calc(100vw-350px)] h-screen bg-white">

            </div>
        </div>
    )

}