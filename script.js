function addEducation() {
  const section = document.getElementById("education-section");
  const entry = document.createElement("div");
  entry.className = "edu-entry";
  entry.innerHTML = '<textarea placeholder="Education detail"></textarea>';
  section.insertBefore(entry, section.lastElementChild);
}

function addExperience() {
  const section = document.getElementById("experience-section");
  const entry = document.createElement("div");
  entry.className = "exp-entry";
  entry.innerHTML = '<textarea placeholder="Experience detail"></textarea>';
  section.insertBefore(entry, section.lastElementChild);
}

document.getElementById("resume-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const theme = document.getElementById("theme").value;
  document.body.className = theme;

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const objective = document.getElementById("objective").value;
  const skills = document.getElementById("skills").value;
  const software = document.getElementById("software").value;

  const educations = [...document.querySelectorAll(".edu-entry textarea")].map(el => el.value).join("<br>");
  const experiences = [...document.querySelectorAll(".exp-entry textarea")].map(el => el.value).join("<br>");

  const photo = document.getElementById("photo").files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const photoUrl = e.target.result;
    const html = \`
      <h2>\${name}</h2>
      <img src="\${photoUrl}" />
      <p><strong>Email:</strong> \${email}</p>
      <p><strong>Phone:</strong> \${phone}</p>
      <p><strong>Address:</strong> \${address}</p>
      <h3>Objective</h3><p>\${objective}</p>
      <h3>Education</h3><p>\${educations}</p>
      <h3>Experience</h3><p>\${experiences}</p>
      <h3>Technical Skills</h3><p>\${skills}</p>
      <h3>Software Proficiency</h3><p>\${software}</p>
      <h3>Declaration</h3><p>I hereby declare that the information given above is true to the best of my knowledge and belief.</p>
    \`;
    document.getElementById("resume-content").innerHTML = html;
    document.getElementById("resume-output").style.display = "block";
  };
  reader.readAsDataURL(photo);
});

async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const content = document.getElementById("resume-content");
  await html2canvas(content).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const imgProps= doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    doc.save("resume.pdf");
  });
}


let cropper;
let croppedImage = '';

document.getElementById("photo").addEventListener("change", function (e) {
  const image = document.getElementById("crop-image");
  const file = e.target.files[0];
  if (file) {
    image.src = URL.createObjectURL(file);
    image.style.display = "block";
    if (cropper) cropper.destroy();
    cropper = new Cropper(image, {
      aspectRatio: 3 / 4,
      viewMode: 1,
    });
  }
});

function cropPhoto() {
  if (cropper) {
    const canvas = cropper.getCroppedCanvas({
      width: 300,
      height: 400,
    });
    croppedImage = canvas.toDataURL();
    alert("Photo cropped and ready!");
  }
}

// Override resume submit to use cropped image
document.getElementById("resume-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const theme = document.getElementById("theme").value;
  document.body.className = theme;

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const objective = document.getElementById("objective").value;
  const skills = document.getElementById("skills").value;
  const software = document.getElementById("software").value;

  const educations = [...document.querySelectorAll(".edu-entry textarea")].map(el => el.value).join("<br>");
  const experiences = [...document.querySelectorAll(".exp-entry textarea")].map(el => el.value).join("<br>");

  if (!croppedImage) {
    alert("Please upload and crop a photo.");
    return;
  }

  const html = \`
    <h2>\${name}</h2>
    <img src="\${croppedImage}" />
    <p><strong>Email:</strong> \${email}</p>
    <p><strong>Phone:</strong> \${phone}</p>
    <p><strong>Address:</strong> \${address}</p>
    <h3>Objective</h3><p>\${objective}</p>
    <h3>Education</h3><p>\${educations}</p>
    <h3>Experience</h3><p>\${experiences}</p>
    <h3>Technical Skills</h3><p>\${skills}</p>
    <h3>Software Proficiency</h3><p>\${software}</p>
    <h3>Declaration</h3><p>I hereby declare that the information given above is true to the best of my knowledge and belief.</p>
  \`;
  document.getElementById("resume-content").innerHTML = html;
  document.getElementById("resume-output").style.display = "block";
});
