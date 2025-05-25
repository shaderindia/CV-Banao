document.getElementById('resume-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const fields = ['name', 'email', 'phone', 'address', 'objective', 'education', 'skills', 'experience', 'software'];
  let resumeHTML = '<div style="position: relative;">';

  const photoFile = document.getElementById('photo').files[0];
  const reader = new FileReader();

  reader.onloadend = function () {
    resumeHTML += `<img src="${reader.result}" class="resume-photo">`;

    fields.forEach(id => {
      const value = document.getElementById(id).value;
      const label = id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' ');
      resumeHTML += `<h3>${label}</h3><p>${value.replace(/\n/g, '<br>')}</p>`;
    });

    resumeHTML += `
      <h3>Declaration</h3>
      <p>I hereby declare that the information given above is true to the best of my knowledge and belief.</p>
    `;

    resumeHTML += '</div>';

    document.getElementById('resume-content').innerHTML = resumeHTML;
    document.getElementById('resume-output').style.display = 'block';
  };

  if (photoFile) {
    reader.readAsDataURL(photoFile);
  } else {
    alert("Please upload a photo.");
  }
});

function printResume() {
  window.print();
}

function downloadPDF() {
  const element = document.getElementById('resume-content');
  const opt = {
    margin: 0,
    filename: 'Mechanical_Engineer_Resume.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

document.getElementById('style-select').addEventListener('change', function() {
  const selectedStyle = this.value;
  document.getElementById('theme-style').setAttribute('href', `style-${selectedStyle}.css`);
});
