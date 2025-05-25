// Variable to store the uploaded photo's data URL
let photoDataURL = "";

// Handle photo upload and preview
document.getElementById("photo").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      photoDataURL = e.target.result; // Store the photo's Base64 data URL
      const preview = document.getElementById("photo-preview");
      preview.style.backgroundImage = `url(${photoDataURL})`; // Show preview
    };
    reader.readAsDataURL(file);
  }
});

// Handle resume generation
document.getElementById("resume-form").addEventListener("submit", function (event) {
  event.preventDefault();

  // Retrieve form data
  const nameAndDesignation = document.getElementById("name-designation").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const objective = document.getElementById("objective").value;
  const education = document.getElementById("education").value;
  const skills = document.getElementById("skills").value;
  const experience = document.getElementById("experience").value;
  const languages = document.getElementById("languages").value;
  const software = document.getElementById("software").value;
  const declaration = document.getElementById("declaration").value;

  // Generate the resume content
  const output = `
    <div id="photo-in-resume" style="background-image: url('${photoDataURL}');"></div>
    <h2>${nameAndDesignation}</h2>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Address:</strong> ${address}</p>
    <h3>Objective</h3>
    <p>${objective}</p>
    <h3>Education</h3>
    <p>${education}</p>
    <h3>Skills</h3>
    <p>${skills}</p>
    <h3>Experience</h3>
    <p>${experience}</p>
    <h3>Languages</h3>
    <p>${languages}</p>
    <h3>Software</h3>
    <p>${software}</p>
    <h3>Declaration</h3>
    <p>${declaration}</p>
  `;

  document.getElementById("resume-content").innerHTML = output;
  document.getElementById("resume-output").style.display = "block";
});

// Handle PDF download in A4 size
document.getElementById("download-pdf").addEventListener("click", function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    format: "a4",
    unit: "mm",
  });

  const content = document.getElementById("resume-content");

  doc.html(content, {
    callback: function (doc) {
      doc.save("resume.pdf"); // Save the PDF file
    },
    x: 10,
    y: 10,
    width: 190, // Ensure proper scaling within A4 size
    windowWidth: 800,
  });
});