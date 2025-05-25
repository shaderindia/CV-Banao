document.getElementById('resume-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const objective = document.getElementById('objective').value;
  const education = document.getElementById('education').value;
  const skills = document.getElementById('skills').value;
  const experience = document.getElementById('experience').value;
  const software = document.getElementById('software').value;

  const photoInput = document.getElementById('photo');
  const reader = new FileReader();
  reader.onload = function(e) {
    const photoUrl = e.target.result;
    const resumeHtml = \`
      <h2>\${name}</h2>
      <img src="\${photoUrl}" style="width:300px;height:400px;float:right;margin:0 0 20px 20px;" />
      <p><strong>Email:</strong> \${email}</p>
      <p><strong>Phone:</strong> \${phone}</p>
      <p><strong>Address:</strong> \${address}</p>
      <h3>Objective</h3><p>\${objective}</p>
      <h3>Education</h3><p>\${education}</p>
      <h3>Technical Skills</h3><p>\${skills}</p>
      <h3>Experience</h3><p>\${experience}</p>
      <h3>Software Proficiency</h3><p>\${software}</p>
      <h3>Declaration</h3><p>I hereby declare that the information given above is true to the best of my knowledge and belief.</p>
    \`;

    document.getElementById('resume-content').innerHTML = resumeHtml;
    document.getElementById('resume-output').style.display = 'block';
  };
  reader.readAsDataURL(photoInput.files[0]);
});
