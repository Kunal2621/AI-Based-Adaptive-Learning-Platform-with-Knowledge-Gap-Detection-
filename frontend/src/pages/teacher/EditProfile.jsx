import {useEffect,useState} from "react";
import API from "../../services/api";
import {useNavigate} from "react-router-dom";

export default function EditProfile(){

const navigate=useNavigate();

const [form,setForm]=useState({

fullName:"",
designation:"",
subject:"",
mobile:"",
email:"",
bio:""

});

useEffect(()=>{

load();

},[]);

const load = async () => {
  try {
    const res = await API.get("/teacher/profile");
    setForm(res.data.data);
  } catch (err) {
    console.log(err);
    alert("Failed to load profile");
  }
};

const change=(e)=>{

setForm({

...form,

[e.target.name]:e.target.value

});

}

const save = async (e) => {
  e.preventDefault();

  try {
    const res = await API.put("/teacher/profile", form);

    alert(res.data.message || "Profile Updated");

    navigate("/teacher/profile");

  } catch (err) {

    console.log(err);

    alert(
      err.response?.data?.message ||
      err.message ||
      "Update Failed"
    );

  }
};

return(

<div className="max-w-3xl mx-auto p-5">

<form
onSubmit={save}
className="bg-white rounded-xl shadow p-6 space-y-4">

<input
name="fullName"
value={form.fullName}
onChange={change}
placeholder="Name"
className="w-full border p-3 rounded"
/>

<input
name="designation"
value={form.designation}
onChange={change}
placeholder="Designation"
className="w-full border p-3 rounded"
/>

<input
name="subject"
value={form.subject}
onChange={change}
placeholder="Subject"
className="w-full border p-3 rounded"
/>

<input
name="mobile"
value={form.mobile}
onChange={change}
placeholder="Mobile"
className="w-full border p-3 rounded"
/>

<input
name="email"
value={form.email}
onChange={change}
placeholder="Email"
className="w-full border p-3 rounded"
/>

<textarea
name="bio"
value={form.bio}
onChange={change}
rows={5}
placeholder="Bio"
className="w-full border p-3 rounded"
/>

<button
type="submit"
className="bg-purple-600 text-white px-6 py-3 rounded">

Save

</button>

</form>

</div>

)

}