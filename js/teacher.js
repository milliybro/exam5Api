import request from "./main.js";
import { LIMIT } from "./const.js";
import { marry } from "./main.js";

const sorted = document.querySelector(".type-sort");
const teacherRow = document.querySelector(".teacher-row");
const searchInput = document.querySelector(".search-input");
const totalCategories = document.querySelector(".total-categories");
const pagination = document.querySelector(".pagination");
const categoryForm = document.querySelector(".category-form");
const categoryModal = document.querySelector("#category-modal");
const submitBtn = document.querySelector(
  ".category-form button[type='submit']"
);
const openModalBtn = document.querySelector(".open-modal-btn");
const selectDropdown = document.querySelector("#select-1");
const orderFiltering = document.querySelector('#select-2');

let search = "";
let activePage = 1;
let selected = null;
let married = "isMarried";
let sort = "Sort";
let nameOrder = "";



function getTeacherCard({
  id,
  firstName,
  lastName,
  image,
  groups,
  isMarried,
  phoneNumber,
  email,
  field,
}) {
  return `
  
  <section class="bussinesscard col-12 col-sm-6 col-md-4 ">
  <div class="flip">
    <div class="front">       
      <div class="top">       
      <div class="logo">
      <span  class="fat">
      <img src="${image}" alt="" />
          </span>
        </div>       
      </div>
      <div class="nametroduction">
        <h3 class="name">${firstName} ${lastName}</h3>
        <div class="introduction">${field}</div>
      </div>  
      <div class="contact">           
      <h2>${firstName} ${lastName}</h2>
      <a href="@${email}"> @${email}</a>
      <h3>${phoneNumber}</h3>
      <p>N-${groups.length || 2}</p>
      <div>isMarried: ${isMarried ? "married" : "single"}</div>


      <div class="d-flex btns">
        <div>
          <button editId="${id}" class="btn btn-edit" data-bs-toggle="modal" data-bs-target="#category-modal">Edit</button>
          <button deleteId="${id}" class="btn btn-delete">Delete</button>
        </div>
        <a href="student.html?teacherId=${id}" class="btn btn-student">Students</a>
      </div>         
      </div>   
    </div>
    <div class="back"></div> <!--FIXES FONT RENDERING -->
  </div>
</section>
  
  `;
}



async function getCategories() {
  try {
    teacherRow.innerHTML = `<div class="bady">
    <div class="scene">
    <div class="cube-wrapper">
      <div class="cube">
        <div class="cube-faces">
          <div class="cube-face shadow"></div>
          <div class="cube-face bottom"></div>
          <div class="cube-face top"></div>
          <div class="cube-face left"></div>
          <div class="cube-face right"></div>
          <div class="cube-face back"></div>
          <div class="cube-face front"></div>
        </div>
      </div>
    </div>
  </div>
    </div>`;

    let params = { firstName: search };

    let { data } = await request.get("teacher", { params });

    params = { ...params, page: activePage, limit: LIMIT };

    let { data: dataPgtn } = await request.get("teacher", { params });

    let len = data.length;

    let pages = Math.ceil(len / LIMIT);

    pagination.innerHTML = `<li class="page-item ${
      activePage === 1 ? "disabled" : ""
    }"><button page="-" class="page-link">Previous</button></li>`;

    for (let page = 1; page <= pages; page++) {
      pagination.innerHTML += `<li class="page-item ${
        activePage === page ? "active" : ""
      }"><button page="${page}" class="page-link">${page}</button></li>`;
    }

    pagination.innerHTML += `<li class="page-item ${
      activePage === pages ? "disabled" : ""
    }"><button page="+" class="page-link">Next</button></li>`;

    totalCategories.textContent = len;
    teacherRow.innerHTML = "";

    
    dataPgtn.map((category) => {
      teacherRow.innerHTML += getTeacherCard(category);
    });
  } catch (err) {
    console.log(err.response.data);
  }
}

getCategories();

searchInput.addEventListener("keyup", function () {
  search = this.value;
  getCategories();
});

pagination.addEventListener("click", (e) => {
  let page = e.target.getAttribute("page");
  if (page === "-") {
    activePage--;
  } else if (page === "+") {
    activePage++;
  } else {
    activePage = +page;
  }
  getCategories();
});

categoryForm.addEventListener("submit", async function (e) {
  try {
    e.preventDefault();
    if (this.checkValidity()) {
      let teacher = {
        firstName: this.firstName.value,
        lastName: this.lastName.value,
        phoneNumber: this.phoneNumber.value,
        email: this.email.value,
        groups: this.groups.value.split(/\s+/).filter((word) => word !== ""),
        image: this.image.value,
        isMarried: this.isMarried.checked,
      };
      if (selected === null) {
        await request.post("teacher", teacher);
      } else {
        await request.put(`teacher/${selected}`, teacher);
      }
      getCategories();
      bootstrap.Modal.getInstance(categoryModal).hide();
    } else {
      this.classList.add("was-validated");
    }
  } catch (err) {
    console.log(err);
  }
});

openModalBtn.addEventListener("click", function () {
  selected = null;
  submitBtn.textContent = "Add teacher";
  categoryForm.firstName.value = "";
  categoryForm.image.value = "";
  categoryForm.lastName.value = "";
  categoryForm.phoneNumber.value = "";
  categoryForm.email.value = "";
  categoryForm.groups.value = "";
  categoryForm.image.value = "";
  categoryForm.isMarried.chachked = false;
});

teacherRow.addEventListener("click", async function (e) {
  try {
    let editId = e.target.getAttribute("editId");
    let deleteId = e.target.getAttribute("deleteId");

    if (editId) {
      selected = editId;
      submitBtn.textContent = "Save teacher";
      let { data } = await request.get(`teacher/${editId}`);
      categoryForm.firstName.value = data.firstName;
      categoryForm.lastName.value = data.lastName;
      categoryForm.phoneNumber.value = data.phoneNumber;
      categoryForm.email.value = data.email;
      categoryForm.groups.value = data.groups;
      categoryForm.isMarried.value = data.isMarried;
      categoryForm.image.value = data.image;
    }
    if (deleteId) {
      let deleteConfirm = confirm(
        "Are you sure you want to delete this teacher?"
      );
      if (deleteConfirm) {
        await request.delete(`teacher/${deleteId}`);
        getCategories();
      }
    }
  } catch (err) {
    console.log(err);
  }
});

// regex
function validatePhoneNumber(input_str) {
  var re =
    /^\+998([- ])?(90|91|93|94|95|98|99|33|97|71)([- ])?(\d{3})([- ])?(\d{2})([- ])?(\d{2})$/;

  return re.test(input_str);
}
function validateForm(event) {
  var phone = document.getElementById("phoneNumber").value;
  if (!validatePhoneNumber(phone)) {
    document.getElementById("phone_error").classList.remove("hidden");
  } else {
    document.getElementById("phone_error").classList.add("hidden");
    alert("validation success");
  }
  event.preventDefault();
}

categoryForm.addEventListener("submit", validateForm);

// marry
