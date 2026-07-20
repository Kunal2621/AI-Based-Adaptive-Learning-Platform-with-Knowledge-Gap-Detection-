import API from "./api";

const courseService = {
  getAll:        (params) => API.get("/courses", { params }).then(r => r.data.data),
  getById:       (id)     => API.get(`/courses/${id}`).then(r => r.data.data),
  enroll:        (id)     => API.post(`/courses/${id}/enroll`).then(r => r.data),
  getMyEnrolled: ()       => API.get("/student/enrolled-courses").then(r => r.data.data),
  // Teacher
  create:        (data)   => API.post("/teacher/courses", data).then(r => r.data.data),
  update:        (id, d)  => API.put(`/teacher/courses/${id}`, d).then(r => r.data.data),
  delete:        (id)     => API.delete(`/teacher/courses/${id}`).then(r => r.data),
  getMyCourses:  ()       => API.get("/teacher/courses").then(r => r.data.data),
};

export default courseService;