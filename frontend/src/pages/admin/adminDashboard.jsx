
export default function AdminDashboard(){

    return(
        <div className= "w-full h-screen flex " >
            <div className="w-[350px] h-screen bg-red-200">
                <button className="w-full h-[40px] text-[25px] font-bold flex justify-center items-center" >Admin Dashboard</button>

            </div>
            <div className=" w-[calc(100vw-350px)] h-screen bg-blue-500">

            </div>
        </div>
    )

}