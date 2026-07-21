import {useEffect,useState} from "react";
import API from "../../services/api";
import {useNavigate} from "react-router-dom";

export default function Profile(){

const navigate=useNavigate();

const [teacher,setTeacher]=useState({
fullName:"",
designation:"",
subject:"",
bio:"",
mobile:"",
email:"",
rating:0
});

useEffect(()=>{

fetchProfile();

},[]);

const fetchProfile=async()=>{

try{

const res=await API.get("/teacher/profile");

setTeacher(res.data.data);

}
catch(err){

console.log(err);

}

}

const initials=teacher.name
?teacher.name.split(" ").map(x=>x[0]).join("").substring(0,2).toUpperCase()
:"T";

return(

<div className="max-w-5xl mx-auto p-5">

<div className="bg-white rounded-xl shadow p-6">

<div className="flex flex-col md:flex-row justify-between items-center">

<div className="flex items-center gap-5">

<div className="w-20 h-20 rounded-full bg-purple-600 text-white flex justify-center items-center text-3xl font-bold">

{initials}

</div>

<div>

<h1 className="text-2xl font-bold">

{teacher.nameName}

</h1>

<p>{teacher.designation}</p>

<p>{teacher.subject}</p>

<p>

⭐ {teacher.rating}

</p>

</div>

</div>

<div className="flex gap-3 mt-5 md:mt-0">

<button

onClick={()=>navigate("/teacher/profile/view")}

className="bg-blue-600 text-white px-5 py-2 rounded"

>

View Details

</button>

<button

onClick={()=>navigate("/teacher/profile/edit")}

className="bg-green-600 text-white px-5 py-2 rounded"

>

Edit Details

</button>

</div>

</div>

</div>

</div>

)

}